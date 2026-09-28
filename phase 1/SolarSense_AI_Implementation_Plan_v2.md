# SolarSense AI — Corrected Implementation Plan (v2)

> This is a revision of the original brainstorm doc. The product vision and feature list are preserved. What's changed: every structural flaw identified in review has been designed out — the ML baseline, the evaluation methodology, the agent architecture, the data model, privacy handling, and the build sequence. This document is meant to be buildable, not just inspiring.

---

## 0. What Changed and Why (read this first)

| # | Flaw in v1 | Fix in v2 |
|---|---|---|
| 1 | Panel-level attribution assumed everywhere, but most installs only report system-level totals | Panel-level features are gated behind a detected data capability; string-level is the default path |
| 2 | Anomaly detection compared actual vs. an ML forecast — so it mostly detected forecast error, not real anomalies | Baseline is a physical clear-sky model (pvlib), not the ML forecast. Anomaly = unexplained residual after weather is accounted for |
| 3 | No leakage-safe evaluation plan; forecast/observed weather mismatch | Chronological/walk-forward splits, forecast-vintage-aware training, explicit metrics per component |
| 4 | Six LLM agents behind an orchestrator, for a workflow with no real branching | Deterministic pipeline for the core loop; LLM used only for narration and open-ended Q&A tool-calling |
| 5 | Vision presented as a calibrated diagnostic (89% confidence) | Vision reframed as a coarse, corroborating signal with model-score language, not probability |
| 6 | Bill parsing treated as solved; no validation, no correction UI, no tariff-region handling | Extraction confidence gating, arithmetic reconciliation checks, user-editable fields, explicit tariff assumptions |
| 7 | No privacy/security design despite handling bills, addresses, consumption patterns | Redaction, retention policy, per-user data isolation, and auth specified before build starts |
| 8 | "MVP" actually contained 4 separate ML problems + chat + reports + dashboard | MVP narrowed to one data path proving the core thesis end to end |
| 9 | Docker/Redis/Celery/MLflow/ChromaDB→pgvector all planned upfront | Infra introduced only when a specific bottleneck appears; documented triggers below |
| 10 | Timezones, health-score weighting, RAG value, and non-functional requirements unspecified | Each addressed explicitly in its own section |

The single highest-leverage change is **#2**: swapping the forecast-vs-actual anomaly detector for a clear-sky-vs-actual one. It's what makes anomaly detection, the health score, and "why did my solar drop" all mean something real instead of measuring model noise.

---

## 1. Product Thesis (unchanged)

> Upload your solar data → SolarSense understands it → detects problems → predicts energy → explains the result → recommends an action.

The differentiator stays the same: SolarSense connects multimodal evidence to explain *why*, not just report numbers. That claim now has an architecture underneath it that can actually support it.

---

## 2. Revised MVP Scope

The original MVP bundled bill parsing (document AI), forecasting (time series ML), vision (computer vision), anomaly detection, a chat copilot, and a PDF report generator — four distinct ML disciplines plus two products, as a "v1."

**New MVP v1: one data path, done correctly.**

1. User uploads a solar generation CSV (timestamp, kWh, plus system metadata: capacity, tilt, azimuth, location).
2. System builds a clear-sky expected-output baseline for that system (Section 5).
3. System computes actual-vs-clear-sky deviation, decomposed into weather-explained and unexplained components (Section 6).
4. Dashboard shows generation, expected output, and a plain-language explanation of any gap — generated from the decomposition, not invented by an LLM.
5. Basic report export (the numbers and the explanation, not a 9-section document).

This alone proves "data → explanation → action" end to end and is honest about what the system actually knows. Everything else is staged below.

### MVP v1.1 (same data path, adds document input)
- Bill analyzer, scoped to 1–2 DISCOMs/utilities you can actually test against, with the validation and correction UI from Section 8. Not a general-purpose parser yet.

### v2 (Agentic upgrade)
- Solar Copilot (tool-calling LLM over the user's own computed data — not a new agent per feature)
- "Why did my solar drop?" as a UI entry point into the same deterministic decomposition, narrated by the LLM
- Panel image analyzer, scoped per Section 9
- Data Quality Agent (this is cheap to build and protects everything downstream — pull it forward if time allows)

### v3
- Thermal imaging, RAG knowledge base (narrowed per Section 12), maintenance timeline, "what if" simulator, panel-level analysis gated on microinverter/optimizer data

### Explicitly deferred (per original doc's own instinct, now enforced)
IoT integration, live inverter control, satellite/roof GIS, mobile app in parallel with web, multiple LLM providers, blockchain — none of this changes before v3 at the earliest.

---

## 3. Data Availability Reality Check

Before building panel-level or per-panel-photo features, establish which of these the target user actually has:

- **String inverter only** (most residential installs): one aggregate generation number. No panel-level anything is possible without new hardware.
- **Microinverters / DC optimizers** (Enphase, SolarEdge, etc.): panel-level data exists, but only via that vendor's API, which requires an integration and the user's account credentials.

**Decision the plan must make explicitly:** either (a) scope v1–v2 to string-level and remove panel attribution from the UI language, or (b) name the specific optimizer/microinverter API as a required integration and gate panel features behind "connect your Enphase/SolarEdge account." Don't ship UI copy that implies panel-level insight the backend can't produce. Panel *image* analysis is independent of this — a photo can be tagged by the user ("this is the panel on the east corner") without needing telemetry to match.

---

## 4. Data Model

Key changes from v1: every table is tenant-scoped, timestamps carry an explicit timezone convention, and forecasts store their own vintage so they can be evaluated honestly later.

```text
users
  id, email, created_at, ...

solar_systems
  id, user_id (FK), capacity_kw, tilt_deg, azimuth_deg,
  latitude, longitude, timezone, installed_at

panels                          -- only populated if optimizer/microinverter data exists
  id, solar_system_id (FK), position_label, capacity_w

energy_readings
  id, solar_system_id (FK), panel_id (nullable FK),
  reading_time_utc, kwh, source

weather_observations
  id, solar_system_id (FK), observed_time_utc,
  ghi, cloud_cover, temperature, source

clearsky_baseline
  id, solar_system_id (FK), target_time_utc, expected_kwh, model_version

forecasts
  id, solar_system_id (FK),
  forecast_made_at_utc,          -- vintage: when the forecast was generated
  target_time_utc,                -- what time it's predicting
  predicted_kwh, model_version

electricity_bills
  id, user_id (FK), utility_name, billing_period_start, billing_period_end,
  units_consumed, total_amount, tariff_rate, extraction_confidence,
  raw_file_ref, verified_by_user (bool)

panel_inspections
  id, panel_id (nullable FK), solar_system_id (FK), image_ref,
  finding_label, model_score, model_version, reviewed_by_user (bool)

anomalies
  id, solar_system_id (FK), detected_at_utc,
  deviation_pct, weather_explained_pct, unexplained_pct, status

maintenance_records
  id, solar_system_id (FK), event_type, event_time_utc, notes

chat_sessions / chat_messages
  id, user_id (FK), ...

agent_runs
  id, user_id (FK), tool_calls_json, latency_ms, cost_usd, created_at
```

**Timezone convention:** store everything in UTC. Convert to the system's local timezone (stored on `solar_systems.timezone`) only at display time. Solar generation is inherently tied to local solar time — get this wrong once and every chart is silently off by hours. Write this rule down in the codebase's README, not just this doc.

**Multi-tenancy:** every query-facing table has a `user_id` or joins to one. Enforce row-level isolation at the ORM/query layer, not just in application logic — a single missed `WHERE user_id = ?` is a data breach in a product handling utility bills and addresses.

---

## 5. Forecasting & Baseline (the core fix)

**Problem being solved:** an ML forecast has 10–25% typical error on solar generation, driven mostly by weather-forecast uncertainty. If that forecast is also the "expected" value used for anomaly detection, you cannot tell a real 8% soiling loss from ordinary forecast noise.

**Fix: two separate models with two separate jobs.**

1. **Clear-sky physical baseline** (for anomaly detection): compute the theoretical maximum output for this system's exact capacity, tilt, azimuth, and location on a given day, using an established solar-position/irradiance model (e.g. `pvlib`'s clear-sky and PV modeling functions). This has no weather uncertainty in it — it's physics and geometry.
2. **ML forecast** (for "what will I generate tomorrow"): a real time-series model using historical generation + weather forecast features. This is allowed to have normal forecast error, because its job is prediction, not anomaly detection.

Do not use model 2's output as the anomaly baseline. That's the mistake being corrected.

**Modeling approach for the ML forecast:**
- Start with gradient-boosted trees (XGBoost/LightGBM) on engineered features (hour, day-of-year, forecast irradiance, forecast cloud cover, temperature, recent generation lags). This will likely outperform a from-scratch deep model at this data scale and is far easier to debug.
- Only move to a transformer/deep time-series model if benchmarking shows a real gap — the original doc's instinct on this ("don't use deep learning because it sounds advanced") was correct and should stay a hard rule, not a suggestion.
- Report a prediction interval, not a point estimate — the original doc's "18.9–23.4 kWh" example was right; make sure the model actually produces that (quantile regression or a calibrated residual-based interval), not a fabricated ±5%.

---

## 6. Anomaly Detection — Deviation Decomposition

Replace the single "-25% deviation" number with a decomposition so the number is explainable, not just alarming:

```text
Clear-sky expected:        23.2 kWh
Weather-adjusted expected: 19.8 kWh   (clear-sky × weather derate factor)
Actual:                    17.4 kWh

Weather-explained gap:     -3.4 kWh  (23.2 → 19.8)
Unexplained gap:           -2.4 kWh  (19.8 → 17.4)  ← this is the anomaly signal
```

The weather derate factor comes from cloud cover / GHI observations, not from the ML forecast (avoiding the same leakage problem). Only the unexplained residual feeds `anomalies.unexplained_pct` and only that number should trigger a "check your panels" recommendation. This one change is what lets Section 7 ("why did it drop") and the health score (Section 11) report something real.

**Thresholding:** don't hardcode a single cutoff like "25% = anomaly." Use the system's own recent unexplained-residual distribution (e.g. flag when the residual is a statistical outlier relative to its own trailing 30-day distribution) so sensitivity adapts per system instead of using one global number that's wrong for most installs.

---

## 7. "Why Did My Solar Drop?" — Deterministic First, LLM Second

This is the flagship feature, so it's worth being precise about what's arithmetic and what's language.

**Arithmetic (deterministic, computed every time, no LLM involved):**
1. Pull the deviation decomposition from Section 6.
2. Rank candidate causes by contribution size: weather-explained gap, any flagged panel inspection findings in the relevant window, any data-quality flags, any open maintenance events.
3. Produce a structured object: `{primary_cause, primary_contribution_pct, secondary_causes: [...], evidence_refs: [...]}`.

**Language (LLM, narration only):**
4. Pass that structured object to the LLM with an instruction to phrase it in plain language and cite only the evidence refs provided — not to infer new causes.

This keeps the ranking honest and reproducible (same inputs → same ranking, every time) while still getting natural-language output. It also directly avoids becoming "the LLM wrapper" the original doc warned against — the LLM never decides *what* happened, only how to say it.

---

## 8. Bill Analyzer — Scoped and Validated

**Scope for v1.1:** pick 1–2 utilities/DISCOMs you can actually collect sample bills from and test against. Do not attempt general-purpose parsing across all formats before one format works reliably.

**Extraction pipeline:**
1. Document/image model extracts: billing period, units consumed, total amount, tariff rate, fixed charges.
2. **Reconciliation check:** does `units × tariff_rate + fixed_charges ≈ total_amount` within a tolerance? If not, flag the whole extraction as low-confidence.
3. Every extracted field gets an `extraction_confidence` score. Below a threshold, the field is shown to the user as editable and unverified, not presented as fact.
4. User can correct any field; corrections are stored (`verified_by_user`) and — later — usable to measure real-world extraction accuracy.

**Tariff and savings estimates:** slab tariffs and net-metering rules vary by state/utility and change via regulatory order. Never hardcode them. Show the assumptions used (tariff slab, net-metering rate) directly in the UI next to any savings number, and let the user override them. This is the one place in the product where a wrong silent number has real financial consequences for someone — treat it accordingly.

---

## 9. Panel Image Analyzer — Honest Scope

**Reframe from "diagnostic" to "corroborating signal."**

- Train/evaluate on a coarse label set you can actually get data for: soiling, visible physical damage, shading, other/unclear. Don't promise crack detection or discoloration classification unless you have a labeled dataset that supports it — lab-image datasets (e.g. electroluminescence cell datasets) do not transfer to handheld RGB rooftop photos, and this substitution is a common failure mode worth naming explicitly so it isn't repeated.
- Report a **model score**, not a probability, and say so in the UI ("model score: 0.89" not "confidence: 89%") unless the model has actually been calibrated (e.g. via Platt scaling against a held-out labeled set) — an uncalibrated softmax output is not a real probability.
- **Vision findings should not trigger standalone alerts in v1–v2.** Surface them only alongside an energy-side anomaly (Section 6) as corroborating evidence — "generation is down, and here's a photo-based finding that might explain it" — rather than an independent diagnosis a user could act on alone (e.g. paying for a technician visit).
- Thermal imaging is v3, gated on getting an actual thermal dataset from real installs — public thermal fault datasets are small and mostly fixed-altitude drone captures, which won't match a technician's handheld thermal camera.

---

## 10. RAG Knowledge Base — Narrowed

The original scope (solar manuals, papers, general educational content) mostly duplicates what a base LLM already knows — "what causes hotspots" doesn't need retrieval. Keep RAG, but scope it to content that's genuinely specific and otherwise inaccessible to the model:

- The user's own inverter/panel manual (if uploaded)
- The user's own maintenance history and past inspection findings
- A small, curated set of standards/guidelines where licensing clearly permits reuse

This is a deliberately smaller RAG scope than v1's, and it's the version that actually earns its place instead of being added for the term itself.

---

## 11. Health Score — Make the Weighting Real or Drop It

A 0–100 score built from four subjectively-weighted components (performance, consistency, panel condition, maintenance) isn't transparent just because the components are visible — the weights themselves are still arbitrary. Two honest options:

- **Option A:** derive weights empirically — e.g., fit weights against a labeled set of systems with known issues vs. healthy systems, so the score has some evidential basis.
- **Option B (recommended for v1–v2):** don't produce a single composite number yet. Show the components directly (generation vs. clear-sky, unexplained-anomaly frequency, open inspection findings) without collapsing them into one score. Add the composite once there's enough real usage data to weight it defensibly.

---

## 12. Agent Architecture — Deterministic Pipeline, LLM at the Edges

**v1–v2 pipeline (no LLM routing):**

```text
Input (CSV / bill / image)
        │
        ▼
Parse & validate  (Data Quality Agent — see below)
        │
        ▼
Clear-sky baseline + ML forecast
        │
        ▼
Deviation decomposition (Section 6)
        │
        ▼
Structured result object
        │
        ├──► Dashboard (render directly)
        └──► LLM narration (Section 7) — phrasing only
```

This is a fixed sequence, not a set of six agents behind a router deciding what to call — the v1 orchestrator example called every agent anyway, which means there was no real decision being made, just latency and cost being added for the appearance of "agentic."

**Where an LLM with tool-calling genuinely earns its place: the Solar Copilot.** Free-form user questions ("when should I run my washing machine," "explain this like I'm a beginner") are open-ended enough that routing to the right computed data via tool calls is the right pattern. Scope tool-calling to this conversational surface, not the core deterministic pipeline.

**Data Quality Agent — worth building early.** Before anything else runs on uploaded data, check: missing values, duplicate rows, sensor spikes, timestamp gaps/impossible values. This is comparatively cheap, and it protects every downstream number (forecast, baseline comparison, health metrics) from silently training or reporting on corrupted input. Pull this forward in the schedule even though it's listed as v2 in the phased roadmap — it's worth doing before the MVP dashboard ships.

---

## 13. Privacy & Security (new section — absent in v1)

This was entirely missing from the original plan, despite the product handling utility bills (name, address, consumer number) and consumption patterns that reveal occupancy.

- **PII handling:** redact or mask name/address/consumer-number fields before any data is sent to a third-party LLM API for bill parsing, where feasible. If full-document vision extraction requires the unredacted image, document that explicitly as a data-flow decision, not an oversight.
- **Retention policy:** define how long raw bill images/CSVs are kept, and give users a way to delete their data. Write this down before storing the first real user's bill.
- **Auth & isolation:** standard auth (don't roll your own), and enforce per-user row isolation at the query layer (Section 4) — not just checked in application code, where one missed filter becomes a cross-user data leak.
- **Third-party API exposure:** be explicit about what leaves your infrastructure and goes to an LLM/vision API provider, and say so in a privacy notice a user can actually read.

None of this needs to be heavyweight for a demo/portfolio-stage project, but it needs to exist and be a deliberate decision, not a gap discovered later.

---

## 14. Evaluation Methodology

**Forecasting:**
- **Chronological split**, not random — solar time series has strong autocorrelation at 5–15 minute granularity, and a random split leaks near-duplicate readings between train and test, inflating accuracy.
- **Walk-forward validation**: train on data up to time T, evaluate on T+1..T+k, roll forward. This is what "will this model work when deployed" actually looks like.
- **Train on forecast-vintage weather features**, not observed weather — if the model trains on ground-truth irradiance but serves on a weather *forecast* at inference time, production error will be substantially worse than validation error suggested. Use the `forecast_made_at` / `target_time` distinction from the schema to align this correctly.
- Metrics: MAE, RMSE, MAPE where the denominator isn't near zero, and prediction-interval coverage if using probabilistic forecasts.

**Vision (classification):** precision, recall, F1, confusion matrix — and report these per class, since soiling/damage/shading likely have very different sample sizes.

**Anomaly detection:** precision/recall against any labeled real incidents you can gather, false-positive rate, and detection delay (how long after a real issue starts does the system flag it).

**Copilot / RAG (once built):** retrieval relevance, groundedness (does the answer match the retrieved evidence), and tool-selection success rate for the copilot's function-calling.

---

## 15. Tech Stack — Staged, Not Upfront

**Build first:**
- Frontend: Next.js, TypeScript, Tailwind, Recharts
- Backend: FastAPI, Pydantic, SQLAlchemy, PostgreSQL
- ML: scikit-learn / XGBoost / LightGBM, `pvlib` for the clear-sky baseline
- Basic auth, basic deploy (a single container is fine)

**Add only when a specific problem appears, not preemptively:**
- **Redis + Celery** — once a specific operation (bill OCR, report generation) is slow enough to need to run outside the request/response cycle. Don't add background-task infra before there's a background task that needs it.
- **Docker Compose for multi-service local dev** — once there are actually multiple services to coordinate.
- **MLflow** — once there's more than one model version worth comparing systematically.
- **ChromaDB** — only when Section 10's narrowed RAG scope is actually being built, and only if Postgres + pgvector doesn't suffice (it likely does at this scale, which also avoids the "migrate later" step the original plan already flagged as unnecessary work).
- **GitHub Actions** — worth setting up early since it's cheap (tests + basic CI), unlike the others on this list.

**ML stack for later stages:** transformer time-series models, Vision Transformers, YOLO/segmentation — only after benchmarking shows simpler models (Section 5) are insufficient. This mirrors the original doc's own instinct and keeps it as an enforced rule.

---

## 16. Non-Functional Requirements (new — absent in v1)

- **Latency targets:** dashboard load and core numbers should render without waiting on an LLM call — compute and cache the deterministic pipeline (Sections 5–6) independent of narration, so the UI never blocks on model latency for numbers it already has.
- **LLM cost budget:** a daily brief sent to every user, plus copilot conversations, is a recurring per-user LLM spend. Put a number on this (e.g. cost per user per month) before building the daily-brief feature, not after.
- **Graceful degradation:** if the LLM API is unavailable, the dashboard should still show numbers and the deterministic decomposition — only the narrated explanation and copilot should degrade, not the whole page. (This is also the practical fix for the blank-screen failure mode from your earlier question — nothing in the render path should hard-block on an external API call.)
- **Model versioning at inference:** every stored prediction/finding (`forecasts.model_version`, `panel_inspections.model_version`) should record which model produced it, so a model update doesn't silently make historical records incomparable.

---

## 17. Feature-to-Phase Map

| Original feature | Phase | Notes |
|---|---|---|
| Dashboard (generation/forecast/health) | MVP v1 | Health shown as components, not composite (Section 11) |
| Solar Generation Forecasting | MVP v1 | Clear-sky baseline + separate ML forecast (Section 5) |
| Energy Anomaly Detection | MVP v1 | Deviation decomposition (Section 6) |
| Automated Solar Report (basic) | MVP v1 | Numbers + explanation only, not full 9-section doc yet |
| AI Electricity Bill Analyzer | v1.1 | Scoped to 1–2 utilities, validated (Section 8) |
| "Why Did My Solar Drop?" | v2 | Deterministic decomposition + LLM narration (Section 7) |
| Solar Copilot | v2 | Tool-calling over computed data, not per-feature agents |
| Data Quality Agent | pull forward, before MVP dashboard ships | Protects all downstream numbers |
| Solar Panel Image Analyzer | v2 | Corroborating signal only, coarse classes (Section 9) |
| Solar Potential Estimator | v2 | Straightforward; low architectural risk |
| Smart Appliance Timing | v2 | Built on existing forecast, low incremental cost |
| Maintenance Timeline | v2 | Simple CRUD; feeds the decomposition's evidence refs |
| RAG Knowledge Base | v3 | Narrowed scope (Section 10) |
| Thermal Image Analyzer | v3 | Gated on real thermal dataset access |
| Human-in-the-Loop review | v3 | Valuable once there's enough model output to review |
| Personalized Daily Brief | v3 | Gate on the cost budget in Section 16 |
| "What If?" Simulator | v3 | Clearly labeled as simulation, isolated from real data |
| Simulation/demo mode | v3 (or earlier if needed for demos) | Hard-separated from training/eval data |
| Panel-level anything | v3, conditional | Only if microinverter/optimizer integration is in scope (Section 3) |
| IoT, satellite, voice, mobile, fleet, technician portal | Explicitly deferred | Unchanged from original doc's own instinct |

---

## 18. Open Decisions (need your input before build starts)

1. **Panel-level data:** commit to string-level only for v1–v2, or scope in a specific microinverter/optimizer API integration now? (Section 3)
2. **Target utilities for the bill analyzer:** which 1–2 DISCOMs/utilities can you actually get sample bills from to test against? (Section 8)
3. **Vision training data source:** do you have or can you collect real rooftop photos with labels, or does this stay a stretch goal until that exists? (Section 9)
4. **LLM cost ceiling:** what's an acceptable per-user monthly spend, to decide whether the daily brief and copilot are viable at scale vs. demo-only? (Section 16)

---

## 19. The Core Message (unchanged, now actually supported by the architecture)

**"SolarSense turns scattered solar data into understandable decisions."**

The difference from v1: every claim the product makes — the anomaly, the health metric, the "why it dropped" explanation — now traces back to an arithmetic decomposition against a physical baseline, not a forecast comparing itself to its own error, or an LLM inferring causes it wasn't given evidence for. That's what makes the explainability pitch defensible instead of aspirational.
