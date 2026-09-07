import StarRating from "../ui/StarRating";

const DEFAULT_CATEGORY_OPTIONS = ["Skincare", "Makeup", "Fragrance", "Haircare"];
const RATING_OPTIONS = [4, 3, 2];

export default function FilterSidebar({
  filters,
  setFilters,
  onClear,
  categoryOptions = DEFAULT_CATEGORY_OPTIONS,
}) {
  const toggleCategory = (cat) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  return (
    <div className="space-y-10">
      {/* Category */}
      <div>
        <h3 className="text-xs uppercase tracking-luxe text-charcoal mb-4">
          Category
        </h3>
        <ul className="space-y-3">
          {categoryOptions.map((cat) => (
            <li key={cat}>
              <label className="flex items-center gap-3 text-sm text-charcoal-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="h-4 w-4 accent-rose"
                />
                {cat}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-xs uppercase tracking-luxe text-charcoal mb-4">
          Price
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minPrice: Number(e.target.value) || 0,
              }))
            }
            className="w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm focus:outline-none focus:border-rose"
            aria-label="Minimum price"
          />
          <span className="text-nude-dark">—</span>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: Number(e.target.value) || 0,
              }))
            }
            className="w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm focus:outline-none focus:border-rose"
            aria-label="Maximum price"
          />
        </div>
        <input
          type="range"
          min="0"
          max="120"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              maxPrice: Number(e.target.value),
            }))
          }
          aria-label="Maximum price range"
          className="w-full mt-4 accent-rose"
        />
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-xs uppercase tracking-luxe text-charcoal mb-4">
          Rating
        </h3>
        <ul className="space-y-3">
          {RATING_OPTIONS.map((r) => (
            <li key={r}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === r}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, minRating: r }))
                  }
                  className="h-4 w-4 accent-rose"
                />
                <span className="flex items-center gap-2">
                  <StarRating rating={r} size={13} />
                  <span className="text-xs text-charcoal-soft">& up</span>
                </span>
              </label>
            </li>
          ))}
          <li>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === 0}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, minRating: 0 }))
                }
                className="h-4 w-4 accent-rose"
              />
              <span className="text-xs text-charcoal-soft">Any rating</span>
            </label>
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="text-xs uppercase tracking-luxe text-rose hover:text-rose-dark transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}
