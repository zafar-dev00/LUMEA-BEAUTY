import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ value, onChange, min = 1 }) {
  return (
    <div className="flex items-center border border-charcoal/20">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-12 w-12 flex items-center justify-center text-charcoal hover:bg-cream transition-colors"
      >
        <Minus size={14} />
      </button>
      <span className="w-12 text-center text-sm">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="h-12 w-12 flex items-center justify-center text-charcoal hover:bg-cream transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
