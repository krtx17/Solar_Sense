# SolarSense AI — UI/UX Flow

**Version:** 1.0 · Companion to `03_User_Flow.md`, `04_Wireframes.md`, `06_Design_System.md`

---

## 1. Information Architecture

```text
Home (Dashboard)
├── System switcher (multi-system users)
├── Why Did It Drop (drill-in from any anomaly)
├── Bills
│   └── Bill detail / correction
├── Photos
│   └── Panel / thermal upload & findings
├── Copilot (persistent side panel, available from any screen)
├── Reports
│   └── Export / history
├── Maintenance timeline
├── What If Simulator
├── Review Queue (technician role only)
└── Settings
    ├── System details
    ├── Privacy & data (retention, delete, export)
    └── Notification preferences (Daily Brief on/off)
```

**Navigation principle:** the dashboard is the hub. Every feature is at most two taps from it. Copilot is globally accessible (persistent affordance) since it's meant to answer "explain this" from wherever the user is confused.

## 2. Core UX Principle: Certainty Must Be Visible, Not Implied

Every piece of output in the product falls into one of three certainty tiers, and the UI must visually distinguish them — this is the product's core trust mechanism, not a styling detail:

| Tier | Examples | Visual treatment |
|---|---|---|
| **Computed fact** | Clear-sky expected kWh, actual kWh, bill total (reconciled) | Solid text, no badge |
| **Model output with uncertainty** | ML forecast, prediction interval, health components | Range shown, not point value; "forecast" label persists |
| **Model score / unverified** | Vision findings, low-confidence bill fields, LLM narration | Explicit badge ("model score 0.81", "unverified — please check", "model-generated") |

No screen may present a Tier 2 or Tier 3 item with Tier 1's visual weight. This directly implements the "labeled honestly" requirement from the PRD's Definition of Done.

## 3. State Design

Every data-bearing screen must define these states explicitly (not just the happy path):

| State | Behavior |
|---|---|
| **Loading (deterministic data)** | Skeleton loaders on charts/numbers; these come from cache/DB, not an LLM, so loading should be brief. |
| **Loading (LLM narration)** | Structured data (numbers, decomposition, evidence chips) renders immediately; a separate, smaller loading indicator covers only the narration text block. Never block the whole screen on the LLM call. |
| **LLM unavailable** | Narration block replaced with: "Explanation is temporarily unavailable — the numbers above are unaffected." Copilot panel shows a similar inline notice. Dashboard, decomposition, and charts remain fully functional. |
| **Data Quality Agent failed/partial** | Upload flow halts before any downstream computation; user sees exactly which rows/fields failed and why, with an option to proceed with flagged gaps clearly marked in every chart that uses that range. |
| **Empty state (no data yet)** | Dashboard shows a clear CTA path (upload CSV / upload bill / try Simulation Mode) instead of empty charts. |
| **Low-confidence extraction** | Bill/vision fields render as editable inputs with a visible "unverified" badge, not as static text. |
| **Error (network/API)** | Non-blocking toast + retry affordance; never a blank screen (this was an explicit anti-goal from the v1 review). |

## 4. Interaction Patterns

- **Evidence chips:** any narrated explanation (Why-Did-It-Drop, Daily Brief, Copilot) shows tappable chips linking to the underlying `evidence_refs` (weather data, a specific photo, a maintenance record). The user should always be able to trace language back to data.
- **Confirm/Reject on findings:** vision and anomaly findings awaiting review show inline Confirm/Reject controls for reviewer roles; regular users see a lighter-weight "Was this helpful?" thumbs control that feeds the same review signal without technician-level framing.
- **Simulation Mode boundary:** any screen operating on simulated/demo data carries a persistent, non-dismissible visual marker (badge in the header) so it's never confused with the user's real system.
- **Assumption editing:** wherever a financial number depends on an assumption (tariff rate, net-metering rate), that assumption is shown inline, not hidden in settings, and is directly editable next to the number it affects.

## 5. Accessibility

- Charts carry a text-equivalent summary (e.g., "Generation was 25% below weather-adjusted expectation") for screen readers, not just visual bands.
- Confidence/model-score badges use both color and text label — never color alone.
- All interactive elements (chips, Confirm/Reject, toggles) meet standard touch-target sizing and keyboard navigability.

## 6. Copilot UX Contract

- Persistent but dismissible side panel, not a modal that blocks the underlying dashboard.
- Every Copilot answer that draws on computed data shows a source reference (which tool/data it pulled), mirroring the evidence-chip pattern used elsewhere.
- Degrades to a clear unavailable-state message rather than a spinner that never resolves.

## 7. Progressive Disclosure by Milestone

The UI should not expose features ahead of the milestone that makes them meaningful (per `10_Workflow.md`):
- M1: Dashboard, Why-Did-It-Drop (numbers only if narration isn't built yet), basic report.
- M2: Bill upload/correction, Potential Estimator, panel photo upload.
- M3: Copilot panel, narrated Why-Did-It-Drop, Review Queue (role-gated).
- M4: Daily Brief settings, full report, What-If Simulator, engagement elements (streaks/achievements — smallest visual footprint, easiest to hide behind a flag).
