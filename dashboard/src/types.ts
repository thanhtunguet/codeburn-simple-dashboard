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
  'One-shot Rate (%)': number | null;
  'Retries/Edit': number | null;
  'Cost/Edit (USD)': number | null;
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
  'Started At': string | Date;
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
