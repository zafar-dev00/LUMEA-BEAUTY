import { apiRequest } from "./api";

export const categoryService = {
  async getCategories() {
    const data = await apiRequest("/categories", { auth: false });
    return data.categories;
  },
};
