# Project Readiness Office (PRO)

Government project readiness assessment tool for fund release verification.

## Stack

- React 18 + Vite
- Recharts (radar chart)
- Lucide React (icons)

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Features

- Dashboard with overall score gauge, 9 domain cards (3×3 grid), statistics, and radar chart
- 9 domain assessment tabs with key checks, KPIs, fail signals, and navigation
- Real-time scoring via KPI sliders (weighted average, Go/Conditional/No-Go thresholds)
- Floating PRO Assistant chatbot with context-aware responses
- GCC color scheme: Sky Blue (#87CEEB), Light Green (#90EE90), gradient headers

## Navigation

Tab-based navigation in the sticky header:

- **Dashboard** — overview and domain grid
- **D1–D9** — individual domain assessments
