# SolarSense AI — Wireframes (Text-Based)

**Version:** 1.0 · Low-fidelity structural layouts for key screens. Pair with `06_Design_System.md` for visual treatment.

---

## 1. Onboarding — System Setup

```text
┌──────────────────────────────────────────────────────┐
│  SolarSense                                    [Skip] │
│                                                        │
│   Step 2 of 3 — Tell us about your system             │
│                                                        │
│   Capacity (kW)      [______]                         │
│   Tilt (°)           [______]                         │
│   Azimuth (°)        [______]                         │
│   Location            [ address autocomplete_______ ] │
│   Timezone            Auto-detected: IST  [change]    │
│                                                        │
│   ┌────────────────────────────────────────────────┐ │
│   │ We'll compute a clear-sky physical baseline for │ │
│   │ this exact system. This is geometry, not a      │ │
│   │ weather guess.                                  │ │
│   └────────────────────────────────────────────────┘ │
│                                                        │
│                              [Back]     [Continue →]  │
└──────────────────────────────────────────────────────┘
```

## 2. Dashboard (core screen)

```text
┌──────────────────────────────────────────────────────┐
│ ☰  SolarSense        Home 12kW System ▾     [Copilot]│
├──────────────────────────────────────────────────────┤
│  Today                                                │
│  ┌────────────────────────────────────────────────┐  │
│  │  Generation vs. Expected           [7d 30d 1y]  │  │
│  │   kWh                                            │  │
│  │   25 ┤        clear-sky (dashed)                │  │
│  │   20 ┤   ╭──╮      weather-adj (line)            │  │
│  │   15 ┤  ╱    ╲___  actual (bold, shaded band)    │  │
│  │   10 ┤ ╱          ╲___                           │  │
│  │      └──────────────────────────────  days →     │  │
│  │  ⚠ Anomaly flagged Tue: -2.4 kWh unexplained     │  │
│  │     [Why did this happen? →]                     │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  System Health (components, not one score)            │
│  ┌───────────────┬───────────────┬──────────────────┐ │
│  │ Generation vs  │ Anomaly       │ Open findings    │ │
│  │ clear-sky      │ frequency     │                  │ │
│  │  92%           │ 1 in 30 days  │ 1 unreviewed     │ │
│  └───────────────┴───────────────┴──────────────────┘ │
│                                                        │
│  Quick actions:                                        │
│  [Upload bill]  [Upload panel photo]  [Export report] │
└──────────────────────────────────────────────────────┘
```

## 3. "Why Did My Solar Drop?" Detail

```text
┌──────────────────────────────────────────────────────┐
│ ← Back        Why did my solar drop — Tue, Sep 16     │
├──────────────────────────────────────────────────────┤
│  Clear-sky expected        23.2 kWh                    │
│  Weather-adjusted expected 19.8 kWh   (cloud cover ↑)  │
│  Actual                    17.4 kWh                    │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ Weather-explained:  -3.4 kWh  ███████░░░░░░      │  │
│  │ Unexplained:        -2.4 kWh  ████░░░░░░░░░      │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  Plain-language explanation (LLM-narrated):            │
│  "Most of Tuesday's shortfall was cloud cover. A       │
│  smaller, unexplained gap remains — this lines up      │
│  with a soiling finding from your Sep 12 panel photo   │
│  (model score 0.81)."                                  │
│                                    [model-generated]    │
│                                                        │
│  Evidence:                                             │
│  [📊 Weather data]  [📷 Sep 12 panel photo]  [🔧 —]    │
│                                                        │
│  Was this helpful?   [👍]  [👎]                        │
└──────────────────────────────────────────────────────┘
```

## 4. Bill Analyzer — Extraction & Correction

```text
┌──────────────────────────────────────────────────────┐
│ ← Back              Electricity Bill — Aug 2026        │
├──────────────────────────────────────────────────────┤
│  [Bill image thumbnail]     Extracted fields:          │
│                              Billing period  ✓ high conf│
│                              Aug 1 – Aug 31  [edit]     │
│                                                        │
│                              Units consumed  ⚠ unverified│
│                              [412___] kWh    [edit]     │
│                                                        │
│                              Total amount    ✓ high conf│
│                              ₹3,240          [edit]     │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ Reconciliation check: units × tariff + fixed     │  │
│  │ ≈ ₹3,190 vs stated ₹3,240 — within tolerance ✓   │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  Tariff assumption used: ₹7.20/unit slab (editable)    │
│  Net-metering rate: ₹3.50/unit (editable)              │
│                                                        │
│                              [Save & verify fields →]  │
└──────────────────────────────────────────────────────┘
```

## 5. Solar Copilot Panel

```text
┌──────────────────────────────────────────────────────┐
│  Copilot                                        [✕]   │
├──────────────────────────────────────────────────────┤
│  You: when should I run my washing machine tomorrow?   │
│                                                        │
│  Copilot: Based on tomorrow's forecast (18.9–23.4 kWh, │
│  peak 11am–2pm), running it between 11:30am and 1pm    │
│  uses the most self-generated power.                   │
│  [source: tomorrow's forecast]                          │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ Type a message...                        [Send] │  │
│  └────────────────────────────────────────────────┘  │
│  If the model is unavailable: "Copilot is temporarily  │
│  unavailable — your dashboard numbers are unaffected." │
└──────────────────────────────────────────────────────┘
```

## 6. Human-in-the-Loop Review Queue

```text
┌──────────────────────────────────────────────────────┐
│  Review Queue                         3 pending        │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │
│  │ System: Home 12kW   Sep 16, unexplained -2.4kWh  │  │
│  │ Vision finding: soiling, model score 0.81         │  │
│  │ [📷 view photo]                                    │  │
│  │                        [Confirm]     [Reject]      │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ System: Office 8kW   Sep 14, unexplained -5.1kWh  │  │
│  │ No vision finding — flagged on energy signal only │  │
│  │                        [Confirm]     [Reject]      │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## 7. "What If?" Simulator

```text
┌──────────────────────────────────────────────────────┐
│  What If?                          [Simulation mode]   │
├──────────────────────────────────────────────────────┤
│  Adjust:                                                │
│  Add panels        [+2]                                 │
│  Change tilt        [___°]                              │
│  Clean panels now    [toggle]                            │
│                                                        │
│  Projected annual output:  vs current                  │
│   28,400 kWh  (+3,100 kWh / +12%)                       │
│                                                        │
│  ⚠ Simulated projection — not written to your real      │
│  system data.                                           │
└──────────────────────────────────────────────────────┘
```

## 8. Report Export (M4 full version)

```text
┌──────────────────────────────────────────────────────┐
│  Solar Report — Home 12kW System — Sep 2026             │
├──────────────────────────────────────────────────────┤
│  1. Generation summary (numbers, chart)                │
│  2. Deviation decomposition + explanation                │
│  3. Health components                                    │
│  4. Bill summary (with tariff assumptions noted)          │
│  5. Vision findings (labeled: corroborating, not          │
│     diagnostic; model scores shown, not probabilities)    │
│  6. Maintenance timeline                                  │
│  7. Forecast (next 7 days, with prediction interval)       │
│                              [Download PDF]  [Email]      │
└──────────────────────────────────────────────────────┘
```
