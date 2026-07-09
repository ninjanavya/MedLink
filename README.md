# MedLink CRM - AI-Powered Healthcare CRM for HCP Engagement

An enterprise-grade, high-fidelity MedLink CRM focused on the Healthcare Professional (HCP) module. It provides medical representatives with a dual-logging system to record visits either through a structured, real-time auto-saving form, or via a Microsoft Copilot-style AI conversation powered by **FastAPI** and a compiled **LangGraph** agent.

The interface is inspired by the premium design aesthetics of Salesforce, Veeva CRM, Linear, and Notion: rounded 16px cards, soft shadows, custom loaders, and micro-animations.

---

## Technical Stack

### Frontend
- **React 18** (Vite + TypeScript)
- **Redux Toolkit** (Global store, async thunks, slices for chat and CRM logs)
- **React Router v6** (Layout routing)
- **Axios** (Dual-mode API fetching with graceful mock database fallback)
- **Framer Motion** (Component animations and transition gates)
- **Lucide React** (Consistent iconography)
- **Vanilla CSS** with custom design variables

### Backend
- **FastAPI** (Python 3.10+)
- **LangGraph** (StateGraph workflow compiler)
- **SQLAlchemy** (PostgreSQL-ready schemas with auto-sqlite fallback)
- **Groq API Client** (Configured for `gemma2-9b-it`)
- **Uvicorn** (Asynchronous WSGI application server)

---

## Directory Structure

```
Naukri/
├── backend/                  # FastAPI Backend Server
│   ├── main.py               # Main API entrypoint & Database seeder
│   ├── requirements.txt      # Python dependencies list
│   ├── database/             # SQLAlchemy connection configs
│   │   ├── __init__.py
│   │   └── connection.py     # SQLite and PostgreSQL database hook
│   ├── models/               # Database ORM models
│   │   ├── __init__.py
│   │   └── models.py         # HCP and Interaction database schemas
│   ├── routes/               # API Router endpoints
│   │   ├── __init__.py
│   │   └── interactions.py   # CRUD and stats calculations
│   ├── langgraph/            # Agent Orchestration
│   │   ├── __init__.py
│   │   ├── graph.py          # StateGraph nodes and edges builder
│   │   ├── state.py          # AgentState dictionary
│   │   ├── nodes.py          # Groq calling & formatting nodes
│   │   └── router.py         # Decision routing logic
│   └── tools/                # Agent Action tools
│       ├── __init__.py
│       ├── log_interaction.py
│       ├── edit_interaction.py
│       ├── search_interaction.py
│       ├── followup_tool.py
│       └── hcp_insights.py
├── frontend/                 # Vite + React Frontend
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── App.tsx           # Router and Store wiring
│   │   ├── index.css         # CRM design token system & variables
│   │   ├── main.tsx
│   │   ├── assets/           # Static media assets
│   │   ├── components/       # Atomic reusable UI components
│   │   │   ├── AIIndicator.tsx
│   │   │   ├── AIPanel.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── NotificationToast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Timeline.tsx
│   │   ├── layouts/          # Main application layout wrappers
│   │   │   └── MainLayout.tsx
│   │   ├── pages/            # View views
│   │   │   ├── Dashboard.tsx
│   │   │   ├── HCPDirectory.tsx
│   │   │   ├── History.tsx
│   │   │   ├── LogInteraction.tsx
│   │   │   └── Placeholders.tsx
│   │   ├── redux/            # Redux Toolkit Slices & Store
│   │   │   ├── store.ts
│   │   │   └── slices/
│   │   │       ├── chatSlice.ts
│   │   │       ├── interactionSlice.ts
│   │   │       └── toastSlice.ts
│   │   ├── services/         # Axios wrapper and endpoint actions
│   │   │   ├── api.ts
│   │   │   ├── chatService.ts
│   │   │   └── interactionService.ts
│   │   └── utils/            # Mock database backup and helpers
│   │       ├── helpers.ts
│   │       └── mockData.ts
└── .env                      # Template for API keys and DB links
```

---

## Setup Instructions

### Environment Variables
Create a `.env` file in the project root:
```env
# Groq LLM API Key
GROQ_API_KEY=gsk_your_groq_api_key_here

# SQLite (default out-of-the-box local testing)
DATABASE_URL=sqlite:///./healthcare_crm.db

# PostgreSQL (For production usage)
# DATABASE_URL=postgresql://user:password@localhost:5432/healthcare_crm
```

---

### Running the Backend

1. **Create Python Virtual Environment:**
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Boot FastAPI Server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend will automatically start, initialize the SQLite database, and seed initial demo HCP profiles and interactions. Open API documentation at `http://localhost:8000/docs`.

---

### Running the Frontend

1. **Install Node Packages:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   The frontend will bind to `http://localhost:5173`. Clicking sidebar options will instantly load pages.

---

## Database Configuration

### SQLite (Default)
No setup required. The application automatically builds a `healthcare_crm.db` file in the `backend/` directory upon startup.

### PostgreSQL Setup
1. Create a PostgreSQL database instance:
   ```sql
   CREATE DATABASE healthcare_crm;
   ```
2. Update the `.env` file at the root:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/healthcare_crm
   ```
3. Restart the FastAPI backend. SQLAlchemy will automatically create all tables (`hcps` and `interactions`) and populate them with the initial seeded dataset.

---

## LangGraph Workflow Explanation

The AI Conversation tab invokes a compiled `StateGraph` which guides the conversation through three distinct nodes:

```mermaid
graph TD
    Start([User Chat Message]) --> Reasoning[Reasoning Node]
    Reasoning --> |Decides if tool is needed| Router{Router Decision}
    Router --> |Yes: execute action| Tools[Tools Node]
    Router --> |No: compile reply| Compiler[Compiler Node]
    Tools --> Compiler
    Compiler --> End([Return Reply + Panel Updates])
```

1. **Agent State (`langgraph/state.py`):**
   A state dict carrying conversation history, extracted HCP details, sentiment, risk levels, and tool parameters.
2. **Reasoning Node (`langgraph/nodes.py`):**
   Inspects messages. If a `GROQ_API_KEY` is present, it uses `gemma2-9b-it` to analyze the query and call the appropriate tool. If the key is absent, it runs an intelligent keyword parser.
3. **Router Node (`langgraph/router.py`):**
   Inspects state. If `tool_to_call` is scheduled, it routes execution to the `tools` node; otherwise, it jumps directly to `response_compiler`.
4. **Tools Node (`langgraph/nodes.py`):**
   Executes the target tool function against the database:
   - `log_interaction`: Writes a structured meeting record.
   - `edit_interaction`: Updates existing log files.
   - `search_interactions`: Queries timeline logs matching search terms.
   - `schedule_followup`: Schedules follow-up dates and records next steps.
   - `get_hcp_insights`: Retrieves engagement profiles.
5. **Response Compiler Node (`langgraph/nodes.py`):**
   Takes the final assistant state and aggregates sentiment tags,engagement charts, and priority scores. The structured data is returned to update the right side AI Panel.

---

## API Documentation

The backend exposes the following endpoints (mounted under prefix `/api`):

### 1. Interactions Module
- **`GET /api/interactions`**
  Returns all logged interactions, ordered newest first.
- **`POST /api/interactions`**
  Creates a new interaction. Automatically creates the HCP profile if the name is not yet registered. Computes default AI sentiment tags and engagement indices if omitted.
- **`PUT /api/interactions/{id}`**
  Updates fields on an existing interaction log.
- **`DELETE /api/interactions/{id}`**
  Deletes an interaction log from history.

### 2. HCP Directory Module
- **`GET /api/hcps`**
  Returns all registered physicians, their specialties, engagement scores, and churn risk tags.

### 3. Dashboard Analytics
- **`GET /api/dashboard/stats`**
  Computes KPI metrics in real-time, including:
  - Daily scheduled visits count
  - Active pending follow-ups
  - Weekly and monthly totals
  - Most discussed product aggregates
  - Top engaged HCP charts
  - Automated follow-up completion rates
  - AI trend analysis bulletins

### 4. AI Copilot Chat
- **`POST /api/chat`**
  Accepts user message logs. Feeds them through the compiled LangGraph workflow. Returns the chatbot message response accompanied by a JSON payload updating the Doctor Details panel,Sentiment indicators, and Next Best Action lists.
