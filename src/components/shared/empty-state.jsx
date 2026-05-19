export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
        <span className="text-2xl opacity-40">📭</span>
      </div>
      <p className="font-semibold text-slate-400">{title}</p>
      {description && <p className="mt-1.5 text-sm text-slate-600 max-w-xs">{description}</p>}
    </div>
  );
}
