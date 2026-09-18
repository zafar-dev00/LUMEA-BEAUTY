import { apiRequest, buildQuery } from "./api";

export const adminDashboardService = {
  async getStats() {
    const data = await apiRequest("/admin/dashboard");
    return data.stats;
  },

  async getAnalytics(range = "7d") {
    const data = await apiRequest(`/admin/analytics${buildQuery({ range })}`);
    return { series: data.series, topProducts: data.topProducts, range: data.range };
  },
};
