# SolarSense AI — Agent Architecture

**Version:** 1.0 · Companion to `02_TRD.md`, `09_Claude_Integration.md`

---

## 1. Governing Principle

There is **one** deterministic pipeline for the core loop, and **one** genuinely agentic surface (the Copilot). This is a deliberate correction: an earlier design used six LLM agents behind a router for a workflow with no real branching — the router called every agent anyway, meaning no decision was actually being made, just latency and cost added for the appearance of "agentic." That pattern is not reintroduced anywhere in this architecture, regardless of how much feature scope is added on top.

## 2. Core Pipeline (deterministic, no LLM routing)

```text
Input (CSV / bill / image)
        │
        ▼
Data Quality Agent  ──── runs FIRST, before anything else touches the data
        │
        ▼
Clear-sky baseline (pvlib) + ML forecast   ── two separate models, never conflated
        │
        ▼
Deviation decomposition (weather-explained vs. unexplained)
        │
        ▼
Structured result object
        │
        ├──► Dashboard (render directly, no LLM in the path)
        └──► LLM narration (phrasing only, see §4)
```

This is a **fixed sequence**. No step is skipped conditionally by an LLM's judgment; branching (e.g., "was there a vision finding in this window?") is ordinary application logic against the schema, not a model decision.

## 3. Data Quality Agent (the one "agent" in the deterministic path, despite the name)

Despite being called an "agent," this is rule-based/statistical, not LLM-driven — it's grouped with the pipeline, not the Copilot.

**Runs on every upload, before any downstream feature touches the data:**
- Missing values (gaps in expected reading cadence)
- Duplicate rows
- Sensor spikes (statistical outliers inconsistent with physical plausibility, e.g. negative generation, generation exceeding rated capacity)
- Timestamp gaps / impossible values (non-monotonic time, future timestamps, DST-transition artifacts)

**Output:** a `data_quality_reports` row (`issues_json`, `passed`). On failure, the upload flow halts before baseline/forecast computation; on partial pass, flagged ranges are tagged so every downstream chart/number can visually mark them rather than silently averaging over bad data.

**Why it's built early and gates everything:** it's comparatively cheap and protects every downstream number (forecast, baseline comparison, health metrics, anomaly flags) from training or reporting on corrupted input. It is a hard dependency for every other track, not a nice-to-have.

## 4. "Why Did It Drop?" — Division of Labor

| Step | Owner | Notes |
|---|---|---|
| Pull deviation decomposition | Deterministic | From `anomalies` / `clearsky_baseline` / `energy_readings` |
| Rank candidate causes by contribution | Deterministic | weather-explained gap, panel-inspection findings in window, data-quality flags, open maintenance events |
| Produce `{primary_cause, primary_contribution_pct, secondary_causes[], evidence_refs[]}` | Deterministic | Same inputs → same ranking, every time — reproducible |
| Phrase the structured object in plain language | LLM | Instructed to cite only the given `evidence_refs`, never infer new causes (see `09_Claude_Integration.md §3`) |

The LLM never decides **what** happened — only **how to say it**. This is what keeps the ranking honest and avoids the product becoming "an LLM wrapper" around causes it wasn't actually given evidence for.

## 5. Solar Copilot — Where Tool-Calling Genuinely Earns Its Place

Free-form user questions ("when should I run my washing machine," "explain this like I'm a beginner," "what's my ROI so far") are open-ended enough that routing to the right computed data via tool calls is the right pattern — this is real branching, unlike the core pipeline.

**Tool set (fixed, scoped to the user's own computed data — no tool queries another user's data):**

| Tool | Reads from | Purpose |
|---|---|---|
| `get_forecast(system_id, range)` | `forecasts` | Next N days, with prediction interval |
| `get_decomposition(system_id, date)` | `anomalies`, `clearsky_baseline`, `energy_readings` | Same structured object used by Why-Did-It-Drop |
| `get_health_components(system_id)` | derived from `anomalies`, `panel_inspections` | Components, not a composite (per TRD §9) |
| `get_bill_summary(system_id, period)` | `electricity_bills` | Includes tariff assumptions used |
| `search_user_docs(system_id, query)` | `knowledge_chunks` (RAG) | User's own manuals/history only — never general solar trivia |
| `get_appliance_timing(system_id, date)` | `forecasts` | Derived recommendation window |

Full tool schemas and system-prompt contract are defined in `09_Claude_Integration.md`. Every Copilot turn is logged to `agent_runs` (`tool_calls_json`, `latency_ms`, `cost_usd`) for cost-budget tracking (TRD §11).

## 6. Human-in-the-Loop Review

- Vision findings and anomalies are **not** self-certifying. A `technician`/`reviewer` role sees a queue (ranked by `unexplained_pct`) and sets `reviewed_by_user` / `review_outcome` on `panel_inspections`.
- Rejected findings are excluded from future `evidence_refs` in Why-Did-It-Drop and Copilot answers — the review loop actually changes what the system says next, not just an audit log nobody reads.
- Aggregate confirm/reject outcomes feed the evaluation harness (precision/recall against real incidents, TRD §10).

## 7. What Is Explicitly *Not* Agentic

To keep this architecture from drifting back toward the original six-agent design as features accumulate:

- The Data Quality Agent, baseline computation, decomposition, and health components are **rule-based/statistical**, not LLM-driven, regardless of naming.
- The Daily Brief and Report export reuse the exact same structured objects and narration contract as Why-Did-It-Drop — they are not separate agents with separate logic.
- The "What If?" Simulator re-runs the same deterministic models under hypothetical inputs; it does not introduce a new model or an LLM in its computation path.
- RAG retrieval (`search_user_docs`) is a tool the Copilot calls, not an autonomous agent that acts without being invoked by a user turn.

## 8. Cost & Latency Accounting

Every LLM-touching operation (Why-Did-It-Drop narration, Daily Brief, Copilot turn) is logged with `latency_ms` and `cost_usd` at the `agent_runs` level, rolled up per user per month against the LLM cost ceiling defined in the PRD's Open Decisions (§10, item 4) before Daily Brief or Copilot ship broadly (per TRD §11 non-functional requirements).
