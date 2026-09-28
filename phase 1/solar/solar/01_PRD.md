# SolarSense AI — Product Requirements Document (PRD)

**Version:** 1.0 · **Status:** Draft for build · **Owner:** Product/Eng

---

## 1. Product Thesis

> Upload your solar data → SolarSense understands it → detects problems → predicts energy → explains the result → recommends an action.

The differentiator is **explainability**: every claim the product makes (an anomaly, a health metric, a "why did it drop") traces back to an arithmetic decomposition against a physical baseline — not an ML model comparing itself to its own error, or an LLM inventing a cause it wasn't given evidence for.

**Core message:** "SolarSense turns scattered solar data into understandable decisions."

---

## 2. Problem Statement

Residential and small-commercial solar owners get a generation number from their inverter app and little else:

- No way to tell if a dip is weather or a real fault (soiling, shading, degradation, inverter issue).
- Utility bills are dense and hard to reconcile against tariff/net-metering rules.
- No single place that connects generation data, bills, and panel photos into one explanation.
- Existing "AI" solar tools tend to over-claim (calibrated-sounding confidence on uncalibrated vision models, panel-level insight from string-level data).

## 3. Target Users

| Persona | Need | Primary surface |
|---|---|---|
| Residential solar owner | "Is my system OK? Why did output drop? What should I do?" | Dashboard, Why-Did-It-Drop, Copilot |
| Prospective solar buyer | "Is my roof worth it? What would I generate?" | Solar Potential Estimator |
| Small installer / technician (secondary) | Review flagged findings before acting | Human-in-the-Loop review queue |
| Builder (you) | Portfolio/demo artifact proving an honest, working explainability pipeline | Full feature set, Simulation Mode |

## 4. Goals

1. Prove the "data → explanation → action" loop end to end on real generation data, honestly labeled.
2. Support multimodal input (CSV, bills, panel photos, thermal) without letting any one modality overclaim what it knows.
3. Ship the full original feature set (see Section 6) without reintroducing the structural flaws a prior review identified (see Section 8).
4. Be demoable and coherent at every milestone, not just at the end.

## 5. Non-Goals (explicit)

- Panel-level attribution for string-inverter-only installs (no hardware data to support it).
- IoT integration, live inverter control, satellite/roof GIS, mobile-native app in parallel with web, multi-LLM-provider support, blockchain — all explicitly deferred, not planned for any milestone in this document.
- Presenting vision output as a calibrated diagnostic or a stand-alone alert.
- A single composite "health score" until there's enough labeled data to weight it defensibly (Option B, Section 11 of the technical plan, is the default).

## 6. Feature Inventory (by track — see `10_Workflow.md` for sequencing)

### Track A — Core Data & Forecasting
- Solar Generation Forecasting
- Energy Anomaly Detection (deviation decomposition)
- "Why Did My Solar Drop?"
- Explainable AI presentation layer (prediction → evidence → confidence → action, applied everywhere)
- Solar Health Score / components

### Track B — Document & Vision AI
- AI Electricity Bill Analyzer (1–2 utilities first)
- Solar Potential Estimator
- Solar Panel Image Analyzer
- Thermal Image Analyzer
- Data Quality Agent (gates all uploaded data)

### Track C — Agent, Copilot & Knowledge
- Solar Copilot (tool-calling over computed data)
- Agent Architecture (deterministic pipeline + copilot layer)
- RAG Knowledge Base (user's own manuals/history, narrow scope)
- Human-in-the-Loop review

### Track D — Product, Engagement & Reporting
- Dashboard & onboarding
- Personalized Daily Solar Brief
- Smart Appliance Timing
- Maintenance Timeline
- Automated Solar Report / PDF export
- Simulation Mode / demo system
- "What If?" Simulator
- Engagement layer (streaks, goals, carbon impact, achievements) — lowest priority, first to cut

### Track E — Infrastructure, Evaluation & Trust
- Schema, auth, multi-tenant isolation
- Privacy handling
- Evaluation harness
- Model/version tracking
- CI, basic deploy
- LLM cost/latency budget tracking

## 7. Success Metrics

| Metric | Target / definition |
|---|---|
| End-to-end honesty | 100% of probabilistic outputs carry confidence/model-score language (Definition of Done, Section 9) |
| Forecast accuracy | MAE/RMSE/MAPE reported per walk-forward fold, not a single number |
| Anomaly precision | Precision/recall against any labeled real incidents; false-positive rate tracked |
| Dashboard latency | Core numbers render without waiting on any LLM call |
| LLM cost | Defined $/user/month ceiling before Daily Brief or Copilot ship broadly |
| Milestone coherence | Each milestone (M1–M4, see Workflow doc) is independently demoable |

## 8. Foundations That Must Not Be Skipped

Carried over as non-negotiable regardless of scope pressure:

1. Clear-sky physical baseline (`pvlib`) as the anomaly reference — never the ML forecast.
2. Deviation decomposition (weather-explained vs. unexplained) shared by anomalies, health metrics, and "why did it drop."
3. Deterministic core pipeline; LLM used only for narration and the copilot's tool-calling.
4. Chronological / walk-forward evaluation; forecast-vintage-aware training.
5. Data Quality Agent runs first, before any feature touches uploaded data.
6. Multi-tenant isolation + basic privacy handling, in the schema from day one.
7. Vision and bill-extraction outputs labeled with real confidence/model-score language, never presented as diagnoses.

## 9. Definition of Done (per feature)

A feature is "shipped" only if it meets all four:

1. Works end to end on real or realistic data, not a hardcoded example.
2. Labeled honestly — confidence/model-score language for anything probabilistic, assumptions shown for anything financial.
3. Doesn't bypass the foundations (Section 8) — no ad hoc baseline, no skipping the Data Quality Agent.
4. Isolated per user — respects the multi-tenant schema; no query without a `user_id` scope.

## 10. Open Decisions (need answers before build starts)

1. **Panel-level data:** string-level only for v1–v2, or scope in a specific microinverter/optimizer API (Enphase/SolarEdge) now?
2. **Target utilities for the bill analyzer:** which 1–2 utilities/DISCOMs can you actually collect sample bills from?
3. **Vision training data:** real labeled rooftop photos available/collectible, or stays a stretch goal?
4. **LLM cost ceiling:** acceptable $/user/month, to decide if Daily Brief + Copilot are viable at scale vs. demo-only.

## 11. Milestones

| Milestone | Contains | Proves |
|---|---|---|
| M1 | Track E thin slice + Track A complete | The core explainability claim works on real generation data |
| M2 | + Track B (bills, potential estimator, vision) | Multimodal input works, still honestly scoped |
| M3 | + Track C (copilot, why-it-dropped narration, RAG, human-in-the-loop) | The "agentic" story is real |
| M4 | + Track D (brief, report, simulator, engagement) | Full feature list shipped and demoable end to end |

## 12. Related Documents

`02_TRD.md` · `03_User_Flow.md` · `04_Wireframes.md` · `05_UI_UX_Flow.md` · `06_Design_System.md` · `07_Backend_Schema.md` · `08_Agent_Architecture.md` · `09_Claude_Integration.md` · `10_Workflow.md`
