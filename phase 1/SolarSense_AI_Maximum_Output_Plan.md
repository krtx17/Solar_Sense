# SolarSense AI — Maximum-Output Implementation Plan

> This plan targets the **full original feature set** (all 20 features + agent architecture + engagement layer), not the staged MVP-first sequence in the v2 corrected plan. "Maximum output" here means maximum shipped scope. It does not mean re-introducing the structural flaws that were fixed in v2 — those fixes are treated as non-negotiable foundations, not optional polish, because removing them just makes a bigger version of the original problems. This document reorganizes the full scope into **parallel workstreams** so the most features possible ship in the least time, instead of the strict MVP → v2 → v3 sequence.

---

## 1. What "Maximum Output" Means Here

Two different things can maximize output, and this plan does both:

- **Breadth:** every feature from the original brainstorm gets built, not deferred.
- **Throughput:** features are grouped into tracks that don't block each other, so — whether this is one person or a small team — as much as possible is being built at the same time instead of waiting on a single linear sequence.

What this plan does **not** do: drop the fixes from the corrected plan to save time. A clear-sky baseline, a deterministic decomposition, chronological evaluation, and basic privacy handling are cheap relative to the features they support and expensive to retrofit later. Skipping them doesn't increase real output — it produces more features that don't hold up.

---

## 2. Non-Negotiable Foundations (carried over, not optional)

These come from the corrected plan and stay fixed regardless of how much scope gets added on top:

1. **Clear-sky physical baseline** (via `pvlib`) as the anomaly-detection reference — not the ML forecast comparing itself to its own error.
2. **Deviation decomposition** (weather-explained vs. unexplained) feeding anomalies, the health metrics, and "why did it drop" — all three features share this one computation instead of each inventing its own logic.
3. **Deterministic core pipeline**, LLM used only for narration and the copilot's tool-calling — not an LLM router deciding between agents that have no real branching.
4. **Chronological / walk-forward evaluation**, forecast-vintage-aware training — no random splits on time series.
5. **Data Quality Agent runs first**, before any other feature touches uploaded data.
6. **Multi-tenant data isolation + basic privacy handling** (redaction where feasible, retention policy, per-user query scoping) — built into the schema from day one, not bolted on.
7. **Vision and bill-extraction outputs are labeled with real confidence/model-score language**, never presented as diagnoses or guaranteed facts.

Every track below assumes these seven are already in place or being built in Track E concurrently. No feature in Tracks A–D should ship ahead of the foundation it depends on (the dependency map in Section 4 makes this explicit).

---

## 3. Full Feature Inventory, Grouped by Track

### Track A — Core Data & Forecasting
- Solar Generation Forecasting (Feature 5)
- Energy Anomaly Detection (Feature 7)
- "Why Did My Solar Drop?" (Feature 8) — decomposition + LLM narration
- Explainable AI presentation layer (Feature 16) — the prediction→evidence→confidence→action format, applied consistently across forecast, anomaly, and vision outputs
- Solar Health Score / health components (Feature 6)

### Track B — Document & Vision AI
- AI Electricity Bill Analyzer (Feature 1), scoped to 1–2 utilities first, expanded after
- Solar Potential Estimator (Feature 2)
- Solar Panel Image Analyzer (Feature 3)
- Thermal Image Analyzer (Feature 4)
- Data Quality Agent (Feature 18) — technically cross-cutting, owned here since it gates all uploaded data

### Track C — Agent, Copilot & Knowledge
- Solar Copilot (Feature 9) — tool-calling LLM over Track A/B's computed outputs
- Agent Architecture (Feature 10) — the deterministic pipeline + copilot tool layer, not six independent agents
- RAG Knowledge Base (Feature 11), scoped per the corrected plan (user's own manuals/history, not general solar trivia)
- Human-in-the-Loop review (Feature 17) — technician confirm/reject flow on anomalies and vision findings

### Track D — Product, Engagement & Reporting
- Dashboard & onboarding flow (Sections 4/33/34 of the original doc)
- Personalized Daily Solar Brief (Feature 12)
- Smart Appliance Timing (Feature 13)
- Maintenance Timeline (Feature 14)
- Automated Solar Report / PDF export (Feature 15)
- Simulation Mode / demo system (Feature 19)
- "What If?" Simulator (Feature 20)
- Engagement layer: streaks, goals, carbon impact, achievements (Section 35) — build last within this track; these are the least structurally risky and easiest to cut if time runs short

### Track E — Infrastructure, Evaluation & Trust
- Schema, auth, multi-tenant isolation (Section 4 of corrected plan)
- Privacy handling: redaction, retention policy, data-flow documentation
- Evaluation harness: chronological splits, walk-forward validation, per-component metrics
- Model/version tracking (`model_version` on every prediction/finding table)
- CI (GitHub Actions), basic deploy
- Cost/latency budget tracking for LLM calls (needed before Track D's Daily Brief ships broadly)

---

## 4. Dependency Map

Not everything can run in parallel — this is what actually blocks what:

```text
Track E (schema, auth, privacy)
        │
        ├──► Track A (needs schema + clear-sky baseline capability)
        │        │
        │        ├──► Track D: Health Score, Daily Brief, Report export
        │        └──► Track C: Copilot, "why did it drop" narration
        │
        ├──► Track B (needs schema + Data Quality Agent)
        │        │
        │        ├──► Track D: Solar Potential Estimator, "What If" Simulator
        │        └──► Track C: Human-in-the-loop review (needs vision findings to review)
        │
        └──► Track C: RAG (needs at least one real content source — bills or manuals — to be worth building)
```

**Practical reading:** Track E isn't a phase that finishes before others start — it's a thin slice (schema + auth + Data Quality Agent) that has to exist *first*, after which A, B, and the infra-heavy parts of E continue in parallel. Track D and the engagement layer specifically are the most parallelizable — most of it only needs Track A/B's outputs to exist, not to be perfect.

---

## 5. Parallel Execution Plan

If this is a **team**, the tracks map directly to workstreams — Track A/E to whoever owns data/ML, Track B to whoever owns document/vision AI, Track C to whoever owns the LLM/agent layer, Track D to whoever owns frontend/product.

If this is **one person** (which the original doc's own framing — "resume, GitHub, hackathon" — suggests is likely), true parallelism isn't possible, but the tracks still tell you the right *order* to time-slice through, because it minimizes rework:

1. **Week-class 1:** Track E thin slice (schema, auth, Data Quality Agent skeleton) — everything else depends on this existing, even partially.
2. **Week-class 2–3:** Track A (clear-sky baseline, ML forecast, deviation decomposition). This is the highest-leverage track — it's the input to Track D's health score, Track C's narration, and the flagship "why did it drop" feature.
3. **Week-class 3–4 (can overlap with the tail of A):** Track B's bill analyzer and Solar Potential Estimator — independent of Track A's internals, only needs the schema.
4. **Week-class 4–5:** Track C — Copilot and "why did it drop" narration, now that Track A produces the structured decomposition to narrate. RAG only once there's real content to retrieve.
5. **Week-class 5–6:** Track B's vision analyzer + thermal (higher data-availability risk — start this earlier if you already have image data, later if you don't).
6. **Week-class 6+:** Track D's remaining product layer — daily brief, report export, simulator, engagement features. This is deliberately last: it's the most straightforward to build once A/B/C exist, and the easiest to cut or compress if the schedule slips, without weakening the technical core.

This ordering exists to make sure that if something has to give, it's the demo polish (streaks, achievements, daily brief) — not the parts that make the explainability claim real (clear-sky baseline, decomposition, evaluation methodology).

---

## 6. Definition of Done Per Feature (so breadth doesn't mean sloppy)

A feature counts as "shipped" for this plan only if it meets all four:

1. **Works end to end** on real or realistic data, not just a hardcoded example.
2. **Labeled honestly** — confidence/model-score language for anything probabilistic (Sections 5, 8, 9 of the corrected plan), assumptions shown for anything financial (tariffs, savings).
3. **Doesn't bypass the foundations** — e.g., no feature computes its own ad hoc "expected generation" instead of using Track A's shared baseline; no feature skips the Data Quality Agent on uploaded data.
4. **Isolated per user** — respects the multi-tenant schema from Track E; no feature reads or writes data without a `user_id` scope.

A feature that's fast to build by skipping one of these isn't actually higher output — it's a feature that will need to be rebuilt once it's noticed, which is slower in total.

---

## 7. Milestones (full scope, sequenced without being deferred)

| Milestone | Contains | Proves |
|---|---|---|
| M1 | Track E thin slice + Track A complete | The core explainability claim works on real generation data |
| M2 | + Track B (bills, potential estimator, vision) | Multimodal input works, still honestly scoped |
| M3 | + Track C (copilot, why-it-dropped narration, RAG, human-in-the-loop) | The "agentic" story is real, not just LLM-wrapper theater |
| M4 | + Track D (brief, report, simulator, engagement) | Full original feature list is shipped and demoable end to end |

Each milestone is independently demoable — M1 alone is already a coherent, honest product; each subsequent milestone adds breadth without invalidating what came before.

---

## 8. Where This Plan Trades Off Against the MVP-First Plan

Worth being explicit about the trade being made, since it's the opposite instinct from the corrected plan's own MVP scoping (Section 2 of that document):

- **Higher build risk:** more surface area in flight before anything is battle-tested with real users.
- **Higher chance of partial features:** with everything in progress across tracks, it's easier to end up with several 80%-done features instead of fewer 100%-done ones. The Definition of Done in Section 6 is the guardrail against this — use it as a hard gate, not a guideline.
- **Best fit when:** the goal is a comprehensive portfolio/demo artifact where breadth itself has value (hackathon judging, a full-stack resume project) rather than a product being validated with real users, where the MVP-first plan is still the better choice.

If real users enter the picture at any point, revert to the MVP-first sequencing for whatever they're actually using, and keep the rest of this plan for what's built alongside it.
