export default function ShadeSelector({ shades, selected, onSelect }) {
  if (!shades || shades.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs uppercase tracking-luxe text-charcoal mb-3">
        Shade — <span className="text-charcoal-soft normal-case">{selected?.name}</span>
      </h3>
      <div className="flex flex-wrap gap-3">
        {shades.map((shade) => (
          <button
            key={shade.name}
            type="button"
            onClick={() => onSelect(shade)}
            aria-label={shade.name}
            aria-pressed={selected?.name === shade.name}
            title={shade.name}
            className={`h-9 w-9 rounded-full border-2 transition-all ${
              selected?.name === shade.name
                ? "border-charcoal scale-110"
                : "border-transparent hover:border-nude-dark"
            }`}
            style={{ backgroundColor: shade.color }}
          />
        ))}
      </div>
    </div>
  );
}
