import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ProjectRow } from '../types';

interface Props {
  rows: ProjectRow[];
}

function shortName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

export default function ProjectsChart({ rows }: Props) {
  const data = rows
    .slice()
    .sort((a, b) => b['Cost (USD)'] - a['Cost (USD)'])
    .slice(0, 10)
    .map((r) => ({
      project: shortName(r.Project),
      cost: r['Cost (USD)'],
    }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-sm font-medium text-slate-400 mb-4">Top Projects (30 Days)</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <YAxis
            type="category"
            dataKey="project"
            width={140}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Cost']}
          />
          <Bar dataKey="cost" fill="#3b82f6" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
