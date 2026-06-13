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

export function useCSVData(username: string | null) {
  const [data, setData] = useState<CSVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const base = `/data/${encodeURIComponent(username)}`;
    Promise.all([
      fetchCSV<SummaryRow>(`${base}/summary.csv`),
      fetchCSV<DailyRow>(`${base}/daily.csv`),
      fetchCSV<ActivityRow>(`${base}/activity.csv`),
      fetchCSV<ModelRow>(`${base}/models.csv`),
      fetchCSV<ProjectRow>(`${base}/projects.csv`),
      fetchCSV<SessionRow>(`${base}/sessions.csv`),
      fetchCSV<ToolRow>(`${base}/tools.csv`),
      fetchCSV<ShellCommandRow>(`${base}/shell-commands.csv`),
    ])
      .then(([summary, daily, activity, models, projects, sessions, tools, shellCommands]) => {
        setData({ summary, daily, activity, models, projects, sessions, tools, shellCommands });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  return { data, loading, error };
}
