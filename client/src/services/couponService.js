import { apiRequest } from "./api";

export const couponService = {
  async validateCoupon(code, subtotal) {
    const data = await apiRequest("/coupons/validate", {
      method: "POST",
      auth: false,
      body: { code, subtotal },
    });
    return data.coupon;
  },
};
