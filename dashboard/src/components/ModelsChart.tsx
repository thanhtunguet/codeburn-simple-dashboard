import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
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
    .map((r) => ({
      model: r.Model,
      cost: r['Cost (USD)'],
    }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
      <h2 className="text-sm font-medium text-slate-400 mb-4">Cost by Model</h2>
      <ResponsiveContainer width="100%" height={220}>
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
            dataKey="model"
            width={130}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
          />
          <Bar dataKey="cost" fill="#a78bfa" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
