import { useEffect, useState } from 'react';
import { useCSVData } from './hooks/useCSVData';
import { useUsers } from './hooks/useUsers';
import UserSelector from './components/UserSelector';
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

function getUserFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('u');
}

export default function App() {
  const [period, setPeriod] = useState<Period>('30 Days');
  const [rawSelectedUser, setSelectedUser] = useState<string | null>(getUserFromUrl());
  const { users, loading: usersLoading, error: usersError } = useUsers();
  // Don't fetch data until the user list has loaded and the URL-provided user
  // is confirmed to exist; otherwise fall back to no selection.
  const selectedUser = !usersLoading && rawSelectedUser && users.includes(rawSelectedUser)
    ? rawSelectedUser
    : null;
  const { data, loading: dataLoading, error: dataError } = useCSVData(selectedUser);

  // Keep selectedUser in sync with browser Back/Forward navigation.
  useEffect(() => {
    function handlePopState() {
      setSelectedUser(getUserFromUrl());
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function selectUser(username: string) {
    setSelectedUser(username);
    const url = new URL(window.location.href);
    url.searchParams.set('u', username);
    window.history.pushState(null, '', url);
  }

  // ── Users loading/error ──────────────────────────────────────────────────
  if (usersLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Connecting to server…</p>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-red-400 text-sm">Error: {usersError}</p>
      </div>
    );
  }

  // ── No users yet ─────────────────────────────────────────────────────────
  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-white font-semibold">No data yet</p>
          <p className="text-slate-400 text-sm">
            Upload your first export with the CLI:
          </p>
          <code className="block bg-slate-900 text-slate-300 text-xs px-4 py-2 rounded-lg font-mono">
            go run ./cli -dir /path/to/export
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">AI Usage Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">CodeBurn · per-user analytics</p>
          </div>
          <PeriodToggle selected={period} onChange={setPeriod} />
        </div>

        {/* User selector */}
        <div className="mb-8">
          <UserSelector users={users} selected={selectedUser} onSelect={selectUser} />
        </div>

        {/* Prompt to select a user */}
        {!selectedUser && (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
            Select a user above to view their dashboard.
          </div>
        )}

        {/* Data loading */}
        {selectedUser && dataLoading && (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            Loading data for {selectedUser}…
          </div>
        )}

        {/* Data error */}
        {selectedUser && dataError && (
          <div className="flex items-center justify-center h-48 text-red-400 text-sm">
            Error: {dataError}
          </div>
        )}

        {/* Dashboard */}
        {selectedUser && data && !dataLoading && (
          <>
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
          </>
        )}

      </div>
    </div>
  );
}
