import { apiRequest, buildQuery } from "./api";

/**
 * Unlike services/productService.js (used by the customer site), this
 * returns/sends the RAW backend Product shape (thumbnail, originalPrice,
 * howToUse as a string, ingredients/shades as arrays of strings, etc.) since
 * the admin product form edits those fields directly.
 */
export const adminProductService = {
  async getProducts({ search, category, page = 1, limit = 20 } = {}) {
    const query = buildQuery({ search, category, page, limit });
    const data = await apiRequest(`/products${query}`, { auth: false });
    return { products: data.products, pagination: data.pagination };
  },

  async getProductById(id) {
    const data = await apiRequest(`/products/${id}`, { auth: false });
    return data.product;
  },

  async createProduct(payload) {
    const data = await apiRequest("/admin/products", { method: "POST", body: payload });
    return data.product;
  },

  async updateProduct(id, payload) {
    const data = await apiRequest(`/admin/products/${id}`, { method: "PUT", body: payload });
    return data.product;
  },

  async deleteProduct(id) {
    await apiRequest(`/admin/products/${id}`, { method: "DELETE" });
  },
};
