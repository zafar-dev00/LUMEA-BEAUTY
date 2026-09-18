import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import ProductCard from "../components/ui/ProductCard";
import FilterSidebar from "../components/shop/FilterSidebar";
import MobileFilterDrawer from "../components/shop/MobileFilterDrawer";
import SortDropdown from "../components/shop/SortDropdown";
import Pagination from "../components/shop/Pagination";
import QuickViewModal from "../components/shop/QuickViewModal";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { usePageTitle } from "../hooks/usePageTitle";

const PAGE_SIZE = 8;

const DEFAULT_FILTERS = {
  categories: [],
  minPrice: 0,
  maxPrice: 120,
  minRating: 0,
};

const FALLBACK_CATEGORIES = ["Skincare", "Makeup", "Fragrance", "Haircare"];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  usePageTitle(initialCategory ? `Shop ${initialCategory}` : "Shop All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    categories: initialCategory ? [initialCategory] : [],
  }));
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [categoryOptions, setCategoryOptions] = useState(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Category list for the sidebar comes from the backend so it reflects
  // whatever categories actually exist, with a static fallback if that
  // request fails so the filter UI never disappears.
  useEffect(() => {
    categoryService
      .getCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategoryOptions(cats.map((c) => c.name));
        }
      })
      .catch(() => {
        // keep FALLBACK_CATEGORIES
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productService
      .getProducts({
        search: debouncedSearch || undefined,
        categories: filters.categories,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 120 ? filters.maxPrice : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        sort,
        page,
        limit: PAGE_SIZE,
      })
      .then(({ products: fetched, pagination }) => {
        if (cancelled) return;
        setProducts(fetched);
        setTotalPages(pagination?.pages || 1);
        setTotalCount(pagination?.total ?? fetched.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Something went wrong loading products.");
        setProducts([]);
        setTotalPages(1);
        setTotalCount(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filters, sort, page, retryToken]);

  const currentPage = Math.min(page, totalPages);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setPage(1);
  };

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const updateFilters = (updater) => {
    setFilters(updater);
    setPage(1);
  };

  const updateSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const showEmpty = !loading && !error && products.length === 0;

  return (
    <div className="bg-ivory">
      {/* Page header */}
      <div className="bg-cream py-12 lg:py-16">
        <div className="container-luxe text-center">
          <p className="text-xs uppercase tracking-luxe text-rose mb-3">
            The Full Collection
          </p>
          <h1 className="text-4xl sm:text-5xl text-charcoal">Shop All</h1>
          <p className="mt-3 text-charcoal-soft max-w-md mx-auto">
            Explore every LUMÉA essential, from skincare to fragrance.
          </p>
        </div>
      </div>

      <div className="container-luxe py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            setFilters={updateFilters}
            onClear={clearFilters}
            categoryOptions={categoryOptions}
          />
        </aside>

        {/* Main content */}
        <div>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between mb-8">
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-nude-dark"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-charcoal/20 bg-ivory pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-rose"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => updateSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nude-dark hover:text-rose"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 border border-charcoal/20 px-4 py-2.5 text-xs uppercase tracking-luxe text-charcoal"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
              <SortDropdown value={sort} onChange={updateSort} />
            </div>
          </div>

          {!loading && !error && (
            <p className="text-xs text-charcoal-soft uppercase tracking-luxe mb-6">
              {totalCount} product{totalCount !== 1 ? "s" : ""}
            </p>
          )}

          {/* Loading state */}
          {loading && <ProductGridSkeleton count={PAGE_SIZE} />}

          {/* Error state */}
          {!loading && error && (
            <div className="text-center py-20">
              <p className="text-rose-dark">{error}</p>
              <button
                type="button"
                onClick={() => setRetryToken((t) => t + 1)}
                className="mt-4 text-xs uppercase tracking-luxe text-rose hover:text-rose-dark"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="text-center py-20">
              <p className="text-charcoal-soft">
                No products match your filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-xs uppercase tracking-luxe text-rose hover:text-rose-dark"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Product grid */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}

          {!loading && !error && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        setFilters={updateFilters}
        onClear={clearFilters}
        categoryOptions={categoryOptions}
      />

      {/* Quick view modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
