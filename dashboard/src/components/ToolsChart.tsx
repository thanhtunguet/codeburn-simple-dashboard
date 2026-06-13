import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ToolRow } from '../types';

interface Props {
  rows: ToolRow[];
}

export default function ToolsChart({ rows }: Props) {
  const data = rows
    .slice()
    .sort((a, b) => b.Calls - a.Calls)
    .slice(0, 10)
    .map((r) => ({ tool: r.Tool, calls: r.Calls }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
      <h2 className="text-sm font-medium text-slate-400 mb-4">Tool Usage (30 Days)</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="tool"
            width={100}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Calls']}
          />
          <Bar dataKey="calls" fill="#3b82f6" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
