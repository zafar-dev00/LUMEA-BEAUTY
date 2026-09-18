export default function StatCard({ label, value, icon: Icon, tone = "default", hint }) {
  const toneClasses =
    tone === "warning"
      ? "text-rose-dark"
      : tone === "accent"
      ? "text-rose"
      : "text-charcoal";

  return (
    <div className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-luxe text-charcoal-soft">{label}</p>
        {Icon && <Icon size={18} className="text-nude-dark" />}
      </div>
      <p className={`mt-3 text-2xl sm:text-3xl font-medium ${toneClasses}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-charcoal-soft">{hint}</p>}
    </div>
  );
}
