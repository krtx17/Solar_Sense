# SolarSense AI — System Walkthrough & Session Handover Guide

> **Cross-Session Reference Document**  
> Use this document to resume work across sessions, understand the system architecture, run tests, and check current implementation status.

---

## 1. System Overview & Architecture

SolarSense AI is a physics-grounded solar intelligence platform that bridges deterministic solar engineering physics with bounded Agentic AI. 

The core design principle is **separation of concerns**:
1. **Physics & Mathematics are Deterministic**: Clear-sky modeling, temperature derating, irradiance adjustments, and loss decomposition are calculated using physical formulas and statistical baselines. The AI **never** guesses numbers or invents physics.
2. **Agentic AI is Scoped & Grounded**: The LLM (Claude / Gemini) is strictly used as an analytical narrator and conversational assistant (Solar Copilot) equipped with deterministic tools (`get_forecast`, `get_decomposition`, etc.).
3. **Frontend Contract is Preserved**: The visual frontend (`phase 2`) running on React 19 + TypeScript + Vite connects to the backend without altering any UI presentation.

```
+-------------------------------------------------------------------------+
|                        Frontend UI (Port 3001)                          |
|             React 19 + Tailwind v4 + Three.js 3D Solar Model            |
+------------------------------------+------------------------------------+
                                     | JSON REST Requests
                                     v
+-------------------------------------------------------------------------+
|                       FastAPI Backend (Port 8000)                       |
|                                                                         |
|  +--------------------+   +-----------------------+   +---------------+ |
|  | Data Quality Agent |-->| Ineichen Clear-Sky    |-->| Deterministic | |
|  | (Spikes/Gaps/UTC)  |   | Solar Physics Engine  |   | Decomposition | |
|  +--------------------+   +-----------------------+   +-------+-------+ |
|                                                               |         |
|  +------------------------------------------------------------+         |
|  | Bounded Agentic AI Copilot (Claude / Gemini Tool Execution)          |
|  +---------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  Database Layer: PostgreSQL 18 / SQLite                 |
|             SQLAlchemy 2.0 ORM Models + Multi-Tenant Indexing           |
+-------------------------------------------------------------------------+
```

---

## 2. Directory Structure

```
solar_sense_ai/
├── phase 1/                     # Architecture, PRD, TRD, Schemas & System Specifications
│   └── solar/solar/             # 01_PRD to 10_Workflow specification markdown files
├── phase 2/                     # Frontend Application (React 19 + Vite + TypeScript)
│   ├── src/
│   │   ├── types/solar.ts       # Exact TypeScript domain types and contracts
│   │   ├── services/            # Frontend mock and API service layer
│   │   └── components/          # UI components (Hero, 3D House, EchoTwin, etc.)
│   └── package.json             # Dev server on port 3001
├── phase 3/                     # Backend Application (FastAPI + PostgreSQL + Physics Engine)
│   └── backend/
│       ├── app/
│       │   ├── core/            # Config, database engine, security
│       │   ├── models/          # SQLAlchemy 2.0 ORM models
│       │   ├── schemas/         # Pydantic v2 domain schemas (mirrors solar.ts)
│       │   ├── services/        # Physics engine, data quality, decomposition, copilot
│       │   ├── api/             # FastAPI routers
│       │   └── main.py          # FastAPI application entrypoint
│       └── tests/
│           ├── unit/            # Unit tests per feature/module
│           └── integration/     # End-to-end integration tests
├── TASKS_AND_PHASES.md          # 5-Phase task checklist and verification status
└── WALKTHROUGH.md               # This document (System overview and execution guide)
```

---

## 3. How to Run the System

### 3.1 Frontend (Active on Port 3001)
```powershell
cd "phase 2"
npm.cmd run dev
```
- **Local URL**: `http://localhost:3001`
- **Network URL**: `http://10.119.0.218:3001`

### 3.2 Backend (FastAPI on Port 8000)
```powershell
cd "phase 3/backend"
# Activate virtual environment
.\venv\Scripts\Activate.ps1
# Run API server
uvicorn app.main:app --reload --port 8000
```
- **API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

### 3.3 Running Tests
To run unit tests for individual modules:
```powershell
cd "phase 3/backend"
# Run all unit tests
pytest tests/unit -v

# Run specific module test
pytest tests/unit/test_data_quality.py -v
pytest tests/unit/test_physics_engine.py -v
pytest tests/unit/test_decomposition.py -v
```

To run end-to-end integration tests:
```powershell
pytest tests/integration -v
```

---

## 4. Database Strategy

- **Production / Running Service**: PostgreSQL 18 running on `localhost:5432`.
- **Database URL**: Configurable via `.env` file (`DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/solarsense`).
- **Zero-Friction Fallback**: If PostgreSQL credentials are not provided or PostgreSQL is unavailable, the application automatically uses SQLite (`sqlite:///./solarsense.db`) so development, CI/CD, and all unit tests run immediately without blocking.

---

## 5. Session Handover & Completed Verification

- [x] **Frontend Status**: Active on port 3001 with custom cloudy blue theme, interactive 3D model, EchoTwin™ telemetry twin, and zero build/lint errors.
- [x] **Phase Planning**: Completed 5-phase backend roadmap defined in `TASKS_AND_PHASES.md`.
- [x] **Session Handover**: Created `WALKTHROUGH.md` for continuous cross-session context.
- [x] **Phase 1: Foundation & Data Quality**: Completed. 9 Unit tests passing (`test_database.py`, `test_data_quality.py`).
- [x] **Phase 2: Physics Engine & Clear-Sky**: Completed. 5 Unit tests passing (`test_physics_engine.py`).
- [x] **Phase 3: Deterministic Anomaly Decomposition**: Completed. 5 Unit tests passing (`test_decomposition.py`).
- [x] **Phase 4: Agentic AI Layer & Solar Copilot**: Completed. 6 Unit tests passing (`test_copilot.py`).
- [x] **Phase 5: FastAPI Routers & Integration Testing**: Completed. 15 Integration tests passing (`test_api_integration.py`).
- [x] **Total Automated Tests**: **40 tests passed out of 40 (100% pass rate in 3.46s)**.
- [x] **Live Servers**:
  - **Frontend**: `http://localhost:3001`
  - **Backend API**: `http://localhost:8000`
  - **API Documentation**: `http://localhost:8000/docs`
