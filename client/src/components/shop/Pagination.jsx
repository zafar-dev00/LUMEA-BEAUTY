import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-14">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="flex h-10 w-10 items-center justify-center border border-charcoal/20 text-charcoal disabled:opacity-30 hover:bg-charcoal hover:text-ivory transition-colors disabled:hover:bg-transparent disabled:hover:text-charcoal"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`flex h-10 w-10 items-center justify-center text-sm transition-colors ${
            p === page
              ? "bg-charcoal text-ivory"
              : "border border-charcoal/20 text-charcoal hover:bg-cream"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-10 w-10 items-center justify-center border border-charcoal/20 text-charcoal disabled:opacity-30 hover:bg-charcoal hover:text-ivory transition-colors disabled:hover:bg-transparent disabled:hover:text-charcoal"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
