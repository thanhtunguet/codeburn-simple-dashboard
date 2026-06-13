import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
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
      date: r.Date.slice(5),        // "MM-DD" from "YYYY-MM-DD"
      cost: r['Cost (USD)'],
    }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-sm font-medium text-slate-400 mb-4">Daily Spend</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
          />
          <Bar dataKey="cost" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
