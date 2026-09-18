import { apiRequest } from "./api";

export const adminCategoryService = {
  async getCategories() {
    const data = await apiRequest("/categories", { auth: false });
    return data.categories;
  },

  async createCategory(payload) {
    const data = await apiRequest("/admin/categories", { method: "POST", body: payload });
    return data.category;
  },

  async updateCategory(id, payload) {
    const data = await apiRequest(`/admin/categories/${id}`, { method: "PUT", body: payload });
    return data.category;
  },

  async deleteCategory(id) {
    await apiRequest(`/admin/categories/${id}`, { method: "DELETE" });
  },
};
