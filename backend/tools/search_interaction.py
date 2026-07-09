from sqlalchemy.orm import Session
from backend.models.models import Interaction
from typing import Dict, Any, List
from sqlalchemy import or_

def run_search_interactions(db: Session, args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Searches logged interactions based on query string.
    Expected args: query (HCP name, hospital, specialty, or products)
    """
    query_str = args.get("query", "")
    if not query_str:
        return {"status": "error", "message": "Search query cannot be empty"}
        
    search_pattern = f"%{query_str}%"
    results = db.query(Interaction).filter(
        or_(
            Interaction.hcp_name.like(search_pattern),
            Interaction.hospital.like(search_pattern),
            Interaction.specialty.like(search_pattern),
            Interaction.products_discussed.like(search_pattern),
            Interaction.notes.like(search_pattern)
        )
    ).order_by(Interaction.id.desc()).limit(5).all()
    
    serialized_results = []
    for interaction in results:
        serialized_results.append({
            "id": interaction.id,
            "hcp_name": interaction.hcp_name,
            "hospital": interaction.hospital,
            "specialty": interaction.specialty,
            "interaction_type": interaction.interaction_type,
            "products_discussed": interaction.products_discussed,
            "interaction_date": interaction.interaction_date,
            "follow_up_date": interaction.follow_up_date,
            "priority": interaction.priority,
            "summary": interaction.summary
        })
        
    return {
        "status": "success",
        "query": query_str,
        "count": len(serialized_results),
        "results": serialized_results
    }
