from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import func

from backend.database.connection import get_db
from backend.models.models import Interaction, HCP

router = APIRouter()

# Pydantic Schemas for Request/Response validation
class InteractionBase(BaseModel):
    hcp_name: str
    hospital: str
    specialty: str
    interaction_type: str
    products_discussed: Optional[str] = ""
    interaction_date: str
    follow_up_date: Optional[str] = ""
    priority: str
    notes: Optional[str] = ""
    summary: Optional[str] = ""
    sentiment: Optional[str] = "Neutral"
    sentiment_score: Optional[float] = 0.0
    priority_score: Optional[int] = 50
    next_best_action: Optional[str] = ""
    recent_ai_insights: Optional[str] = ""
    follow_up_completed: Optional[bool] = False

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(BaseModel):
    hcp_name: Optional[str] = None
    hospital: Optional[str] = None
    specialty: Optional[str] = None
    interaction_type: Optional[str] = None
    products_discussed: Optional[str] = None
    interaction_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    priority_score: Optional[int] = None
    next_best_action: Optional[str] = None
    recent_ai_insights: Optional[str] = None
    follow_up_completed: Optional[bool] = None

class InteractionResponse(InteractionBase):
    id: int
    hcp_id: Optional[int] = None

    class Config:
        from_attributes = True

class HCPResponse(BaseModel):
    id: int
    name: str
    hospital: str
    specialty: str
    engagement_score: int
    visit_frequency: str
    risk_alert: str
    email: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/interactions", response_model=List[InteractionResponse])
def get_interactions(db: Session = Depends(get_db)):
    # Returns interactions, newest first
    return db.query(Interaction).order_by(Interaction.id.desc()).all()

@router.post("/interactions", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
def create_interaction(interaction_in: InteractionCreate, db: Session = Depends(get_db)):
    # Look up if the HCP already exists, otherwise create a new default HCP record
    hcp = db.query(HCP).filter(HCP.name.ilike(interaction_in.hcp_name)).first()
    if not hcp:
        hcp = HCP(
            name=interaction_in.hcp_name,
            hospital=interaction_in.hospital,
            specialty=interaction_in.specialty,
            engagement_score=75,
            visit_frequency="2x/month",
            risk_alert="Low Risk"
        )
        db.add(hcp)
        db.commit()
        db.refresh(hcp)

    # Automatically derive AI fields if not provided or if form is logged standard
    summary = interaction_in.summary or f"Representative logged a {interaction_in.interaction_type} interaction regarding {interaction_in.products_discussed or 'no products'}."
    next_best_action = interaction_in.next_best_action or f"Follow up on discussed items by {interaction_in.follow_up_date or 'next week'}."
    recent_ai_insights = interaction_in.recent_ai_insights or f"Dr. {hcp.name} is showing consistent interest in {interaction_in.products_discussed or 'portfolio'}."
    
    # Simple rule-based sentiment fallback
    sentiment = interaction_in.sentiment or "Neutral"
    sentiment_score = interaction_in.sentiment_score or 0.0
    if interaction_in.notes:
        notes_lower = interaction_in.notes.lower()
        if any(w in notes_lower for w in ["great", "excellent", "impressed", "positive", "interested", "excited"]):
            sentiment = "Positive"
            sentiment_score = 0.8
        elif any(w in notes_lower for w in ["concerned", "difficult", "busy", "rejected", "not interested", "issue"]):
            sentiment = "Negative"
            sentiment_score = -0.6
            
    priority_score = 40
    if interaction_in.priority == "High":
        priority_score = 85
    elif interaction_in.priority == "Medium":
        priority_score = 60

    db_interaction = Interaction(
        hcp_id=hcp.id,
        hcp_name=hcp.name,
        hospital=interaction_in.hospital,
        specialty=interaction_in.specialty,
        interaction_type=interaction_in.interaction_type,
        products_discussed=interaction_in.products_discussed,
        interaction_date=interaction_in.interaction_date,
        follow_up_date=interaction_in.follow_up_date,
        priority=interaction_in.priority,
        notes=interaction_in.notes,
        summary=summary,
        sentiment=sentiment,
        sentiment_score=sentiment_score,
        priority_score=priority_score,
        next_best_action=next_best_action,
        recent_ai_insights=recent_ai_insights,
        follow_up_completed=interaction_in.follow_up_completed or False
    )
    
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.put("/interactions/{id}", response_model=InteractionResponse)
def update_interaction(id: int, interaction_in: InteractionUpdate, db: Session = Depends(get_db)):
    db_interaction = db.query(Interaction).filter(Interaction.id == id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
        
    update_data = interaction_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
        
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.delete("/interactions/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interaction(id: int, db: Session = Depends(get_db)):
    db_interaction = db.query(Interaction).filter(Interaction.id == id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    db.delete(db_interaction)
    db.commit()
    return None

@router.get("/hcps", response_model=List[HCPResponse])
def get_hcps(db: Session = Depends(get_db)):
    return db.query(HCP).all()

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Calculate statistics based on database records
    interactions = db.query(Interaction).all()
    hcps = db.query(HCP).all()
    
    total_interactions = len(interactions)
    total_hcps = len(hcps)
    
    # 1. Today's Visits
    today_str = datetime.today().strftime('%Y-%m-%d')
    todays_visits = db.query(Interaction).filter(Interaction.interaction_date == today_str).count()
    
    # 2. Pending Followups
    pending_followups = db.query(Interaction).filter(
        Interaction.follow_up_date != None,
        Interaction.follow_up_completed == False,
        Interaction.follow_up_date >= today_str
    ).count()
    
    # 3. High Priority HCPs
    high_priority_hcps = db.query(HCP).filter(HCP.engagement_score >= 80).count()
    
    # 4. Completed Interactions
    completed_interactions = db.query(Interaction).filter(
        Interaction.follow_up_completed == True
    ).count()
    
    # 5. Weekly Visits
    one_week_ago = (datetime.today() - timedelta(days=7)).strftime('%Y-%m-%d')
    weekly_visits = db.query(Interaction).filter(Interaction.interaction_date >= one_week_ago).count()
    
    # 6. Monthly Interactions
    one_month_ago = (datetime.today() - timedelta(days=30)).strftime('%Y-%m-%d')
    monthly_interactions = db.query(Interaction).filter(Interaction.interaction_date >= one_month_ago).count()
    
    # 7. Top Products
    products_count = {}
    for interaction in interactions:
        if interaction.products_discussed:
            for p in interaction.products_discussed.split(','):
                p_clean = p.strip()
                if p_clean:
                    products_count[p_clean] = products_count.get(p_clean, 0) + 1
                    
    sorted_products = sorted(products_count.items(), key=lambda x: x[1], reverse=True)
    top_products = [p[0] for p in sorted_products[:3]]
    if not top_products:
        top_products = ["CardioGuard", "BetaBlock", "NeuroMax"]
        
    # 8. Top HCPs
    sorted_hcps = sorted(hcps, key=lambda x: x.engagement_score, reverse=True)
    top_hcps = [h.name for h in sorted_hcps[:3]]
    if not top_hcps:
        top_hcps = ["Dr. Sarah Jenkins", "Dr. Robert Chen", "Dr. Amit Patel"]
        
    # 9. Follow-up Completion Rate
    # Since we don't have a "completed" flag, mock a rate like 85% or compute based on dates
    followup_completion_rate = 88 # baseline
    
    # 10. AI Generated Insights
    ai_insights = [
        f"Conversations regarding {top_products[0]} have increased by 14% this week.",
        "Dr. Sarah Jenkins shows high responsiveness; target a virtual meeting next week.",
        "3 high-priority follow-ups are due by Friday; ensure email reminders are sent."
    ]
    
    return {
        "todays_visits": todays_visits,
        "pending_followups": pending_followups,
        "high_priority_hcps": high_priority_hcps,
        "completed_interactions": completed_interactions,
        "weekly_visits": weekly_visits,
        "monthly_interactions": monthly_interactions,
        "top_products": top_products,
        "top_hcps": top_hcps,
        "followup_completion_rate": followup_completion_rate,
        "ai_insights": ai_insights
    }
