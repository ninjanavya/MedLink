from sqlalchemy.orm import Session
from backend.models.models import Interaction, HCP
from typing import Dict, Any, List

def run_log_interaction(db: Session, args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Logs a new interaction.
    Expected args: hcp_name, hospital, specialty, interaction_type, products_discussed (List[str] or str),
    interaction_date, follow_up_date, priority, notes.
    """
    hcp_name = args.get("hcp_name")
    hospital = args.get("hospital", "Unknown Hospital")
    specialty = args.get("specialty", "General Practice")
    
    if not hcp_name:
        return {"status": "error", "message": "HCP name is required to log an interaction"}
        
    # Standardize products
    products = args.get("products_discussed", "")
    if isinstance(products, list):
        products = ", ".join(products)

    # 1. Fetch or create HCP
    hcp = db.query(HCP).filter(HCP.name.ilike(hcp_name)).first()
    if not hcp:
        hcp = HCP(
            name=hcp_name,
            hospital=hospital,
            specialty=specialty,
            engagement_score=80,
            visit_frequency="2x/month",
            risk_alert="Low Risk"
        )
        db.add(hcp)
        db.commit()
        db.refresh(hcp)
        
    # 2. Extract AI parameters (mocked or rule-based for tool results)
    notes = args.get("notes", "")
    sentiment = "Positive" if any(x in notes.lower() for x in ["good", "great", "interested", "yes"]) else "Neutral"
    sentiment_score = 0.8 if sentiment == "Positive" else 0.0
    priority = args.get("priority", "Medium")
    priority_score = 85 if priority == "High" else (60 if priority == "Medium" else 30)

    db_interaction = Interaction(
        hcp_id=hcp.id,
        hcp_name=hcp.name,
        hospital=hospital,
        specialty=specialty,
        interaction_type=args.get("interaction_type", "Virtual"),
        products_discussed=products,
        interaction_date=args.get("interaction_date", "2026-07-08"),
        follow_up_date=args.get("follow_up_date"),
        priority=priority,
        notes=notes,
        summary=f"Interaction regarding {products or 'general topics'} with Dr. {hcp.name}.",
        sentiment=sentiment,
        sentiment_score=sentiment_score,
        priority_score=priority_score,
        next_best_action=f"Deliver follow-up details on {products or 'portfolio'} by {args.get('follow_up_date')}.",
        recent_ai_insights=f"Dr. {hcp.name} expressed alignment with {products or 'products'}."
    )
    
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    
    return {
        "status": "success",
        "message": f"Successfully logged interaction ID {db_interaction.id} for Dr. {hcp_name}",
        "interaction_id": db_interaction.id,
        "hcp_details": {
            "name": hcp.name,
            "hospital": hcp.hospital,
            "specialty": hcp.specialty,
            "engagement_score": hcp.engagement_score
        }
    }
