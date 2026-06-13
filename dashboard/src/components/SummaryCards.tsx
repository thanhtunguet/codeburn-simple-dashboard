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
