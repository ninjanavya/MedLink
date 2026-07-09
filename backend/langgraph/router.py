from typing import Dict, Any, Literal
from backend.langgraph.state import AgentState

def route_decision(state: AgentState) -> Literal["tools", "response_compiler"]:
    """
    Decides whether to execute a tool or directly compile the response.
    """
    if state.get("tool_to_call"):
        return "tools"
    return "response_compiler"
