# SolarSense AI — Technical Requirements Document (TRD)

**Version:** 1.0 · Companion to `01_PRD.md`

---

## 1. Architecture Overview

```mermaid
flowchart TD
    A[Input: CSV / Bill / Image] --> B[Data Quality Agent]
    B --> C[Clear-sky baseline (pvlib) + ML forecast]
    C --> D[Deviation decomposition]
    D --> E[Structured result object]
    E --> F[Dashboard: render directly]
    E --> G[LLM narration: phrasing only]
    H[Solar Copilot: tool-calling LLM] -.reads.-> E
    H -.reads.-> I[(RAG: user manuals + history)]
```

**Principle:** the core loop (parse → baseline → decompose → structure) is a **fixed deterministic pipeline**. There is no LLM router deciding between agents — that pattern was tried, added latency/cost, and made no real branching decision. The LLM enters at exactly two points: narrating an already-computed structured object, and the Copilot's open-ended tool-calling surface.

## 2. Tech Stack (staged, not upfront)

**Build first:**
| Layer | Choice |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind, Recharts |
| Backend | FastAPI, Pydantic, SQLAlchemy, PostgreSQL |
| ML | scikit-learn / XGBoost / LightGBM; `pvlib` for clear-sky baseline |
| Auth | Standard auth provider (don't roll your own) |
| Deploy | Single container to start |
| CI | GitHub Actions (cheap, set up early) |

**Add only when a specific bottleneck appears:**
| Trigger | Add |
|---|---|
| A specific op (bill OCR, report gen) is too slow for request/response | Redis + Celery |
| Actually >1 service to coordinate locally | Docker Compose |
| >1 model version worth comparing systematically | MLflow |
| RAG scope (Section 6 below) is being built and pgvector doesn't suffice | ChromaDB |

**Later-stage ML (only after benchmarking shows simpler models insufficient):** transformer time-series models, Vision Transformers, YOLO/segmentation.

## 3. Forecasting & Baseline

**Two separate models, two separate jobs — do not conflate them:**

1. **Clear-sky physical baseline** (anomaly reference): theoretical max output for this system's exact capacity/tilt/azimuth/location, via `pvlib`'s solar-position and PV modeling functions. No weather uncertainty — physics and geometry only.
2. **ML forecast** ("what will I generate tomorrow"): gradient-boosted trees (XGBoost/LightGBM) on engineered features — hour, day-of-year, forecast irradiance, forecast cloud cover, temperature, recent generation lags. Move to a deep/transformer model only if benchmarking shows a real gap.

Model 2's output must **never** be used as the anomaly baseline — that conflation is what causes a forecaster to detect its own error instead of real anomalies. Report a **prediction interval** (quantile regression or calibrated residual-based interval), not a fabricated ±%.

## 4. Anomaly Detection — Deviation Decomposition

```text
Clear-sky expected:        23.2 kWh
Weather-adjusted expected: 19.8 kWh   (clear-sky × weather derate factor)
Actual:                    17.4 kWh

Weather-explained gap:     -3.4 kWh  (23.2 → 19.8)
Unexplained gap:           -2.4 kWh  (19.8 → 17.4)  ← anomaly signal
```

- Weather derate factor comes from cloud cover / GHI observations — never from the ML forecast.
- Only the unexplained residual feeds `anomalies.unexplained_pct` and can trigger a "check your panels" recommendation.
- **Thresholding:** no hardcoded global cutoff. Flag when the residual is a statistical outlier relative to the system's own trailing 30-day unexplained-residual distribution.
- **Cold-start fallback (systems with <30 days of history — every new system, for its first month):** the per-system distribution doesn't exist yet, so falling back silently to "no monitoring" or to an unstated default would quietly undercut the exact fix this mechanism exists for. Instead, use a conservative population-level prior (the unexplained-residual distribution pooled across all systems with enough history, adjusted for system size) until the system accumulates 30 days of its own data, and label any anomaly flagged during this window in the UI as based on a "provisional, population-level threshold" rather than presenting it with the same certainty as the system's own baseline. Switch to the per-system distribution automatically once 30 days accrue, with no user action required.

## 5. "Why Did My Solar Drop?" — Deterministic First, LLM Second

**Arithmetic (every time, no LLM):**
1. Pull the deviation decomposition (Section 4).
2. Rank candidate causes by contribution size: weather-explained gap, flagged panel-inspection findings in the window, data-quality flags, open maintenance events.
3. Produce `{primary_cause, primary_contribution_pct, secondary_causes[], evidence_refs[]}`.

**Language (LLM, narration only):**
4. Pass that structured object to the LLM with instructions to phrase it in plain language, citing only the given `evidence_refs` — never inferring new causes. See `09_Claude_Integration.md` for the exact prompt contract.

## 6. Bill Analyzer

**Scope:** 1–2 utilities/DISCOMs actually testable against. No general-purpose parser across all formats before one format is reliable.

**Pipeline:**
1. Document/vision model extracts: billing period, units consumed, total amount, tariff rate, fixed charges.
2. **Reconciliation check:** `units × tariff_rate + fixed_charges ≈ total_amount` within tolerance. Fails → whole extraction flagged low-confidence.
3. Every field gets `extraction_confidence`. Below threshold → shown editable and unverified, not fact.
4. User corrections stored (`verified_by_user`) for later accuracy measurement.
5. Tariff/net-metering rules are never hardcoded — shown as an assumption in the UI next to any savings figure, user-overridable.

## 7. Vision (Panel + Thermal)

- Reframed as a **corroborating signal**, not a diagnostic.
- Coarse label set only: soiling, visible physical damage, shading, other/unclear. No crack/discoloration classification without a labeled dataset that supports it (lab electroluminescence datasets do not transfer to handheld RGB rooftop photos).
- Report a **model score** ("model score: 0.89"), not "confidence: 89%", unless actually calibrated (e.g., Platt scaling against a held-out set).
- Vision findings **do not trigger standalone alerts**. They surface only alongside an energy-side anomaly, as corroborating evidence.
- Thermal imaging is v3-gated on an actual thermal dataset from real installs.

## 8. RAG Knowledge Base — Narrowed Scope

Scoped to content genuinely specific and otherwise inaccessible to the base model:
- The user's own inverter/panel manual (if uploaded)
- The user's own maintenance history and past inspection findings
- A small curated set of standards/guidelines with clear reuse licensing

General solar trivia is excluded — the base LLM already knows it; retrieval adds no value there.

## 9. Health Score

- **Option A (later):** empirically fit weights against a labeled set of known-issue vs. healthy systems.
- **Option B (v1–v2, default):** show components directly — generation vs. clear-sky, unexplained-anomaly frequency, open inspection findings — without collapsing into one number. Add a composite only once there's enough usage data to weight it defensibly.

## 10. Evaluation Methodology

| Component | Method |
|---|---|
| Forecasting | Chronological split (never random); walk-forward validation (train ≤T, eval T+1..T+k, roll forward); train on **forecast-vintage** weather features, not observed weather; metrics: MAE, RMSE, MAPE (non-zero denominator), prediction-interval coverage |
| Vision | Precision, recall, F1, confusion matrix, per class |
| Anomaly detection | Precision/recall against labeled real incidents, false-positive rate, detection delay |
| Copilot / RAG | Retrieval relevance, groundedness (answer matches retrieved evidence), tool-selection success rate |

## 11. Non-Functional Requirements

- **Latency:** dashboard load and core numbers render without waiting on an LLM call — deterministic pipeline output is computed/cached independently of narration.
- **LLM cost budget:** define $/user/month before building Daily Brief broadly.
- **Graceful degradation:** if the LLM API is unavailable, dashboard still shows numbers and the deterministic decomposition — only narration/Copilot degrade, nothing hard-blocks on an external API call.
- **Model versioning:** every stored prediction/finding records `model_version` so an update doesn't silently make historical records incomparable.

## 12. API Surface (representative, not exhaustive)

```text
POST   /api/v1/solar-systems                     create system (capacity, tilt, azimuth, lat/lon, tz)
POST   /api/v1/solar-systems/{id}/readings        upload CSV of energy readings
GET    /api/v1/solar-systems/{id}/dashboard       generation, expected, decomposition
GET    /api/v1/solar-systems/{id}/forecast        ML forecast + prediction interval
GET    /api/v1/solar-systems/{id}/anomalies       decomposition + status
GET    /api/v1/solar-systems/{id}/why-drop        structured explanation object
POST   /api/v1/bills                              upload bill image/PDF
PATCH  /api/v1/bills/{id}                         user correction of extracted fields
POST   /api/v1/panel-inspections                  upload panel/thermal image
GET    /api/v1/solar-systems/{id}/health           health components
POST   /api/v1/copilot/sessions/{id}/messages     chat turn (tool-calling)
GET    /api/v1/solar-systems/{id}/report          PDF report export
POST   /api/v1/solar-systems/{id}/what-if         simulator input → projected output
```

Every endpoint is scoped by the authenticated `user_id`; row-level isolation is enforced at the query layer, not only in application code.

## 13. Security & Privacy

See `07_Backend_Schema.md §Isolation` and `08_Agent_Architecture.md §Data Quality Agent`. Summary:
- Redact/mask name/address/consumer-number before sending to a third-party LLM for bill parsing, where feasible; document any case where unredacted data must go to a vision API.
- Retention policy defined before storing the first real bill/image; user-facing delete.
- Standard auth; per-user row isolation enforced at the query layer.
- Privacy notice describing exactly what leaves the infrastructure to third-party APIs.

## 14. CI/CD

- GitHub Actions: tests + lint on every PR from day one.
- Chronological-split tests for any ML component (a random-split test passing is not sufficient to merge a forecasting change).
- Deploy: single container initially; document the trigger for splitting services (Section 2).
