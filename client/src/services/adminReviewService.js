import { apiRequest, buildQuery } from "./api";

export const adminReviewService = {
  async getReviews(status) {
    const data = await apiRequest(`/admin/reviews${buildQuery({ status })}`);
    // Returns data.reviews if wrapped, otherwise returns data directly
    return Array.isArray(data) ? data : data?.reviews || [];
  },

  async updateReviewStatus(id, status) {
    const data = await apiRequest(`/admin/reviews/${id}/status`, {
      method: "PUT",
      body: { status },
    });
    return data?.review || data;
  },

  async deleteReview(id) {
    await apiRequest(`/admin/reviews/${id}`, { method: "DELETE" });
  },
};