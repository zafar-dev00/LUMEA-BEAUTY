import { apiRequest } from "./api";

export const adminCouponService = {
  async getCoupons() {
    const data = await apiRequest("/admin/coupons");
    return data.coupons;
  },

  async createCoupon(payload) {
    const data = await apiRequest("/admin/coupons", { method: "POST", body: payload });
    return data.coupon;
  },

  async updateCoupon(id, payload) {
    const data = await apiRequest(`/admin/coupons/${id}`, { method: "PUT", body: payload });
    return data.coupon;
  },

  async deleteCoupon(id) {
    await apiRequest(`/admin/coupons/${id}`, { method: "DELETE" });
  },
};
