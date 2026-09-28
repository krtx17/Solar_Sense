# SolarSense AI — Backend & Database Master Plan: Tasks and Phases

**Project Role**: Senior System Architect & Master of Full-Stack Development / Agentic AI  
**Scope**: Full Backend & Database Implementation (`phase 3/backend`)  
**Strict Boundary**: **Zero changes to frontend presentation/UI**; Backend implements the exact API contracts defined in `phase 2/src/types/solar.ts`.  
**Testing Policy**: Unit test every module/feature as it is built; End-to-end integration tests across all endpoints and database connections upon completion.

---

## Architecture Principles & Boundary Contract

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (Phase 2)                       │
│             React 19 + TypeScript + Vite (Port 3001)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND (Phase 3)                       │
│                                                                        │
│  ┌───────────────────────┐         ┌────────────────────────────────┐  │
│  │   Data Quality Agent  │         │   Physics Engine (pvlib model) │  │
│  │ (Validation, UTC sync)│         │ (Ineichen Clear-Sky Baseline)  │  │
│  └───────────┬───────────┘         └────────────────┬───────────────┘  │
│              │                                      │                  │
│              ▼                                      ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │     Deterministic Anomaly & Deviation Decomposition Engine       │  │
│  │    Total Gap = Weather-Explained Gap + Unexplained Anomaly Gap   │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │ Grounded Numbers                 │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │      Agentic AI Layer (Claude / GenAI Scoped Tool Calling)       │  │
│  │    Bounded Narration only — never invents numbers or physics     │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │ SQLAlchemy 2.0 ORM
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 DATABASE: PostgreSQL 18 (SQLite Fallback)              │
│       Multi-tenant schema, UTC indexed time-series, Anomaly logs       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Phases Overview

| Phase | Milestone Name | Key Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **Phase 1** | **Foundation, Database & Data Quality** | SQLAlchemy models, Pydantic schemas, DB connection pool, Data Quality Agent + Unit Tests | ✅ Completed (9/9 Tests Passed) |
| **Phase 2** | **Physics Engine & Clear-Sky Baseline** | Solar geometry, Ineichen clear-sky radiation, temperature derating, baseline kWh + Unit Tests | ✅ Completed (5/5 Tests Passed) |
| **Phase 3** | **Deterministic Anomaly Decomposition** | Arithmetic deviation split, 30-day statistical anomaly threshold, health metrics + Unit Tests | ✅ Completed (5/5 Tests Passed) |
| **Phase 4** | **Agentic AI Layer & Solar Copilot** | LLM agent tool runner, structured prompt bounding, "Why Did It Drop?" narrator + Unit Tests | ✅ Completed (6/6 Tests Passed) |
| **Phase 5** | **FastAPI Routers, Integration & E2E Tests** | All REST endpoints, CSV upload pipeline, DB seed script, full Integration Test suite | ✅ Completed (15/15 Tests Passed) |

---

## Detailed Phase Breakdown & Task Checklist

### Phase 1: Foundation, Database & Data Quality Engine
- [x] **Task 1.1: Backend Structure & Virtual Environment Setup**
- [x] **Task 1.2: Database Layer Configuration (PostgreSQL + SQLite Fallback)**
- [x] **Task 1.3: SQLAlchemy ORM Models**
- [x] **Task 1.4: Pydantic Domain Schemas**
- [x] **Task 1.5: Data Quality Agent (`app/services/data_quality.py`)**
- [x] **Task 1.6: Phase 1 Unit Tests (9 Tests Passing)**

---

### Phase 2: Physics Engine & Clear-Sky Baseline Modeling
- [x] **Task 2.1: Solar Geometry Calculator**
- [x] **Task 2.2: Clear-Sky Irradiance Model**
- [x] **Task 2.3: System Capacity & Temperature Derating Engine**
- [x] **Task 2.4: Baseline Generation Aggregator**
- [x] **Task 2.5: Phase 2 Unit Tests (5 Tests Passing)**

---

### Phase 3: Deterministic Anomaly Decomposition & Analytics
- [x] **Task 3.1: Deterministic Loss Decomposition Engine**
- [x] **Task 3.2: 30-Day Statistical Anomaly Detector**
- [x] **Task 3.3: System Health Components & Next Best Action Engine**
- [x] **Task 3.4: Phase 3 Unit Tests (5 Tests Passing)**

---

### Phase 4: Agentic AI Layer & Solar Copilot
- [x] **Task 4.1: Agent Tool Registry & Execution Interface**
- [x] **Task 4.2: Bounded "Why Did My Solar Drop?" Narrator**
- [x] **Task 4.3: Solar Copilot Conversational Agent**
- [x] **Task 4.4: Phase 4 Unit Tests (6 Tests Passing)**

---

### Phase 5: FastAPI Routers, Full Integration & End-to-End Testing
- [x] **Task 5.1: REST API Routers**
- [x] **Task 5.2: Database Seed & Sample Data Script**
- [x] **Task 5.3: End-to-End Integration Tests (15 Tests Passing)**
- [x] **Task 5.4: Frontend Connection & Verification (Live on Ports 3001 & 8000)**

---

### Phase 2: Physics Engine & Clear-Sky Baseline Modeling
- [ ] **Task 2.1: Solar Geometry Calculator**
  - Implement solar position calculations: solar elevation, zenith angle, declination, and equation of time given (lat, lon, datetime_utc).
  - Calculate solar incidence angle on tilted panel surface given panel tilt and azimuth.
- [ ] **Task 2.2: Clear-Sky Irradiance Model**
  - Implement Ineichen / Haurwitz clear-sky solar irradiance formula producing Direct Normal Irradiance (DNI), Diffuse Horizontal Irradiance (DHI), and Global Horizontal Irradiance (GHI).
- [ ] **Task 2.3: System Capacity & Temperature Derating Engine**
  - Model cell temperature using ambient temperature and irradiance:  
    $$T_{\text{cell}} = T_{\text{ambient}} + \left(\frac{\text{NOCT} - 20}{800}\right) \times \text{GHI}$$
  - Calculate temperature loss derating (typically $-0.38\% / ^\circ\text{C}$ above $25^\circ\text{C}$).
  - Compute theoretical Clear-Sky Power ($kW$) and Energy ($kWh$) per interval.
- [ ] **Task 2.4: Baseline Generation Aggregator**
  - Generate full-day clear-sky profiles for any system and calendar date.
  - Match actual hourly interval data against the calculated clear-sky baseline.
- [ ] **Task 2.5: Phase 2 Unit Tests**
  - Write `tests/unit/test_physics_engine.py` testing zenith/elevation calculations, zero-night radiation, peak noon generation, and temperature derating.
  - Run and verify all Phase 2 unit tests pass.

---

### Phase 3: Deterministic Anomaly Decomposition & Analytics
- [ ] **Task 3.1: Deterministic Loss Decomposition Engine**
  - Implement the fundamental decomposition identity:
    $$\Delta_{\text{total}} = \max(0, \text{ClearSky\_kWh} - \text{Actual\_kWh})$$
    $$\Delta_{\text{weather}} = \max(0, \text{ClearSky\_kWh} - \text{WeatherAdjusted\_kWh})$$
    $$\Delta_{\text{unexplained}} = \max(0, \text{WeatherAdjusted\_kWh} - \text{Actual\_kWh})$$
  - Classify candidate causes with deterministic contribution percentages (Cloud Cover, Soiling, Inverter Clipping, Shading, Sensor Failure).
- [ ] **Task 3.2: 30-Day Statistical Anomaly Detector**
  - Calculate rolling median and interquartile range (IQR) over preceding 30 days.
  - Flag anomaly if actual generation falls beyond $2.0 \times \text{IQR}$ below median under comparable irradiance.
  - Set `is_provisional_prior = True` when system has $< 14$ days of history.
- [ ] **Task 3.3: System Health Components & Next Best Action Engine**
  - Compute Generation vs Clear-Sky %, Inverter Clipping Loss %, and Data Completeness %.
  - Evaluate Next Best Actions (panel cleaning recommendation, appliance shifting window, tariff optimization).
- [ ] **Task 3.4: Phase 3 Unit Tests**
  - Write `tests/unit/test_decomposition.py` verifying math balance: $\Delta_{\text{weather}} + \Delta_{\text{unexplained}} == \Delta_{\text{total}}$.
  - Write `tests/unit/test_health_analytics.py` verifying clipping and health index calculations.
  - Run and verify all Phase 3 unit tests pass.

---

### Phase 4: Agentic AI Layer & Solar Copilot
- [ ] **Task 4.1: Agent Tool Registry & Execution Interface**
  - Define structured Python tool functions:
    - `tool_get_system_telemetry(system_id, date)`
    - `tool_get_forecast(system_id, days)`
    - `tool_get_decomposition(system_id, date)`
    - `tool_get_health_components(system_id)`
    - `tool_get_appliance_timing(system_id, date)`
- [ ] **Task 4.2: Bounded "Why Did My Solar Drop?" Narrator**
  - Implement structured LLM prompt taking the pre-computed mathematical decomposition as ground-truth facts.
  - Ensure zero hallucination: the LLM is forbidden from inventing kilowatt-hour numbers or asserting causes not present in the candidate causes list.
  - Graceful fallback when API key is unset: generate template-grounded deterministic narration.
- [ ] **Task 4.3: Solar Copilot Conversational Agent**
  - Implement multi-turn assistant session runner with tool calling.
  - Return messages with `tool_calls` and `evidence_chips` exactly matching `CopilotMessage` in `phase 2/src/types/solar.ts`.
- [ ] **Task 4.4: Phase 4 Unit Tests**
  - Write `tests/unit/test_copilot_tools.py` verifying all tools execute deterministically and return schema-valid results.
  - Write `tests/unit/test_narration.py` verifying prompt boundaries and fallback narration generation.
  - Run and verify all Phase 4 unit tests pass.

---

### Phase 5: FastAPI Routers, Full Integration & End-to-End Testing
- [ ] **Task 5.1: REST API Routers**
  - `GET /api/systems` & `GET /api/systems/{id}`
  - `GET /api/readings?system_id=...&date=...`
  - `GET /api/forecast?system_id=...`
  - `GET /api/decomposition/{id}` & `GET /api/decomposition?system_id=...&date=...`
  - `GET /api/health?system_id=...`
  - `GET /api/bills?system_id=...`
  - `GET /api/inspections?system_id=...`
  - `POST /api/copilot/chat`
  - `POST /api/upload/csv`
- [ ] **Task 5.2: Database Seed & Sample Data Script**
  - Implement `app/scripts/seed_data.py` populating realistic 9.6 kW system data, hourly telemetry, and anomaly events.
- [ ] **Task 5.3: End-to-End Integration Tests**
  - Write `tests/integration/test_api_integration.py` executing HTTP client requests against all endpoints.
  - Verify every endpoint responds with HTTP 200 and matches JSON schema expected by `solarDataService.ts`.
- [ ] **Task 5.4: Frontend Connection & Verification**
  - Verify seamless communication between the running frontend (Port 3001) and backend API (Port 8000).
