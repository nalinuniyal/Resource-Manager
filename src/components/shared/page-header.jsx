export function PageHeader({ eyebrow, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400 mb-1">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all glow-blue shrink-0"
        >
          <span>+</span> {actionLabel}
        </button>
      )}
    </div>
  );
}
