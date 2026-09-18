import { apiRequest, buildQuery } from "./api";

export const adminOrderService = {
  async getOrders({ status, search, page = 1, limit = 20 } = {}) {
    const query = buildQuery({ status, search, page, limit });
    const data = await apiRequest(`/admin/orders${query}`);
    return { orders: data.orders, statuses: data.statuses, pagination: data.pagination };
  },

  async getOrderById(id) {
    const data = await apiRequest(`/admin/orders/${id}`);
    return data.order;
  },

  async updateOrderStatus(id, status) {
    const data = await apiRequest(`/admin/orders/${id}/status`, {
      method: "PUT",
      body: { status },
    });
    return data.order;
  },
};
