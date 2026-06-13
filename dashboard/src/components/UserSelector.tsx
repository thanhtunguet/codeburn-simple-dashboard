interface Props {
  users: string[];
  selected: string | null;
  onSelect: (username: string) => void;
}

export default function UserSelector({ users, selected, onSelect }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">User</span>
      <div className="flex flex-wrap gap-2">
        {users.map((u) => (
          <button
            key={u}
            onClick={() => onSelect(u)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              selected === u
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
