# CodeBurn Dashboard — Design Spec

**Date:** 2026-06-13  
**Status:** Approved  
**Stack:** React + Vite + TypeScript + TailwindCSS

---

## Overview

A single-page, client-side dashboard that visualizes AI usage analytics from a CodeBurn CSV export. Personal use only. Built as a PoC — prioritize simplicity over extensibility.

---

## Constraints

- No custom Vite plugins
- No Express or any backend server
- CSV files served statically from `public/data/` and fetched at runtime with `fetch()`
- CSV parsing via [Papa Parse](https://www.papaparse.com/)
- Charts via [Recharts](https://recharts.org/)

---

## Data Sources

All 8 CSV files are copied into `public/data/` verbatim from the CodeBurn export.

| File | Periods available | Key columns |
|---|---|---|
| `summary.csv` | Today, 7 Days, 30 Days | Period, Cost, Saved, API Calls, Sessions, Projects |
| `daily.csv` | Today, 7 Days, 30 Days | Period, Date, Cost, Input/Output/Cache tokens |
| `activity.csv` | Today, 7 Days, 30 Days | Period, Activity, Cost, Share%, Turns |
| `models.csv` | Today, 7 Days, 30 Days | Period, Model, Cost, Share%, API Calls, tokens |
| `projects.csv` | 30 Days only | Project, Cost, Avg/Session, Share%, Sessions |
| `sessions.csv` | 30 Days only | Project, Session ID, Started At, Cost, API Calls, Turns |
| `tools.csv` | 30 Days only | Tool, Calls, Share% |
| `shell-commands.csv` | 30 Days only | Command, Calls, Share% |

---

## Architecture

### Project layout

The React app is scaffolded **inside** the existing export folder (making it the project root). CSVs are copied to `public/data/`.

```
codeburn-2026-06-13/
├── public/
│   └── data/
│       ├── summary.csv
│       ├── daily.csv
│       ├── activity.csv
│       ├── models.csv
│       ├── projects.csv
│       ├── sessions.csv
│       ├── tools.csv
│       └── shell-commands.csv
├── src/
│   ├── types.ts              # TypeScript interfaces for each CSV row type
│   ├── hooks/
│   │   └── useCSVData.ts     # Fetches + parses all 8 CSVs, returns typed data
│   ├── components/
│   │   ├── PeriodToggle.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── DailyChart.tsx
│   │   ├── ActivityChart.tsx
│   │   ├── ModelsChart.tsx
│   │   ├── ProjectsChart.tsx
│   │   ├── SessionsTable.tsx
│   │   ├── ToolsChart.tsx
│   │   └── ShellCommandsChart.tsx
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── ...
```

### Data loading

`useCSVData` fetches all 8 files in parallel on mount using `Promise.all`. Returns `{ data, loading, error }`. Each CSV is parsed with Papa Parse (`header: true`, `dynamicTyping: true`, `skipEmptyLines: true`).

### Period filtering

`App.tsx` holds a `selectedPeriod` state (`'Today' | '7 Days' | '30 Days'`, default `'30 Days'`). It is passed down to components that support multi-period data (`SummaryCards`, `DailyChart`, `ActivityChart`, `ModelsChart`). Components for single-period data (`ProjectsChart`, `SessionsTable`, `ToolsChart`, `ShellCommandsChart`) ignore the period prop — they always show 30-Day data.

---

## Visual Design

- **Theme:** Dark slate — `bg-slate-950` page, `bg-slate-900` cards, `border-slate-800` borders
- **Accent:** Blue-500 for primary charts, violet-400 for secondary, green-500 for shell commands
- **Typography:** System font stack, `text-slate-400` labels, `text-white` values

---

## Page Sections (top to bottom)

### 1. Header
- Title: "AI Usage Dashboard"
- Subtitle: export date from filename
- Period toggle: segmented control — Today / 7 Days / 30 Days

### 2. Summary Cards
4 stat cards in a row: **Total Cost**, **API Calls**, **Sessions**, **Projects**  
Values filtered by `selectedPeriod` from `summary.csv`.

### 3. Daily Spend (bar chart)
`Recharts` `BarChart` — X axis: date, Y axis: cost in USD.  
Data filtered to rows matching `selectedPeriod` from `daily.csv`.

### 4. Activity + Models (side by side)
Two `Recharts` `BarChart` components with horizontal layout (`layout="vertical"`):
- **Activity Breakdown** — cost per activity type, filtered by period
- **Models** — cost per model, top 8, filtered by period

### 5. Projects (horizontal bar chart)
`Recharts` horizontal `BarChart` — cost per project, top 10, truncated project path labels.  
Source: `projects.csv` (30-Day data, no period filter).

### 6. Top Sessions (table)
Plain HTML table — columns: Project (truncated), Started, Cost, API Calls, Turns.  
Sorted by Cost descending. Show top 20 rows.  
Source: `sessions.csv`.

### 7. Tools + Shell Commands (side by side)
Two `Recharts` horizontal `BarChart` components — top 10 each by call count.  
Sources: `tools.csv`, `shell-commands.csv`.

---

## Loading & Error States

- While `loading`: show a centered spinner / "Loading data…" message
- On `error`: show an error message with the fetch error detail

---

## Out of scope (PoC)

- No routing
- No persistent state (period resets on refresh)
- No cache invalidation / refresh button
- No token breakdown charts (cache read/write tokens not visualized)
- No mobile responsiveness optimization
