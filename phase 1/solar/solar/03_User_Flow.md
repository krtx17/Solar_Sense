# SolarSense AI — User Flow

**Version:** 1.0 · Companion to `01_PRD.md`, `05_UI_UX_Flow.md`

---

## 1. Flow Index

| # | Flow | Milestone |
|---|---|---|
| 1 | Onboarding & first system setup | M1 |
| 2 | CSV upload → dashboard | M1 |
| 3 | "Why did my solar drop?" | M1 → M3 (narration) |
| 4 | Electricity bill upload & correction | M2 |
| 5 | Solar Potential Estimator | M2 |
| 6 | Panel / thermal image upload | M2 |
| 7 | Solar Copilot chat | M3 |
| 8 | Human-in-the-loop review (technician) | M3 |
| 9 | Daily Brief | M4 |
| 10 | "What If?" Simulator | M4 |
| 11 | Report export | M1 (basic) → M4 (full) |

---

## 2. Flow 1 — Onboarding & First System Setup

```text
Sign up (email/OAuth via standard auth)
   │
   ▼
Create solar_system record
   ├─ capacity_kw, tilt_deg, azimuth_deg
   ├─ location (lat/lon — address autocomplete, resolved to coordinates)
   └─ timezone (auto-detected from location, user-confirmable)
   │
   ▼
Choose data source
   ├─ "I have a generation CSV" ─────────► Flow 2
   ├─ "I have electricity bills only" ───► Flow 4
   └─ "I just want to explore" ──────────► Simulation Mode (Track D, demo data)
   │
   ▼
Privacy notice shown (what data goes to third-party LLM/vision APIs) — explicit acknowledgment required before any upload
```

## 3. Flow 2 — CSV Upload → Dashboard

```text
Upload generation CSV (timestamp, kWh)
   │
   ▼
Data Quality Agent runs FIRST
   ├─ missing values, duplicate rows, sensor spikes, timestamp gaps/impossible values
   ├─ PASS ──────────────────────────────► continue
   └─ FAIL/partial ──► show data-quality report, let user decide: fix & re-upload, or proceed with flagged gaps clearly marked downstream
   │
   ▼
Clear-sky baseline computed (pvlib) for this system's geometry
   │
   ▼
ML forecast computed (if enough history) — prediction interval, not point estimate
   │
   ▼
Deviation decomposition computed (weather-explained vs unexplained)
   │
   ▼
Dashboard renders:
   ├─ Generation vs. clear-sky vs. weather-adjusted expected (chart)
   ├─ Health components (not composite score) — see Design System
   ├─ Any anomaly flags (unexplained residual outliers)
   └─ Entry point: "Why did this happen?" → Flow 3
```

## 4. Flow 3 — "Why Did My Solar Drop?"

```text
User taps an anomaly / dip in the chart, or asks Copilot "why did my solar drop"
   │
   ▼
Deterministic ranking (no LLM): weather-explained gap, panel-inspection findings in window,
data-quality flags, open maintenance events → ranked by contribution
   │
   ▼
Structured object: {primary_cause, primary_contribution_pct, secondary_causes[], evidence_refs[]}
   │
   ├─► Render structured object directly (numbers/evidence chips) — works even if LLM is down
   │
   ▼
LLM narrates the structured object in plain language, citing only evidence_refs given
   │
   ▼
User sees: plain-language explanation + evidence chips (tap to see underlying data) + confidence language
   │
   ▼
Optional: "Was this helpful?" → feeds Human-in-the-Loop review queue if a vision/anomaly finding was involved
```

## 5. Flow 4 — Electricity Bill Upload & Correction

```text
Upload bill image/PDF
   │
   ▼
Vision/document extraction: billing period, units, amount, tariff rate, fixed charges
   │
   ▼
Reconciliation check (units × tariff + fixed ≈ total)
   ├─ PASS → fields shown, high-confidence fields read-only-by-default
   └─ FAIL / low extraction_confidence → fields shown editable, clearly marked "unverified — please check"
   │
   ▼
User reviews/corrects fields → saved with verified_by_user = true
   │
   ▼
Tariff/net-metering assumptions shown explicitly next to any savings estimate, user can override
   │
   ▼
Bill data feeds: Dashboard cost view, Daily Brief, "Why did it drop" evidence (if a billing anomaly correlates)
```

## 6. Flow 5 — Solar Potential Estimator

```text
User enters address (prospective buyer, no system yet) or selects existing system
   │
   ▼
System estimates roof/location solar potential (clear-sky model + typical system sizing assumptions)
   │
   ▼
Result: estimated annual generation range + assumptions shown (panel count, tilt/azimuth assumed vs. actual)
   │
   ▼
CTA: "Set up your real system" → Flow 1, or "See what-if scenarios" → Flow 10
```

## 7. Flow 6 — Panel / Thermal Image Upload

```text
Upload panel photo (user tags location, e.g. "east corner", optional)
   │
   ▼
Data Quality Agent (image-appropriate checks: resolution, blur, panel visibility)
   │
   ▼
Vision model scores against coarse label set: soiling / damage / shading / other-unclear
   │
   ▼
Finding stored with model_score + model_version, NOT surfaced as a standalone alert
   │
   ▼
If an energy-side anomaly exists in the same window → finding surfaces as corroborating evidence in Flow 3
If no anomaly exists → finding stored, visible in system history, not pushed as a notification
   │
   ▼
(v3) Thermal image follows the same path, gated on thermal dataset availability
```

## 8. Flow 7 — Solar Copilot Chat

```text
User opens Copilot, asks free-form question
   ("when should I run my washing machine", "explain this like I'm a beginner", "what's my ROI so far")
   │
   ▼
LLM (tool-calling) selects from a fixed tool set over the user's own computed data
   (get_forecast, get_decomposition, get_health_components, get_bill_summary, search_user_docs [RAG], get_appliance_timing)
   │
   ▼
Tool results returned → LLM composes an answer grounded only in returned data
   │
   ▼
Response shown with evidence chips where applicable; agent_run logged (tool_calls_json, latency_ms, cost_usd)
```

## 9. Flow 8 — Human-in-the-Loop Review

```text
Technician/reviewer opens review queue
   │
   ▼
Queue shows: pending anomalies + associated vision findings, ranked by unexplained_pct
   │
   ▼
Reviewer confirms or rejects each finding
   │
   ▼
reviewed_by_user = true stored; rejected findings excluded from future "why did it drop" evidence_refs
   │
   ▼
Aggregate review outcomes feed the evaluation harness (precision/recall against real incidents)
```

## 10. Flow 9 — Daily Brief

```text
Scheduled job (respecting per-user LLM cost budget) pulls yesterday's decomposition + any open anomalies/maintenance
   │
   ▼
LLM narrates a short brief (grounded in structured data, same evidence_refs contract as Flow 3)
   │
   ▼
Delivered in-app (and optionally email) — degrades gracefully to a numbers-only summary if LLM unavailable
```

## 11. Flow 10 — "What If?" Simulator

```text
User adjusts hypothetical inputs (add panels, change tilt, clean panels, relocate)
   │
   ▼
Simulator re-runs the clear-sky baseline + forecast model under the hypothetical inputs
(isolated from real training/eval data — clearly labeled "Simulation")
   │
   ▼
Projected output shown side-by-side with actual — never written back into real system tables
```

## 12. Flow 11 — Report Export

```text
M1: PDF export = numbers + decomposition explanation (not a full multi-section document)
   │
   ▼
M4: Full Automated Solar Report — adds bill summary, health components, maintenance timeline,
     vision findings (labeled as corroborating), forecast, all with the same confidence language
     used on-screen (no upgrade in certainty just because it's a PDF)
```
