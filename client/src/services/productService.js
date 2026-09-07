import { apiRequest, buildQuery } from "./api";
import { toCardProducts, toDetailProduct } from "./productAdapter";

// UI sort keys -> backend sort keys (server/controllers/productController.js SORT_MAP)
const SORT_TO_API = {
  featured: undefined, // default backend order (newest) doubles as "featured"
  "price-asc": "price-low",
  "price-desc": "price-high",
  rating: "rating",
  newest: "newest",
};

export const productService = {
  /**
   * Fetch a page of products from GET /api/products.
   * Accepts the Shop page's UI-shaped filters and translates them into the
   * query params the backend actually understands.
   */
  async getProducts({
    search,
    categories, // array of category names (UI supports multi-select; backend supports one)
    minPrice,
    maxPrice,
    minRating,
    sort,
    page = 1,
    limit = 8,
  } = {}) {
    const query = buildQuery({
      search,
      category: categories && categories.length === 1 ? categories[0] : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      rating: minRating || undefined,
      sort: SORT_TO_API[sort],
      page,
      limit,
    });

    const data = await apiRequest(`/products${query}`, { auth: false });
    return {
      products: toCardProducts(data.products),
      pagination: data.pagination,
    };
  },

  /** Fetch a larger, unfiltered batch — used by Home to derive Featured / Best Sellers sections. */
  async getProductsBatch(limit = 100) {
    const data = await apiRequest(`/products${buildQuery({ limit })}`, { auth: false });
    return toCardProducts(data.products);
  },

  async getProductById(id) {
    const data = await apiRequest(`/products/${id}`, { auth: false });
    return toDetailProduct(data.product);
  },

  async getRelatedProducts(product, limit = 4) {
    if (!product) return [];
    const data = await apiRequest(
      `/products${buildQuery({ category: product.category, limit: limit + 1 })}`,
      { auth: false }
    );
    return toCardProducts(data.products.filter((p) => p._id !== product.id)).slice(0, limit);
  },
};
