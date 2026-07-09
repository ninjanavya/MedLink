import os
import json
from typing import Dict, Any, List
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session

# Load environment variables
load_dotenv()

from backend.langgraph.state import AgentState, AgentMessage
from backend.tools import (
    run_log_interaction,
    run_edit_interaction,
    run_search_interactions,
    run_followup_tool,
    run_hcp_insights
)

# Initialize Groq client if key is available
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Define the schemas of our tools for Groq function-calling
TOOLS_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "log_interaction",
            "description": "Log a new interaction or meeting with a Healthcare Professional (HCP).",
            "parameters": {
                "type": "object",
                "properties": {
                    "hcp_name": {"type": "string", "description": "Full name of the doctor (e.g., Dr. Sarah Jenkins)"},
                    "hospital": {"type": "string", "description": "Hospital or clinic name"},
                    "specialty": {"type": "string", "description": "Medical specialty (e.g., Cardiology)"},
                    "interaction_type": {"type": "string", "enum": ["In-Person", "Virtual", "Email", "Phone"]},
                    "products_discussed": {"type": "array", "items": {"type": "string"}, "description": "List of products discussed"},
                    "interaction_date": {"type": "string", "description": "Date of meeting (YYYY-MM-DD)"},
                    "follow_up_date": {"type": "string", "description": "Scheduled follow-up date (YYYY-MM-DD)"},
                    "priority": {"type": "string", "enum": ["Low", "Medium", "High"]},
                    "notes": {"type": "string", "description": "Meeting details and discussion notes"}
                },
                "required": ["hcp_name", "interaction_type", "interaction_date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "edit_interaction",
            "description": "Update or edit fields of an existing logged interaction.",
            "parameters": {
                "type": "object",
                "properties": {
                    "interaction_id": {"type": "integer", "description": "The database ID of the interaction record"},
                    "notes": {"type": "string", "description": "Updated notes"},
                    "products_discussed": {"type": "array", "items": {"type": "string"}, "description": "Updated list of products"},
                    "priority": {"type": "string", "enum": ["Low", "Medium", "High"]},
                    "follow_up_date": {"type": "string", "description": "Updated follow-up date YYYY-MM-DD"}
                },
                "required": ["interaction_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_interactions",
            "description": "Search history of logged interactions by keyword, HCP, or products.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search keyword, doctor name, or product"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_followup",
            "description": "Schedule a follow-up date or specify the Next Best Action for an interaction.",
            "parameters": {
                "type": "object",
                "properties": {
                    "interaction_id": {"type": "integer", "description": "Database ID of the interaction"},
                    "follow_up_date": {"type": "string", "description": "Target date YYYY-MM-DD"},
                    "next_best_action": {"type": "string", "description": "Actionable task for next engagement"}
                },
                "required": ["interaction_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_hcp_insights",
            "description": "Retrieve profile insights, engagement score, risk status and history for an HCP.",
            "parameters": {
                "type": "object",
                "properties": {
                    "hcp_name": {"type": "string", "description": "Name of the HCP"},
                    "hcp_id": {"type": "integer", "description": "Database ID of the HCP if known"}
                }
            }
        }
    }
]

def reasoning_node(state: AgentState, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Decides if a tool is needed based on the dialog history.
    """
    messages = state["messages"]
    latest_user_message = next((m for m in reversed(messages) if m["role"] == "user"), None)
    
    if not latest_user_message:
        return {"tool_to_call": None, "tool_arguments": None}
        
    text = latest_user_message["content"]
    
    # 1. Real execution using Groq if key is present
    if groq_client:
        try:
            # Map messages to format expected by Groq
            groq_messages = []
            groq_messages.append({"role": "system", "content": (
                "You are an expert AI assistant inside MedLink CRM (an AI-Powered Healthcare CRM for HCP Engagement). "
                "You help field representatives log interactions, search history, edit records, "
                "schedule follow-ups, and fetch physician insights. "
                "Always call the appropriate tool when requested."
            )})
            
            for m in messages:
                groq_messages.append({"role": m["role"], "content": m["content"]})
                
            response = groq_client.chat.completions.create(
                model="gemma2-9b-it",
                messages=groq_messages,
                tools=TOOLS_SCHEMAS,
                tool_choice="auto",
                temperature=0.1
            )
            
            message = response.choices[0].message
            if message.tool_calls:
                tool_call = message.tool_calls[0]
                return {
                    "tool_to_call": tool_call.function.name,
                    "tool_arguments": json.loads(tool_call.function.arguments)
                }
            else:
                # Direct message response (no tool needed)
                return {
                    "tool_to_call": None,
                    "tool_arguments": None,
                    "messages": [{"role": "assistant", "content": message.content}]
                }
        except Exception as e:
            # Fallback to local parsing on API error
            pass
            
    # 2. Local rule-based parsing fallback (No API key or error)
    text_lower = text.lower()
    tool_to_call = None
    args = {}
    
    # Try to find a matching HCP from the database first
    db = config.get("configurable", {}).get("db")
    matching_hcp = None
    if db:
        try:
            from backend.models.models import HCP
            hcps = db.query(HCP).all()
            for hcp in hcps:
                clean_name = hcp.name.replace("Dr.", "").replace("Dr", "").strip().lower()
                name_parts = [p for p in clean_name.split() if len(p) > 2]
                if clean_name in text_lower or (name_parts and any(p in text_lower for p in name_parts)):
                    matching_hcp = hcp
                    break
        except Exception as e:
            print(f"Error querying database in reasoning_node fallback: {e}")
            
    if any(x in text_lower for x in ["log", "record", "save interaction", "met with"]):
        tool_to_call = "log_interaction"
        # Parse dynamic fields from matched database record or fallback to defaults
        hcp_name = matching_hcp.name if matching_hcp else ("Dr. Sarah Jenkins" if "jenkins" in text_lower or "sarah" in text_lower else "Dr. Robert Chen")
        hospital = matching_hcp.hospital if matching_hcp else ("City Cardiology" if "cardiology" in text_lower or "city" in text_lower else "St. Jude Hospital")
        specialty = matching_hcp.specialty if matching_hcp else ("Cardiology" if "cardio" in text_lower else "Internal Medicine")
        
        args = {
            "hcp_name": hcp_name,
            "hospital": hospital,
            "specialty": specialty,
            "interaction_type": "In-Person" if "in person" in text_lower or "met" in text_lower else "Virtual",
            "products_discussed": ["CardioGuard"] if "cardio" in text_lower else ["BetaBlock"],
            "interaction_date": "2026-07-08",
            "follow_up_date": "2026-07-15",
            "priority": "High" if "urgent" in text_lower or "high" in text_lower else "Medium",
            "notes": text
        }
    elif any(x in text_lower for x in ["edit", "update", "change"]):
        tool_to_call = "edit_interaction"
        args = {
            "interaction_id": 1, # default mock target
            "notes": f"Updated notes: {text}"
        }
    elif any(x in text_lower for x in ["search", "find", "history", "lookup"]):
        tool_to_call = "search_interactions"
        # Extract query
        query = text.replace("search", "").replace("find", "").replace("history", "").replace("for", "").strip()
        args = {"query": query or "CardioGuard"}
    elif any(x in text_lower for x in ["follow", "schedule", "next step", "remind"]):
        tool_to_call = "schedule_followup"
        args = {
            "interaction_id": 1,
            "follow_up_date": "2026-07-20",
            "next_best_action": "Email clinical study PDF regarding CardioGuard efficacy."
        }
    elif any(x in text_lower for x in ["insight", "engagement", "profile", "doctor score", "risk"]):
        tool_to_call = "get_hcp_insights"
        hcp_name = matching_hcp.name if matching_hcp else ("Dr. Sarah Jenkins" if "jenkins" in text_lower or "sarah" in text_lower else "Dr. Robert Chen")
        args = {
            "hcp_name": hcp_name
        }
        
    return {
        "tool_to_call": tool_to_call,
        "tool_arguments": args
    }

def tools_node(state: AgentState, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes the tool identified in the reasoning node against the DB session.
    """
    db: Session = config.get("configurable", {}).get("db")
    tool_name = state.get("tool_to_call")
    args = state.get("tool_arguments") or {}
    
    if not db:
        return {"messages": [{"role": "assistant", "content": "Database session is unavailable in LangGraph context."}]}
        
    result_text = ""
    extracted_fields = {}
    
    if tool_name == "log_interaction":
        res = run_log_interaction(db, args)
        result_text = f"Tool Call: log_interaction. Result: {res['message']}"
        extracted_fields = args
    elif tool_name == "edit_interaction":
        res = run_edit_interaction(db, args)
        result_text = f"Tool Call: edit_interaction. Result: {res['message']}"
    elif tool_name == "search_interactions":
        res = run_search_interactions(db, args)
        result_text = f"Tool Call: search_interactions. Found {res['count']} results. Details: {res['results']}"
    elif tool_name == "schedule_followup":
        res = run_followup_tool(db, args)
        result_text = f"Tool Call: schedule_followup. Result: {res['message']}"
    elif tool_name == "get_hcp_insights":
        res = run_hcp_insights(db, args)
        result_text = f"Tool Call: get_hcp_insights. Result: Doctor {res.get('hcp_details', {}).get('name')} score: {res.get('hcp_details', {}).get('engagement_score')}. History count: {res.get('total_interactions_logged')}"
        extracted_fields = res.get("hcp_details", {})
    else:
        result_text = "No tool execution required."
        
    # Append the tool message to history
    return {
        "messages": [{"role": "tool", "content": result_text, "name": tool_name}],
        "extracted_fields": extracted_fields if extracted_fields else state.get("extracted_fields", {})
    }

def response_compiler_node(state: AgentState, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compiles the final user-facing response and extracts metadata for the AI side panel.
    """
    db: Session = config.get("configurable", {}).get("db")
    messages = state["messages"]
    latest_message = messages[-1]
    
    # 1. Generate text response
    response_text = ""
    if latest_message["role"] == "tool":
        # Compile response summarizing tool results
        tool_content = latest_message["content"]
        if "log_interaction" in tool_content:
            response_text = "I've successfully logged the interaction into the CRM database. You can review the extracted entities in the preview and click Save to lock it in."
        elif "edit_interaction" in tool_content:
            response_text = "I've updated the interaction records in the database as requested. The changes will show up in the interaction history."
        elif "search" in tool_content:
            response_text = "Here are the matching interaction logs found in the CRM timeline. Let me know if you'd like me to summarize any specific log."
        elif "followup" in tool_content:
            response_text = "I've updated the follow-up task and date. The Next Best Action rating has been updated in the doctor profile."
        elif "insights" in tool_content:
            response_text = "I've loaded the engagement insights for the doctor. The right-hand panel has been updated with engagement score, visit frequency, and risk alert."
        else:
            response_text = "I have processed your request. Let me know if you need any further analysis."
    else:
        response_text = latest_message["content"]

    # 2. Extract fields for the AI side panel
    # We populate these variables to update the right side UI card
    fields = state.get("extracted_fields") or {}
    
    # Defaults
    hcp_name = fields.get("hcp_name", fields.get("name", "Dr. Sarah Jenkins"))
    hospital = fields.get("hospital", "City Cardiology Clinic")
    specialty = fields.get("specialty", "Cardiology")
    products = fields.get("products_discussed", ["CardioGuard", "BetaBlock"])
    if isinstance(products, str):
        products = [p.strip() for p in products.split(",") if p.strip()]
        
    sentiment = "Positive"
    priority_score = 85
    next_best_action = "Schedule virtual demo of CardioGuard within 3 days."
    risk_alert = "Low Risk"
    visit_frequency = "2.4 visits / month"
    engagement_score = 92
    insights = [
        "Prefers clinical study trials data over marketing slide decks.",
        "Interested in pediatric drug dosages for CardioGuard.",
        "Prefers email check-ins on Tuesday mornings."
    ]
    summary = f"Discussion focused on CardioGuard efficacy trials. Dr. {hcp_name.split()[-1] if ' ' in hcp_name else hcp_name} is highly receptive."

    # Look up real database doctor values if we can to enrich the AI panel
    if db and hcp_name:
        doctor = db.query(HCP).filter(HCP.name.ilike(f"%{hcp_name}%")).first()
        if doctor:
            hospital = doctor.hospital
            specialty = doctor.specialty
            engagement_score = doctor.engagement_score
            visit_frequency = doctor.visit_frequency
            risk_alert = doctor.risk_alert

    return {
        "messages": [{"role": "assistant", "content": response_text}],
        "doctor_details": {
            "name": hcp_name,
            "hospital": hospital,
            "specialty": specialty
        },
        "products_mentioned": products,
        "sentiment": sentiment,
        "priority_score": priority_score,
        "next_best_action": next_best_action,
        "risk_alert": risk_alert,
        "visit_frequency": visit_frequency,
        "engagement_score": engagement_score,
        "recent_insights": insights,
        "summary": summary
    }
