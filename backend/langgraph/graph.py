from langgraph.graph import StateGraph, END
from backend.langgraph.state import AgentState
from backend.langgraph.nodes import reasoning_node, tools_node, response_compiler_node
from backend.langgraph.router import route_decision

# Build the LangGraph StateGraph
workflow = StateGraph(AgentState)

# 1. Register Nodes
workflow.add_node("reasoning", reasoning_node)
workflow.add_node("tools", tools_node)
workflow.add_node("response_compiler", response_compiler_node)

# 2. Set Entry Point
workflow.set_entry_point("reasoning")

# 3. Add Edges
# After reasoning, we decide whether to execute tools or compile response
workflow.add_conditional_edges(
    "reasoning",
    route_decision,
    {
        "tools": "tools",
        "response_compiler": "response_compiler"
    }
)

# After tools run, we always proceed to compile the response summarizing the results
workflow.add_edge("tools", "response_compiler")

# Once the response is compiled, we terminate
workflow.add_edge("response_compiler", END)

# Compile the workflow
compiled_agent = workflow.compile()
