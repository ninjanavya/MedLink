from sqlalchemy.orm import Session
from backend.models.models import Interaction
from typing import Dict, Any

def run_followup_tool(db: Session, args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Schedules or updates follow-up tasks.
    Expected args: interaction_id, follow_up_date (YYYY-MM-DD), next_best_action (string instruction)
    """
    interaction_id = args.get("interaction_id")
    follow_up_date = args.get("follow_up_date")
    next_best_action = args.get("next_best_action")
    
    if not interaction_id:
        return {"status": "error", "message": "Interaction ID is required to schedule follow-up"}
        
    db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not db_interaction:
        return {"status": "error", "message": f"Interaction with ID {interaction_id} not found"}
        
    if follow_up_date:
        db_interaction.follow_up_date = follow_up_date
    if next_best_action:
        db_interaction.next_best_action = next_best_action
        
    db.commit()
    db.refresh(db_interaction)
    
    return {
        "status": "success",
        "message": f"Successfully updated follow-up details for interaction {interaction_id}",
        "follow_up_date": db_interaction.follow_up_date,
        "next_best_action": db_interaction.next_best_action
    }
