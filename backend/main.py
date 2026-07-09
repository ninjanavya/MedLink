import os
from dotenv import load_dotenv

# Automatically load environment variables on startup before other imports
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.database.connection import engine, Base, get_db
from backend.models.models import HCP, Interaction
from backend.routes.interactions import router as interactions_router
from backend.routes.hcps import router as hcps_router
from backend.database.seeder import seed_database
from backend.langgraph import compiled_agent
from backend.langgraph.state import AgentMessage

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedLink CRM - HCP Module API",
    description="Production-grade API featuring REST routes and LangGraph agent workflow for logging and analysis.",
    version="1.0.0"
)

# Enable CORS for React frontend (standard dev ports 5173, 3000)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial demo data if database is empty
@app.on_event("startup")
def seed_db():
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()

# Router mounts
app.include_router(interactions_router, prefix="/api")
app.include_router(hcps_router, prefix="/api")

# Pydantic Schemas for AI Chat
class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str
    name: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    # Optionally pass context fields
    doctor_details: Optional[Dict[str, Any]] = None
    products_mentioned: Optional[List[str]] = None

class ChatResponse(BaseModel):
    reply: str
    messages: List[Dict[str, Any]]
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

@app.post("/api/chat", response_model=ChatResponse)
def post_chat(chat_req: ChatRequest, db: Session = Depends(get_db)):
    """
    POST /chat endpoint. Runs the message sequence through the compiled LangGraph workflow.
    """
    # 1. Map request messages into LangGraph message formats
    graph_messages: List[AgentMessage] = []
    for m in chat_req.messages:
        graph_messages.append({
            "role": m.role,
            "content": m.content,
            "name": m.name
        })
        
    # 2. Build initial state
    initial_state = {
        "messages": graph_messages,
        "extracted_fields": {},
        "doctor_details": chat_req.doctor_details or {},
        "products_mentioned": chat_req.products_mentioned or [],
        "sentiment": "Neutral",
        "priority_score": 50,
        "next_best_action": "",
        "recent_insights": [],
        "risk_alert": "Low Risk",
        "visit_frequency": "1x/month",
        "engagement_score": 70,
        "summary": "",
        "tool_to_call": None,
        "tool_arguments": None
    }
    
    try:
        # Run state through LangGraph compiler with db session in context
        final_state = compiled_agent.invoke(
            initial_state,
            config={"configurable": {"db": db}}
        )
        
        # 3. Compile output response
        # Retrieve the final compiled reply from the message list
        all_messages = final_state.get("messages", [])
        assistant_messages = [m for m in all_messages if m["role"] == "assistant"]
        reply_content = assistant_messages[-1]["content"] if assistant_messages else "I have updated the records."
        
        # Format response matching UI state expectations
        return ChatResponse(
            reply=reply_content,
            messages=[dict(m) for m in all_messages],
            doctor_details=final_state.get("doctor_details", {}),
            products_mentioned=final_state.get("products_mentioned", []),
            sentiment=final_state.get("sentiment", "Neutral"),
            priority_score=final_state.get("priority_score", 50),
            next_best_action=final_state.get("next_best_action", ""),
            recent_insights=final_state.get("recent_insights", []),
            risk_alert=final_state.get("risk_alert", "Low Risk"),
            visit_frequency=final_state.get("visit_frequency", "2x/month"),
            engagement_score=final_state.get("engagement_score", 70),
            summary=final_state.get("summary", "")
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LangGraph execution error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
