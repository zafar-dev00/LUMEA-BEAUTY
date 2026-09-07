import { apiRequest, buildQuery } from "./api";

export const adminReviewService = {
  async getReviews(status) {
    const data = await apiRequest(`/admin/reviews${buildQuery({ status })}`);
    return data.reviews;
  },

  async updateReviewStatus(id, status) {
    const data = await apiRequest(`/admin/reviews/${id}/status`, {
      method: "PUT",
      body: { status },
    });
    return data.review;
  },

  async deleteReview(id) {
    await apiRequest(`/admin/reviews/${id}`, { method: "DELETE" });
  },
};
