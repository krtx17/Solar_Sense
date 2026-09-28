# SolarSense AI — Project Workflow

**Version:** 1.0 · Companion to `01_PRD.md`. Defines build sequencing, dependencies, and process — not feature content (see other docs for that).

---

## 1. What This Plan Optimizes For

Two things can maximize output, and this plan does both:
- **Breadth:** every feature in the PRD's inventory gets built, not silently deferred.
- **Throughput:** features are grouped into tracks that don't block each other, so as much as possible is in flight at once instead of a single linear sequence — whether this is one person or a small team.

**What it does not do:** drop the non-negotiable foundations (PRD §8) to save time. They are cheap relative to the features they support and expensive to retrofit later. Skipping them doesn't increase real output — it produces features that don't hold up (see Definition of Done, PRD §9, used as a hard merge/ship gate, not a guideline).

## 2. Tracks

| Track | Owns | Feature list |
|---|---|---|
| **A** — Core Data & Forecasting | Data/ML | Forecasting, Anomaly Detection, Why-Did-It-Drop, Explainable AI layer, Health Score |
| **B** — Document & Vision AI | Document/Vision | Bill Analyzer, Potential Estimator, Panel Image Analyzer, Thermal Analyzer, Data Quality Agent |
| **C** — Agent, Copilot & Knowledge | LLM/Agent layer | Solar Copilot, Agent Architecture, RAG, Human-in-the-Loop |
| **D** — Product, Engagement & Reporting | Frontend/Product | Dashboard/onboarding, Daily Brief, Appliance Timing, Maintenance Timeline, Report export, Simulation Mode, What-If Simulator, Engagement layer |
| **E** — Infrastructure, Evaluation & Trust | Platform | Schema/auth/isolation, Privacy, Evaluation harness, Model versioning, CI/deploy, LLM cost/latency tracking |

## 3. Dependency Map

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

**Reading it:** Track E is not a phase that finishes before others start — it's a thin slice (schema + auth + Data Quality Agent) that must exist first; after that, A, B, and the remaining infra-heavy parts of E continue in parallel. Track D and the engagement layer are the most parallelizable — most of it only needs A/B's outputs to *exist*, not to be perfect.

## 4. Execution Order

**If this is a team:** tracks map directly to workstreams — A/E to whoever owns data/ML, B to whoever owns document/vision AI, C to whoever owns the LLM/agent layer, D to whoever owns frontend/product. Tracks A, B, and E's infra-heavy parts run concurrently once the Track E thin slice lands.

**If this is one person:** true parallelism isn't possible, but the tracks still dictate the right *order* to time-slice through, minimizing rework:

| Phase | Work | Why this order |
|---|---|---|
| Week-class 1 | Track E thin slice: schema, auth, Data Quality Agent skeleton | Everything else depends on this existing, even partially |
| Week-class 2–3 | Track A: clear-sky baseline, ML forecast, deviation decomposition | Highest-leverage track — feeds Track D's health score, Track C's narration, and the flagship Why-Did-It-Drop feature |
| Week-class 3–4 (overlaps tail of A) | Track B: bill analyzer, Solar Potential Estimator | Independent of Track A's internals, only needs the schema |
| Week-class 4–5 | Track C: Copilot + Why-Did-It-Drop narration, now that Track A produces the structured decomposition to narrate. RAG only once there's real content to retrieve | Narration needs a structured object to narrate; building it earlier means narrating nothing |
| Week-class 5–6 | Track B: vision analyzer + thermal (higher data-availability risk — start earlier if image data already exists, later if not) | Data-availability risk is the limiting factor, not build complexity |
| Week-class 6+ | Track D remainder: daily brief, report export, simulator, engagement features | Most straightforward once A/B/C exist; the easiest to cut or compress if the schedule slips, without weakening the technical core |

**Guiding rule:** if something has to give, it's demo polish (streaks, achievements, daily brief) — never the parts that make the explainability claim real (clear-sky baseline, decomposition, evaluation methodology).

## 5. Milestones

| Milestone | Contains | Proves |
|---|---|---|
| **M1** | Track E thin slice + Track A complete | The core explainability claim works on real generation data |
| **M2** | + Track B (bills, potential estimator, vision) | Multimodal input works, still honestly scoped |
| **M3** | + Track C (copilot, why-it-dropped narration, RAG, human-in-the-loop) | The "agentic" story is real, not LLM-wrapper theater |
| **M4** | + Track D (brief, report, simulator, engagement) | Full feature list shipped and demoable end to end |

Each milestone is independently demoable — M1 alone is a coherent, honest product; each subsequent milestone adds breadth without invalidating what came before.

## 6. Definition of Done (hard gate — see PRD §9 for full text)

A feature merges/ships only if it: (1) works end to end on real/realistic data, (2) is labeled honestly (confidence/model-score language, financial assumptions shown), (3) doesn't bypass the foundations (shared baseline, Data Quality Agent), (4) is isolated per user. A feature that skips one of these to save time isn't higher output — it's a feature that gets rebuilt once noticed, which is slower in total.

## 7. CI/CD Workflow

1. **Every PR:** lint + unit tests via GitHub Actions (set up in the Week-class 1 Track E slice — cheap, do it early, unlike the rest of the infra list below).
2. **ML changes (Track A/B):** a chronological-split evaluation run is required before merge; a random-split test passing is not sufficient (TRD §10, §14).
3. **Schema changes (Track E):** migration + a row-level-isolation check (a test that a second tenant cannot read the new/changed table without its own `user_id`).
4. **LLM-touching changes (Track C):** a test asserting the fallback/degraded-UI path still renders when the LLM call is mocked to fail (Claude Integration §2, §6).
5. **Deploy:** single container initially (TRD §2); split services only when a documented bottleneck appears, not preemptively.

## 8. Trade-Offs of This (Maximum-Output) Sequencing vs. a Strict MVP-First Plan

Worth being explicit about, since it's the opposite instinct from a pure MVP-first sequence:

- **Higher build risk:** more surface area in flight before anything is battle-tested with real users.
- **Higher chance of partial features:** with everything in progress across tracks, it's easier to end up with several 80%-done features instead of fewer 100%-done ones — Section 6's Definition of Done is the guardrail, used as a hard gate.
- **Best fit when:** the goal is a comprehensive portfolio/demo artifact where breadth itself has value (hackathon judging, a full-stack resume project), rather than a product being validated with real users — for the latter, a strict MVP-first plan (build one data path completely, Section 4's Week-class 1–2 scope only, before touching Track B/C/D) is the better choice.
- **If real users enter the picture at any point:** revert to MVP-first sequencing for whatever they're actually using, and keep the rest of this plan for what's built alongside it.

## 9. Document Map

| File | Contents |
|---|---|
| `01_PRD.md` | Product requirements, scope, milestones, Definition of Done |
| `02_TRD.md` | Technical architecture, stack, ML approach, API surface, NFRs |
| `03_User_Flow.md` | End-to-end flows per feature |
| `04_Wireframes.md` | Text-based layouts for key screens |
| `05_UI_UX_Flow.md` | IA, state design, interaction patterns, accessibility |
| `06_Design_System.md` | Colors, typography, components, voice |
| `07_Backend_Schema.md` | Full table definitions, ERD, isolation, retention |
| `08_Agent_Architecture.md` | Deterministic pipeline vs. Copilot boundary, Data Quality Agent, HITL |
| `09_Claude_Integration.md` | Prompt contracts, tool schemas, guardrails, cost budget |
| `10_Workflow.md` | This document — tracks, dependencies, milestones, CI/CD |
