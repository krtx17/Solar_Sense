# SolarSense AI — Design System

**Version:** 1.0 · Companion to `05_UI_UX_Flow.md`

---

## 1. Design Principles

1. **Certainty is a design token, not an afterthought.** Every component that renders model output must be able to express its certainty tier (see UI/UX Flow §2) through color, iconography, and label — consistently, everywhere.
2. **Numbers first, prose second.** The deterministic decomposition is always visible even if narration is loading or unavailable.
3. **Quiet by default.** Solar is a low-frequency-check product — most sessions are "confirm everything's fine." Avoid alarm-style visuals (red, exclamation) for anything short of a genuine unexplained-anomaly flag.

## 2. Color Palette

| Token | Hex (example) | Usage |
|---|---|---|
| `--color-bg` | `#0B1220` (dark) / `#F7F9FC` (light) | App background |
| `--color-surface` | `#121B2E` / `#FFFFFF` | Cards |
| `--color-primary` | `#F5A623` (solar amber) | Primary actions, active nav |
| `--color-accent-clearsky` | `#94A3B8` (muted slate, dashed line) | Clear-sky baseline series |
| `--color-accent-weather` | `#38BDF8` (sky blue) | Weather-adjusted expected series |
| `--color-accent-actual` | `#22C55E` | Actual generation series (or amber if system is amber-branded — pick one and keep actual always the "warmest"/most prominent line) |
| `--color-warn-unexplained` | `#F59E0B` | Unexplained-gap segments, anomaly flags |
| `--color-danger` | `#EF4444` | Reserved for genuine failures (upload/data-quality failure), not for anomalies |
| `--color-badge-unverified` | `#FBBF24` bg / dark text | "Unverified" / low-confidence badges |
| `--color-badge-model` | `#A78BFA` bg / dark text | "Model score" / model-generated badges |
| `--color-text-primary` | `#0F172A` / `#F1F5F9` | Primary text |
| `--color-text-muted` | `#64748B` | Secondary text, assumptions, captions |

Dark and light themes both defined; default to system preference. Reserve `--color-danger` strictly for real failure states so it isn't desensitized by overuse on ordinary anomalies.

## 3. Typography

| Role | Font | Weight/Size (base) |
|---|---|---|
| Headings | Inter or system sans | 600–700, 20–28px |
| Body | Inter or system sans | 400–500, 14–16px |
| Numeric/data (kWh, ₹, %) | Tabular-figure variant (e.g., Inter with `font-variant-numeric: tabular-nums`) | 500–600, sized to context |
| Badges/labels | Same family, uppercase, letter-spaced | 500, 11–12px |

Numeric alignment matters here more than most products — kWh/currency columns must use tabular figures so charts and tables of numbers align cleanly.

## 4. Core Components

### 4.1 Certainty Badge
Three variants matching the certainty tiers (UI/UX Flow §2):
- `badge--fact` — no color fill, plain text, no icon.
- `badge--modeled` — outline style, small range icon, text like "forecast · ±2.1 kWh".
- `badge--unverified` — filled `--color-badge-unverified` or `--color-badge-model`, text like "unverified" or "model score 0.81" or "model-generated".

### 4.2 Decomposition Bar
Horizontal stacked bar used everywhere a weather-explained/unexplained split is shown (dashboard, Why-Did-It-Drop, reports). Two segments: `--color-accent-weather` (weather-explained) and `--color-warn-unexplained` (unexplained). Always labeled with both the % and the kWh value, never color alone.

### 4.3 Evidence Chip
Small pill component: icon (📊 data / 📷 photo / 🔧 maintenance) + short label, tappable, opens a detail sheet with the underlying record. Used identically in Why-Did-It-Drop, Daily Brief, and Copilot responses so the pattern is learned once.

### 4.4 Generation Chart
Three-series line/area chart:
- Clear-sky: dashed, `--color-accent-clearsky`
- Weather-adjusted expected: solid thin, `--color-accent-weather`
- Actual: solid bold with shaded confidence band if a forecast, `--color-accent-actual`
Anomaly points marked with a small `--color-warn-unexplained` marker, tappable into Why-Did-It-Drop.

### 4.5 Health Component Card
Three-up (or N-up) card row, each showing one metric + trend, no composite score by default (per TRD §9 Option B). If/when a composite is added later, it renders as an additional card, not a replacement.

### 4.6 Simulation Mode Banner
Persistent, non-dismissible top banner, visually distinct (diagonal-stripe pattern + `--color-badge-model` family), reading "Simulation — not your real system data."

## 5. Voice & Tone

- **Plain language, no inflated certainty:** "This looks like cloud cover" not "We've detected a 94% confidence weather event."
- **Model-generated content is always labeled**, in-line, not buried in a tooltip.
- **Financial language is assumption-explicit:** "Based on a ₹7.20/unit tariff (edit)" not "You saved ₹1,240."
- **No alarm language for ordinary variance:** reserve strong wording ("check your panels") for genuine unexplained-residual outliers, not routine weather-driven dips.

## 6. Iconography & Charts Library

- Icons: a single consistent icon set (e.g., Lucide) — no mixing styles.
- Charts: Recharts (per TRD stack) — configure consistent margins, gridlines, and the color tokens above across all chart instances so the visual language holds across dashboard, reports, and the What-If Simulator.

## 7. Spacing & Layout

- 8px base spacing unit; cards use 16/24px internal padding.
- Dashboard grid: 12-column responsive, charts span 8–12 columns, health cards 4 columns each on desktop, stacked on mobile web.
- Copilot panel: fixed 360–400px side panel on desktop, full-screen sheet on mobile web.
