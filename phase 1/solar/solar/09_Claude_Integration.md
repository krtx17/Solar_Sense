# SolarSense AI — Claude / LLM Integration

**Version:** 1.0 · Companion to `08_Agent_Architecture.md`

---

## 1. Where the LLM Is Used (and where it explicitly is not)

| Surface | LLM role | LLM does NOT |
|---|---|---|
| "Why Did It Drop?" narration | Phrase an already-computed structured object in plain language | Decide what caused the drop, infer causes beyond given `evidence_refs` |
| Daily Brief | Narrate yesterday's decomposition + open anomalies/maintenance | Invent numbers, skip the underlying computation |
| Solar Copilot | Tool-calling over the user's own computed data for open-ended Q&A | Query another user's data, write to the database, bypass tool results |
| Bill extraction | Structured extraction of fields from a bill image | Present extraction as fact without `extraction_confidence` + reconciliation check |
| Vision findings | Not LLM-driven — a vision/classification model produces `model_score`; the LLM may later narrate the finding as text, but does not perform the classification | Present a `model_score` as a calibrated probability unless `is_calibrated = true` |
| Report generation | Assembles/narrates already-computed sections | Compute new numbers not already in the structured objects |

**Rule that applies everywhere:** the LLM narrates; it does not decide, compute, or diagnose. If a screen's content changes when the LLM's phrasing changes but the underlying numbers don't, that's correct. If a screen's *conclusion* changes based on LLM phrasing alone, that's a violation of this architecture.

## 2. Model Choice & Fallback

- Default model for narration/Copilot: a fast, cost-efficient Claude model (e.g., Sonnet-class) — narration and tool-calling here are not tasks that need the largest available model, and cost is a tracked budget (Agent Architecture §8).
- No multi-provider abstraction in v1–v3 (explicitly deferred per PRD Non-Goals) — one provider, one integration path, revisit only if a concrete need appears.
- **Fallback behavior is mandatory, not optional:** if the LLM API call fails or times out, the caller returns the structured object with `narration: null` and the UI renders the "explanation temporarily unavailable" state (UI/UX Flow §3) instead of blocking. This must be implemented as a timeout + catch at the API boundary, not assumed to "just work."

## 3. Prompt Contract — "Why Did It Drop?" Narration

**System prompt (fixed, not user-editable):**

```text
You are narrating a pre-computed solar generation analysis. You will be given
a structured JSON object containing the cause ranking and supporting evidence
references. Your job is ONLY to phrase this in clear, plain language for a
non-technical homeowner.

Rules:
- Do not introduce any cause, number, or explanation not present in the input JSON.
- Cite only the evidence_refs provided — do not invent or assume additional evidence.
- If unexplained_pct is small relative to weather_explained_pct, say so plainly
  rather than dramatizing it.
- Use plain language, not technical jargon, unless the user's question used it first.
- Never state a probability or confidence percentage unless the input JSON
  explicitly provides one.
- Keep the response to 2-4 sentences unless asked to elaborate.
```

**User turn (programmatic, not the end user's raw text):**

```json
{
  "primary_cause": "weather",
  "primary_contribution_pct": 59,
  "secondary_causes": [
    {"cause": "soiling", "contribution_pct": 41, "evidence_ref": "panel_inspection:uuid"}
  ],
  "evidence_refs": ["weather_observation:uuid", "panel_inspection:uuid"],
  "clearsky_kwh": 23.2,
  "weather_adjusted_kwh": 19.8,
  "actual_kwh": 17.4
}
```

**Expected output shape:** plain text, 2–4 sentences, referencing only the fields above. The same contract is reused verbatim for the Daily Brief (input = the day's decomposition object) and the Report export (input = one object per section) — one prompt template, multiple call sites, per Agent Architecture §7.

## 4. Solar Copilot — Tool Definitions

Tools are exposed to the model in standard tool-use/function-calling format. Representative schema:

```json
{
  "name": "get_decomposition",
  "description": "Get the deviation decomposition (clear-sky vs weather-adjusted vs actual, weather-explained vs unexplained gap) for the user's solar system on a given date.",
  "input_schema": {
    "type": "object",
    "properties": {
      "system_id": {"type": "string"},
      "date": {"type": "string", "format": "date"}
    },
    "required": ["system_id", "date"]
  }
}
```

```json
{
  "name": "get_forecast",
  "description": "Get the ML generation forecast with prediction interval for a date range.",
  "input_schema": {
    "type": "object",
    "properties": {
      "system_id": {"type": "string"},
      "start_date": {"type": "string", "format": "date"},
      "end_date": {"type": "string", "format": "date"}
    },
    "required": ["system_id", "start_date", "end_date"]
  }
}
```

```json
{
  "name": "search_user_docs",
  "description": "Search only this user's own uploaded manuals and maintenance history (RAG). Does not return general solar knowledge.",
  "input_schema": {
    "type": "object",
    "properties": {
      "system_id": {"type": "string"},
      "query": {"type": "string"}
    },
    "required": ["system_id", "query"]
  }
}
```

Additional tools (`get_health_components`, `get_bill_summary`, `get_appliance_timing`) follow the same shape — see `08_Agent_Architecture.md §5` for the full list and data sources.

**Copilot system prompt (key rules):**

```text
You are the SolarSense Copilot. Answer only using data returned by your tools —
never state a number you did not retrieve via a tool call in this turn.
Every tool call is automatically scoped to the authenticated user's own
system(s); you cannot and must not attempt to query another user's data.
If a question requires data you don't have a tool for, say so plainly instead
of guessing. When your answer relies on a specific tool result, name the
source briefly (e.g., "based on tomorrow's forecast").
```

**Enforcement note:** tool-level authorization (the `system_id` scoping to `user_id`) is enforced server-side at the tool-execution layer, not by trusting the prompt — the prompt instruction above is a behavioral guide for the model, not the security boundary. The security boundary is the same row-level isolation described in `07_Backend_Schema.md §4`.

## 5. Bill Extraction Prompt Contract

- Input: bill image (base64) + a fixed extraction schema (billing period, units, total amount, tariff rate, fixed charges).
- Output: structured JSON with a per-field `confidence` alongside each value.
- Downstream (deterministic, not LLM): the reconciliation check (`units × tariff + fixed ≈ total`) is computed in application code, not asked of the model — arithmetic verification belongs in deterministic code, not in the LLM's output.
- If `extraction_confidence` (or the reconciliation check) fails threshold, the UI renders the field as editable/unverified regardless of what the model claims about its own certainty.

## 6. Guardrails Summary

1. **Grounding:** every narration call receives only the specific structured object it's meant to phrase — never open-ended access to the full database.
2. **Citation discipline:** narration prompts explicitly forbid introducing causes/evidence not present in the input.
3. **No silent numeric authority:** the LLM is never the source of a number shown as fact; numbers come from the deterministic pipeline or reconciliation checks.
4. **Scoped tools:** Copilot tools are per-user by construction (server-enforced), and RAG search is restricted to the user's own documents (TRD §8).
5. **Graceful degradation:** every LLM call site has a defined fallback UI state (§2) — no code path assumes the LLM call always succeeds.
6. **Cost/latency logging:** every call recorded to `agent_runs` for the budget tracking required before Daily Brief/Copilot ship broadly. `agent_runs.surface` (`'why_drop_narration'|'daily_brief'|'copilot'|'bill_extraction'|'report_export'`) tags which feature drove the spend, so the cost ceiling in §7 can be checked per surface, not just per user in aggregate.

## 7. Cost & Latency Budget (fill in before broad rollout)

| Item | Budget |
|---|---|
| Per-user monthly LLM cost ceiling | *(Open Decision — PRD §10, item 4)* |
| Narration call latency target | Non-blocking; structured data renders immediately, narration fills in async |
| Copilot turn latency target | Define based on chosen model's typical tool-calling round-trip; surfaced with a loading state, never a silent hang |
| Daily Brief send cadence | Once/day/user, scheduled off-peak; skipped (not retried indefinitely) if the LLM API is down that day, with numbers-only fallback delivered instead |
