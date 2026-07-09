from typing import TypedDict, Annotated, List, Dict, Any, Optional

# Basic message schema for LangGraph agent
class AgentMessage(TypedDict):
    role: str # 'user', 'assistant', 'system', 'tool'
    content: str
    name: Optional[str]

def merge_messages(left: List[AgentMessage], right: List[AgentMessage]) -> List[AgentMessage]:
    # Custom reducer to append and merge messages in state
    return left + right

class AgentState(TypedDict):
    messages: Annotated[List[AgentMessage], merge_messages]
    extracted_fields: Dict[str, Any]
    doctor_details: Dict[str, Any]
    products_mentioned: List[str]
    sentiment: str
    priority_score: int
    next_best_action: str
    recent_insights: List[str]
    risk_alert: str
    visit_frequency: str
    engagement_score: int
    summary: str
    tool_to_call: Optional[str]
    tool_arguments: Optional[Dict[str, Any]]
