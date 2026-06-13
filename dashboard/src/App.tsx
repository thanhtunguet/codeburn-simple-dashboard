import { useState } from 'react';
import { useCSVData } from './hooks/useCSVData';
import PeriodToggle from './components/PeriodToggle';
import SummaryCards from './components/SummaryCards';
import DailyChart from './components/DailyChart';
import ActivityChart from './components/ActivityChart';
import ModelsChart from './components/ModelsChart';
import ProjectsChart from './components/ProjectsChart';
import SessionsTable from './components/SessionsTable';
import ToolsChart from './components/ToolsChart';
import ShellCommandsChart from './components/ShellCommandsChart';
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

        {/* Summary */}
        <section className="mb-8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Summary</p>
          <SummaryCards rows={data.summary} period={period} />
        </section>

        {/* Daily Spend */}
        <section className="mb-8">
          <DailyChart rows={data.daily} period={period} />
        </section>

        {/* Activity + Models */}
        <section className="mb-8 grid grid-cols-2 gap-4">
          <ActivityChart rows={data.activity} period={period} />
          <ModelsChart rows={data.models} period={period} />
        </section>

        <section className="mb-8">
          <ProjectsChart rows={data.projects} />
        </section>
        <section className="mb-8">
          <SessionsTable rows={data.sessions} />
        </section>

        <section className="mb-8 grid grid-cols-2 gap-4">
          <ToolsChart rows={data.tools} />
          <ShellCommandsChart rows={data.shellCommands} />
        </section>

      </div>
    </div>
  );
}
