import type { SessionRow } from '../types';

interface Props {
  rows: SessionRow[];
}

function shortName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

export default function SessionsTable({ rows }: Props) {
  const top20 = rows
    .slice()
    .sort((a, b) => b['Cost (USD)'] - a['Cost (USD)'])
    .slice(0, 20);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-sm font-medium text-slate-400 mb-4">Top Sessions (30 Days)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-800">
              <th className="pb-2 pr-4 font-medium">Project</th>
              <th className="pb-2 pr-4 font-medium">Started</th>
              <th className="pb-2 pr-4 font-medium text-right">Cost</th>
              <th className="pb-2 pr-4 font-medium text-right">API Calls</th>
              <th className="pb-2 font-medium text-right">Turns</th>
            </tr>
          </thead>
          <tbody>
            {top20.map((s) => (
              <tr
                key={s['Session ID']}
                className="border-b border-slate-800/50 hover:bg-slate-800/30"
              >
                <td className="py-2 pr-4 text-slate-300">{shortName(s.Project)}</td>
                <td className="py-2 pr-4 text-slate-400">{new Date(s['Started At']).toISOString().slice(0, 16).replace('T', ' ')}</td>
                <td className="py-2 pr-4 text-right text-white font-mono">
                  ${s['Cost (USD)'].toFixed(2)}
                </td>
                <td className="py-2 pr-4 text-right text-slate-400">{s['API Calls']}</td>
                <td className="py-2 text-right text-slate-400">{s.Turns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
