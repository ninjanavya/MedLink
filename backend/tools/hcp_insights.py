from sqlalchemy.orm import Session
from backend.models.models import HCP, Interaction
from typing import Dict, Any, List

def run_hcp_insights(db: Session, args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetches engagement data and profiles for a specific HCP.
    Expected args: hcp_name (or hcp_id)
    """
    hcp_name = args.get("hcp_name")
    hcp_id = args.get("hcp_id")
    
    query = db.query(HCP)
    if hcp_id:
        hcp = query.filter(HCP.id == hcp_id).first()
    elif hcp_name:
        hcp = query.filter(HCP.name.ilike(f"%{hcp_name}%")).first()
    else:
        return {"status": "error", "message": "Either hcp_name or hcp_id must be provided"}
        
    if not hcp:
        return {"status": "error", "message": f"HCP '{hcp_name or hcp_id}' not found"}
        
    # Fetch historical interactions to see what products are discussed
    interactions = db.query(Interaction).filter(Interaction.hcp_id == hcp.id).all()
    products_discussed = set()
    for interaction in interactions:
        if interaction.products_discussed:
            for p in interaction.products_discussed.split(","):
                products_discussed.add(p.strip())
                
    recent_interactions = [
        {
            "id": i.id,
            "interaction_date": i.interaction_date,
            "interaction_type": i.interaction_type,
            "summary": i.summary,
            "sentiment": i.sentiment
        }
        for i in sorted(interactions, key=lambda x: x.id, reverse=True)[:3]
    ]

    return {
        "status": "success",
        "hcp_details": {
            "id": hcp.id,
            "name": hcp.name,
            "hospital": hcp.hospital,
            "specialty": hcp.specialty,
            "engagement_score": hcp.engagement_score,
            "visit_frequency": hcp.visit_frequency,
            "risk_alert": hcp.risk_alert,
            "email": hcp.email,
            "phone": hcp.phone
        },
        "total_interactions_logged": len(interactions),
        "products_discussed_history": list(products_discussed),
        "recent_interactions": recent_interactions
    }
