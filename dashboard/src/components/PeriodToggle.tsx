import type { Period } from '../types';

interface Props {
  selected: Period;
  onChange: (p: Period) => void;
}

const PERIODS: Period[] = ['Today', '7 Days', '30 Days'];

export default function PeriodToggle({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selected === p
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
