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
