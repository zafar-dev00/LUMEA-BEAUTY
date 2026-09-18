import { X } from "lucide-react";
import FilterSidebar from "./FilterSidebar";

export default function MobileFilterDrawer({
  open,
  onClose,
  filters,
  setFilters,
  onClear,
  categoryOptions,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-charcoal/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-ivory p-6 shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm uppercase tracking-luxe text-charcoal">
            Filters
          </span>
          <button onClick={onClose} aria-label="Close filters">
            <X size={20} className="text-charcoal" />
          </button>
        </div>

        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          onClear={onClear}
          categoryOptions={categoryOptions}
        />

        <button
          type="button"
          onClick={onClose}
          className="mt-10 w-full bg-charcoal text-ivory py-3 text-xs uppercase tracking-luxe hover:bg-charcoal-soft transition-colors"
        >
          Show Results
        </button>
      </div>
    </div>
  );
}
