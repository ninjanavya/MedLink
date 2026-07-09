from sqlalchemy.orm import Session
from backend.models.models import Interaction
from typing import Dict, Any

def run_edit_interaction(db: Session, args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Edits an existing interaction.
    Expected args: interaction_id, and any fields to update (notes, products_discussed, priority, follow_up_date, etc.)
    """
    interaction_id = args.get("interaction_id")
    if not interaction_id:
        return {"status": "error", "message": "Interaction ID is required to edit"}
        
    db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not db_interaction:
        return {"status": "error", "message": f"Interaction with ID {interaction_id} not found"}
        
    # Standardize products if provided
    products = args.get("products_discussed")
    if products is not None:
        if isinstance(products, list):
            args["products_discussed"] = ", ".join(products)
            
    # Update fields that were provided in the arguments
    updatable_fields = [
        "hcp_name", "hospital", "specialty", "interaction_type", 
        "products_discussed", "interaction_date", "follow_up_date", 
        "priority", "notes", "summary", "sentiment", "next_best_action"
    ]
    
    updated_fields = []
    for field in updatable_fields:
        if field in args and args[field] is not None:
            setattr(db_interaction, field, args[field])
            updated_fields.append(field)
            
    db.commit()
    db.refresh(db_interaction)
    
    return {
        "status": "success",
        "message": f"Successfully updated interaction {interaction_id} fields: {', '.join(updated_fields)}",
        "interaction_id": db_interaction.id
    }
