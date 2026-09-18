import { apiRequest, buildQuery } from "./api";

export const adminCustomerService = {
  async getCustomers({ search, page = 1, limit = 20 } = {}) {
    const query = buildQuery({ search, page, limit });
    const data = await apiRequest(`/admin/customers${query}`);
    return { customers: data.customers, pagination: data.pagination };
  },

  async getCustomerById(id) {
    const data = await apiRequest(`/admin/customers/${id}`);
    return { customer: data.customer, orders: data.orders, orderCount: data.orderCount, totalSpent: data.totalSpent };
  },

  async setCustomerActive(id, isActive) {
    const data = await apiRequest(`/admin/customers/${id}/status`, {
      method: "PUT",
      body: { isActive },
    });
    return data.customer;
  },
};
