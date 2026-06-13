# CodeBurn Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page React dashboard that fetches and visualizes 8 CodeBurn CSV analytics files with a period toggle and dark slate theme.

**Architecture:** Vite + React + TypeScript scaffolded in a `dashboard/` subdirectory inside the export folder. All 8 CSV files copied to `public/data/` and fetched at runtime via Papa Parse. Recharts renders all charts. `App.tsx` owns period state and passes it to multi-period components; single-period components (projects, sessions, tools, shell-commands) always show 30-Day data.

**Tech Stack:** React 19, Vite 6, TypeScript, TailwindCSS v4 (`@tailwindcss/vite`), Recharts, Papa Parse

---

### Task 1: Project scaffold

**Goal:** Create the Vite project in `dashboard/`, install all dependencies, configure Tailwind v4, and copy CSVs to `public/data/`.

**Files:**
- Create: `dashboard/` (project root)
- Create: `dashboard/vite.config.ts`
- Create: `dashboard/src/index.css`
- Create: `dashboard/src/main.tsx`
- Create: `dashboard/src/App.tsx` (placeholder)
- Create: `dashboard/public/data/*.csv` (8 copies)

**Acceptance Criteria:**
- [ ] `npm run dev` starts without errors
- [ ] `http://localhost:5173` shows a dark page
- [ ] `http://localhost:5173/data/summary.csv` returns raw CSV text

**Verify:** `npm run dev` → browser shows dark page → `curl http://localhost:5173/data/summary.csv | head -2` prints CSV header + first row

**Steps:**

- [ ] **Step 1: Scaffold Vite project**

Run from `/Users/tungpt/Development/thanhtunguet/codeburn-2026-06-13`:

```bash
npm create vite@latest dashboard -- --template react-ts
cd dashboard
npm install
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install recharts papaparse
npm install -D @types/papaparse
```

- [ ] **Step 3: Install Tailwind v4**

```bash
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 4: Configure Vite with Tailwind plugin**

Replace `dashboard/vite.config.ts` with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

- [ ] **Step 5: Set up Tailwind CSS**

Replace `dashboard/src/index.css` with:

```css
@import "tailwindcss";
```

- [ ] **Step 6: Update main.tsx**

Replace `dashboard/src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: Copy CSVs to public/data/**

```bash
mkdir -p public/data
cp ../*.csv public/data/
```

Verify all 8 files are present:

```bash
ls public/data/
```

Expected output includes: `activity.csv  daily.csv  models.csv  projects.csv  sessions.csv  shell-commands.csv  summary.csv  tools.csv`

- [ ] **Step 8: Clean up boilerplate and add placeholder App**

```bash
rm -f src/App.css
rm -rf src/assets
```

Replace `dashboard/src/App.tsx` with:

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <p className="p-8 text-slate-400">Dashboard loading...</p>
    </div>
  )
}
```

- [ ] **Step 9: Verify**

```bash
npm run dev
```

Open `http://localhost:5173` — dark background, "Dashboard loading..." text.
Open `http://localhost:5173/data/summary.csv` — raw CSV text visible.

- [ ] **Step 10: Init git and commit**

```bash
git init
git add -A
git commit -m "feat: scaffold CodeBurn dashboard with Vite + React + Tailwind v4"
```

---

### Task 2: TypeScript types + CSV data hook

**Goal:** Define typed interfaces for all 8 CSV schemas and implement `useCSVData` that fetches all files in parallel with Papa Parse.

**Files:**
- Create: `src/types.ts`
- Create: `src/hooks/useCSVData.ts`

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] `useCSVData` returns `{ data, loading, error }` with `data` typed as `CSVData`
- [ ] Wiring into App (temporary console.log) shows all 8 arrays populated

**Verify:** `npx tsc --noEmit` → no output, exit code 0

**Steps:**

- [ ] **Step 1: Create src/types.ts**

```ts
export type Period = 'Today' | '7 Days' | '30 Days';

export interface SummaryRow {
  Period: string;
  'Cost (USD)': number;
  'Saved (USD)': number;
  'API Calls': number;
  Sessions: number;
  Projects: number;
}

export interface DailyRow {
  Period: string;
  Date: string;
  'Cost (USD)': number;
  'Saved (USD)': number;
  'API Calls': number;
  Sessions: number;
  'Input Tokens': number;
  'Output Tokens': number;
  'Cache Read Tokens': number;
  'Cache Write Tokens': number;
}

export interface ActivityRow {
  Period: string;
  Activity: string;
  'Cost (USD)': number;
  'Share (%)': number;
  Turns: number;
}

export interface ModelRow {
  Period: string;
  Model: string;
  'Cost (USD)': number;
  'Saved (USD)': number;
  'Share (%)': number;
  'API Calls': number;
  'Edit Turns': number;
  'One-shot Rate (%)': number;
  'Retries/Edit': number;
  'Cost/Edit (USD)': number;
  'Input Tokens': number;
  'Output Tokens': number;
  'Cache Read Tokens': number;
  'Cache Write Tokens': number;
}

export interface ProjectRow {
  Project: string;
  'Cost (USD)': number;
  'Saved (USD)': number;
  'Avg/Session (USD)': number;
  'Share (%)': number;
  'API Calls': number;
  Sessions: number;
}

export interface SessionRow {
  Project: string;
  'Session ID': string;
  'Started At': string;
  'Cost (USD)': number;
  'Saved (USD)': number;
  'API Calls': number;
  Turns: number;
}

export interface ToolRow {
  Tool: string;
  Calls: number;
  'Share (%)': number;
}

export interface ShellCommandRow {
  Command: string;
  Calls: number;
  'Share (%)': number;
}

export interface CSVData {
  summary: SummaryRow[];
  daily: DailyRow[];
  activity: ActivityRow[];
  models: ModelRow[];
  projects: ProjectRow[];
  sessions: SessionRow[];
  tools: ToolRow[];
  shellCommands: ShellCommandRow[];
}
```

- [ ] **Step 2: Create src/hooks/useCSVData.ts**

```ts
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import type {
  CSVData, SummaryRow, DailyRow, ActivityRow, ModelRow,
  ProjectRow, SessionRow, ToolRow, ShellCommandRow,
} from '../types';

async function fetchCSV<T>(path: string): Promise<T[]> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  const text = await res.text();
  return Papa.parse<T>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  }).data;
}

export function useCSVData() {
  const [data, setData] = useState<CSVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchCSV<SummaryRow>('/data/summary.csv'),
      fetchCSV<DailyRow>('/data/daily.csv'),
      fetchCSV<ActivityRow>('/data/activity.csv'),
      fetchCSV<ModelRow>('/data/models.csv'),
      fetchCSV<ProjectRow>('/data/projects.csv'),
      fetchCSV<SessionRow>('/data/sessions.csv'),
      fetchCSV<ToolRow>('/data/tools.csv'),
      fetchCSV<ShellCommandRow>('/data/shell-commands.csv'),
    ])
      .then(([summary, daily, activity, models, projects, sessions, tools, shellCommands]) => {
        setData({ summary, daily, activity, models, projects, sessions, tools, shellCommands });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

- [ ] **Step 3: Verify types**

```bash
npx tsc --noEmit
```

Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/hooks/useCSVData.ts
git commit -m "feat: add CSV types and useCSVData hook"
```

---

### Task 3: App shell + PeriodToggle

**Goal:** Wire `useCSVData` into `App.tsx` with loading/error states, period state, and a `PeriodToggle` component.

**Files:**
- Create: `src/components/PeriodToggle.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Dark page renders with period toggle showing "Today / 7 Days / 30 Days"
- [ ] Active period highlighted in blue
- [ ] Spinner / "Loading data…" shown during fetch
- [ ] Error message in red if fetch fails

**Verify:** `npm run dev` → toggle is interactive → clicking each period highlights it → no console errors

**Steps:**

- [ ] **Step 1: Create src/components/PeriodToggle.tsx**

```tsx
import type { Period } from '../types';

interface Props {
  selected: Period;
  onChange: (p: Period) => void;
}

const PERIODS: Period[] = ['Today', '7 Days', '30 Days'];

export default function PeriodToggle({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selected === p
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Replace src/App.tsx with the real shell**

```tsx
import { useState } from 'react';
import { useCSVData } from './hooks/useCSVData';
import PeriodToggle from './components/PeriodToggle';
import type { Period } from './types';

export default function App() {
  const [period, setPeriod] = useState<Period>('30 Days');
  const { data, loading, error } = useCSVData();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading data…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-red-400 text-sm">Error: {error ?? 'No data'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">AI Usage Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">CodeBurn export · 2026-06-13</p>
          </div>
          <PeriodToggle selected={period} onChange={setPeriod} />
        </div>

        {/* Placeholder — sections added in Tasks 4–8 */}
        <p className="text-slate-600 text-xs">
          {data.summary.length} summary rows · {data.daily.length} daily rows · {data.sessions.length} sessions
        </p>

      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Open `http://localhost:5173` — after brief loading:
- Header shows title + period toggle
- Footer shows "3 summary rows · 27 daily rows · 205 sessions"
- Clicking toggle highlights correct period

- [ ] **Step 4: Commit**

```bash
git add src/components/PeriodToggle.tsx src/App.tsx
git commit -m "feat: add app shell with period toggle and loading states"
```

---

### Task 4: Summary Cards

**Goal:** 4 stat cards (Total Cost, API Calls, Sessions, Projects) that update when the period toggle changes.

**Files:**
- Create: `src/components/SummaryCards.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] 4 cards render in a grid row
- [ ] 30 Days shows: $228.69, 3,845, 205 sessions, 18 projects
- [ ] Values update correctly for Today and 7 Days

**Verify:** `npm run dev` → switch periods → confirm values change correctly

**Steps:**

- [ ] **Step 1: Create src/components/SummaryCards.tsx**

```tsx
import type { SummaryRow, Period } from '../types';

interface Props {
  rows: SummaryRow[];
  period: Period;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function SummaryCards({ rows, period }: Props) {
  const row = rows.find((r) => r.Period === period);
  if (!row) return null;

  const avgPerSession = row.Sessions > 0
    ? `$${(row['Cost (USD)'] / row.Sessions).toFixed(2)}`
    : '$0.00';

  return (
    <div className="grid grid-cols-4 gap-3">
      <StatCard
        label="Total Cost"
        value={`$${row['Cost (USD)'].toFixed(2)}`}
        sub={`$${row['Saved (USD)'].toFixed(2)} saved`}
      />
      <StatCard
        label="API Calls"
        value={row['API Calls'].toLocaleString()}
        sub={`${row.Sessions} sessions`}
      />
      <StatCard
        label="Projects"
        value={String(row.Projects)}
        sub="active"
      />
      <StatCard
        label="Avg / Session"
        value={avgPerSession}
        sub={`${row.Sessions} sessions`}
      />
    </div>
  );
}
```

- [ ] **Step 2: Add SummaryCards to App.tsx**

Add import at top of `src/App.tsx`:
```tsx
import SummaryCards from './components/SummaryCards';
```

Replace the placeholder `<p className="text-slate-600...">` with:
```tsx
{/* Summary */}
<section className="mb-8">
  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Summary</p>
  <SummaryCards rows={data.summary} period={period} />
</section>
```

- [ ] **Step 3: Verify**

- 30 Days: $228.69 · 3,845 · 18 projects · $1.12/session
- 7 Days: $42.49 · 785 · 9 projects
- Today: $0.03 · 2 · 1 project

- [ ] **Step 4: Commit**

```bash
git add src/components/SummaryCards.tsx src/App.tsx
git commit -m "feat: add summary stat cards"
```

---

### Task 5: Daily Spend Chart

**Goal:** Bar chart showing cost per day, filtered by the selected period.

**Files:**
- Create: `src/components/DailyChart.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Recharts BarChart renders with date on X axis, cost ($) on Y axis
- [ ] Tooltip shows exact cost on hover
- [ ] 30 Days shows 20 bars; 7 Days shows 5 bars; Today shows 1 bar

**Verify:** `npm run dev` → hover a bar → tooltip shows "$X.XX" → switch to 7 Days → 5 bars

**Steps:**

- [ ] **Step 1: Create src/components/DailyChart.tsx**

```tsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { DailyRow, Period } from '../types';

interface Props {
  rows: DailyRow[];
  period: Period;
}

export default function DailyChart({ rows, period }: Props) {
  const data = rows
    .filter((r) => r.Period === period)
    .map((r) => ({
      date: r.Date.slice(5),       // "MM-DD"
      cost: r['Cost (USD)'],
    }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 mb-4">Cost per day (USD)</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `$${v}`}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6 }}
            labelStyle={{ color: '#94a3b8', fontSize: 11 }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
          />
          <Bar dataKey="cost" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Add DailyChart to App.tsx**

Add import:
```tsx
import DailyChart from './components/DailyChart';
```

After the Summary section:
```tsx
{/* Daily Spend */}
<section className="mb-8">
  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Daily Spend</p>
  <DailyChart rows={data.daily} period={period} />
</section>
```

- [ ] **Step 3: Verify**

30 Days → 20 bars, largest around May 24 ($40.49) and May 25 ($40.26).

- [ ] **Step 4: Commit**

```bash
git add src/components/DailyChart.tsx src/App.tsx
git commit -m "feat: add daily spend bar chart"
```

---

### Task 6: Activity + Models Charts

**Goal:** Two side-by-side horizontal bar charts — activity breakdown and cost by model — both period-filtered.

**Files:**
- Create: `src/components/ActivityChart.tsx`
- Create: `src/components/ModelsChart.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Both charts use Recharts `layout="vertical"` (horizontal bars)
- [ ] Activity chart sorted by cost desc, all activity types shown
- [ ] Models chart sorted by cost desc, top 8 shown
- [ ] 30 Days: Activity top = "Feature Dev $66.60"; Models top = "Sonnet 4.6 $123.27"

**Verify:** `npm run dev` → 30 Days → Activity first bar is "Feature Dev" → Models first bar is "Sonnet 4.6"

**Steps:**

- [ ] **Step 1: Create src/components/ActivityChart.tsx**

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ActivityRow, Period } from '../types';

interface Props {
  rows: ActivityRow[];
  period: Period;
}

export default function ActivityChart({ rows, period }: Props) {
  const data = rows
    .filter((r) => r.Period === period)
    .sort((a, b) => b['Cost (USD)'] - a['Cost (USD)'])
    .map((r) => ({ name: r.Activity, cost: r['Cost (USD)'] }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 mb-4">Cost by activity</p>
      <ResponsiveContainer width="100%" height={Math.max(data.length * 32, 120)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => `$${v}`}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6 }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
          />
          <Bar dataKey="cost" fill="#3b82f6" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/ModelsChart.tsx**

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ModelRow, Period } from '../types';

interface Props {
  rows: ModelRow[];
  period: Period;
}

export default function ModelsChart({ rows, period }: Props) {
  const data = rows
    .filter((r) => r.Period === period)
    .sort((a, b) => b['Cost (USD)'] - a['Cost (USD)'])
    .slice(0, 8)
    .map((r) => ({ name: r.Model, cost: r['Cost (USD)'] }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 mb-4">Cost by model (top 8)</p>
      <ResponsiveContainer width="100%" height={Math.max(data.length * 32, 120)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => `$${v}`}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6 }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
          />
          <Bar dataKey="cost" fill="#22c55e" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Add both to App.tsx**

Add imports:
```tsx
import ActivityChart from './components/ActivityChart';
import ModelsChart from './components/ModelsChart';
```

After Daily Spend section:
```tsx
{/* Activity & Models */}
<section className="mb-8">
  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Activity & Models</p>
  <div className="grid grid-cols-2 gap-4">
    <ActivityChart rows={data.activity} period={period} />
    <ModelsChart rows={data.models} period={period} />
  </div>
</section>
```

- [ ] **Step 4: Verify**

30 Days: Activity — "Feature Dev" top bar. Models — "Sonnet 4.6" top bar.
Switch to 7 Days: Activity — "Coding" top bar. Models — "Sonnet 4.6" top bar.

- [ ] **Step 5: Commit**

```bash
git add src/components/ActivityChart.tsx src/components/ModelsChart.tsx src/App.tsx
git commit -m "feat: add activity and models horizontal bar charts"
```

---

### Task 7: Projects Chart + Sessions Table

**Goal:** Horizontal bar chart for top 10 projects by cost (30-Day, static), and a table of top 20 sessions sorted by cost.

**Files:**
- Create: `src/components/ProjectsChart.tsx`
- Create: `src/components/SessionsTable.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Projects chart shows top 10, path truncated to last path segment
- [ ] Projects top bar = "vscode-git-client" at $71.63
- [ ] Sessions table top row = $18.76 (thanhtunguet/goclaw, 2026-05-23)
- [ ] Period toggle has no effect on either component

**Verify:** `npm run dev` → switch period → Projects and Sessions remain unchanged

**Steps:**

- [ ] **Step 1: Create src/components/ProjectsChart.tsx**

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProjectRow } from '../types';

interface Props {
  rows: ProjectRow[];
}

function shortName(path: string): string {
  const parts = path.replace(/^\/+/, '').split('/');
  return parts[parts.length - 1] || path;
}

export default function ProjectsChart({ rows }: Props) {
  const data = [...rows]
    .sort((a, b) => b['Cost (USD)'] - a['Cost (USD)'])
    .slice(0, 10)
    .map((r) => ({ name: shortName(r.Project), cost: r['Cost (USD)'] }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 mb-4">Cost by project — top 10 (30 days)</p>
      <ResponsiveContainer width="100%" height={Math.max(data.length * 36, 160)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 50, bottom: 0, left: 0 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => `$${v}`}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6 }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
          />
          <Bar dataKey="cost" fill="#3b82f6" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/SessionsTable.tsx**

```tsx
import type { SessionRow } from '../types';

interface Props {
  rows: SessionRow[];
}

function shortProject(path: string): string {
  const parts = path.replace(/^\/+/, '').split('/');
  return parts.slice(-2).join('/');
}

export default function SessionsTable({ rows }: Props) {
  const top20 = [...rows]
    .sort((a, b) => b['Cost (USD)'] - a['Cost (USD)'])
    .slice(0, 20);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800">
        <p className="text-xs text-slate-500">Top 20 sessions by cost (30 days)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">Project</th>
              <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">Started</th>
              <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">Cost</th>
              <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">Calls</th>
              <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">Turns</th>
            </tr>
          </thead>
          <tbody>
            {top20.map((row, idx) => (
              <tr key={`${row['Session ID']}-${idx}`} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                <td className="px-4 py-2.5 text-slate-400 text-xs max-w-[180px] truncate">{shortProject(row.Project)}</td>
                <td className="px-4 py-2.5 text-slate-500 text-xs">{row['Started At'].slice(0, 10)}</td>
                <td className="px-4 py-2.5 text-white font-mono text-xs text-right">${row['Cost (USD)'].toFixed(2)}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs text-right">{row['API Calls']}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs text-right">{row.Turns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add both to App.tsx**

Add imports:
```tsx
import ProjectsChart from './components/ProjectsChart';
import SessionsTable from './components/SessionsTable';
```

After Activity & Models section:
```tsx
{/* Projects */}
<section className="mb-8">
  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Projects (30 Days)</p>
  <ProjectsChart rows={data.projects} />
</section>

{/* Sessions */}
<section className="mb-8">
  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Top Sessions</p>
  <SessionsTable rows={data.sessions} />
</section>
```

- [ ] **Step 4: Verify**

Projects top = "vscode-git-client" $71.63.
Sessions top = $18.76 · thanhtunguet/goclaw · 2026-05-23.
Switch period → both sections unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectsChart.tsx src/components/SessionsTable.tsx src/App.tsx
git commit -m "feat: add projects chart and sessions table"
```

---

### Task 8: Tools + Shell Commands Charts

**Goal:** Two side-by-side horizontal bar charts for tool calls and shell command usage. Full page verified.

**Files:**
- Create: `src/components/ToolsChart.tsx`
- Create: `src/components/ShellCommandsChart.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Tools chart: top 10 by call count, "Bash" first with 1,363
- [ ] Shell commands chart: top 10, "grep" first with 344
- [ ] Full page scrolls through all 7 sections without layout issues
- [ ] `npx tsc --noEmit` exits 0

**Verify:** `npm run dev` → scroll full page → all sections visible → `npx tsc --noEmit` exits 0

**Steps:**

- [ ] **Step 1: Create src/components/ToolsChart.tsx**

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ToolRow } from '../types';

interface Props {
  rows: ToolRow[];
}

export default function ToolsChart({ rows }: Props) {
  const data = [...rows]
    .sort((a, b) => b.Calls - a.Calls)
    .slice(0, 10)
    .map((r) => ({ name: r.Tool, calls: r.Calls }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 mb-4">Tool calls — top 10 (30 days)</p>
      <ResponsiveContainer width="100%" height={Math.max(data.length * 32, 120)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 50, bottom: 0, left: 0 }}>
          <XAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6 }}
            formatter={(value: number) => [value.toLocaleString(), 'Calls']}
          />
          <Bar dataKey="calls" fill="#3b82f6" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/ShellCommandsChart.tsx**

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ShellCommandRow } from '../types';

interface Props {
  rows: ShellCommandRow[];
}

export default function ShellCommandsChart({ rows }: Props) {
  const data = [...rows]
    .sort((a, b) => b.Calls - a.Calls)
    .slice(0, 10)
    .map((r) => ({ name: r.Command, calls: r.Calls }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 mb-4">Shell commands — top 10 (30 days)</p>
      <ResponsiveContainer width="100%" height={Math.max(data.length * 32, 120)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 50, bottom: 0, left: 0 }}>
          <XAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6 }}
            formatter={(value: number) => [value.toLocaleString(), 'Calls']}
          />
          <Bar dataKey="calls" fill="#22c55e" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Add to App.tsx and finalize**

Add imports:
```tsx
import ToolsChart from './components/ToolsChart';
import ShellCommandsChart from './components/ShellCommandsChart';
```

After Sessions section, add the final section and a bottom spacer:
```tsx
{/* Tools & Shell Commands */}
<section className="mb-8">
  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Tools & Shell Commands (30 Days)</p>
  <div className="grid grid-cols-2 gap-4">
    <ToolsChart rows={data.tools} />
    <ShellCommandsChart rows={data.shellCommands} />
  </div>
</section>

<div className="h-16" />
```

- [ ] **Step 4: Final type check**

```bash
npx tsc --noEmit
```

Expected: no output, exit code 0. If errors appear, fix the indicated types.

- [ ] **Step 5: Verify full page**

`npm run dev` → scroll through all 7 sections:
1. Header + period toggle
2. Summary cards (4 stats)
3. Daily spend bar chart
4. Activity & Models (side-by-side)
5. Projects (horizontal bar)
6. Top Sessions (table)
7. Tools & Shell Commands (side-by-side)

- [ ] **Step 6: Final commit**

```bash
git add src/components/ToolsChart.tsx src/components/ShellCommandsChart.tsx src/App.tsx
git commit -m "feat: add tools and shell commands charts — dashboard complete"
```
