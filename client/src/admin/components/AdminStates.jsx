export function AdminEmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16 border border-dashed border-charcoal/15">
      {Icon && <Icon size={36} className="mx-auto text-nude-dark" />}
      <h3 className="mt-4 text-lg text-charcoal">{title}</h3>
      {description && <p className="mt-1 text-sm text-charcoal-soft max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-4 border-b border-charcoal/10">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 bg-cream flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-16">
      <p className="text-rose-dark">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-xs uppercase tracking-luxe text-rose hover:text-rose-dark"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
