import { apiRequest, getToken } from './api';

const readLocalOrders = () => {
  try {
    const raw = localStorage.getItem('lumea_orders') || localStorage.getItem('orders');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Could not read local orders:', error);
    return [];
  }
};

export const createOrder = async (orderData) => {
  const token = getToken();

  if (token) {
    try {
      const data = await apiRequest('/orders', {
        method: 'POST',
        body: orderData,
      });
      const created = data?.order || data?.data || data;
      if (created && (created._id || created.orderId || created.orderNumber)) {
        return created;
      }
    } catch (error) {
      console.warn('Server createOrder failed, falling back to local:', error.message);
    }
  }

  const created = {
    ...orderData,
    _id: `ORD-${Date.now()}`,
    orderNumber: orderData.orderNumber || `LUMEA-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    orderStatus: 'Processing',
  };

  try {
    const existing = readLocalOrders();
    const updated = [
      created,
      ...existing.filter(
        (o) => (o._id || o.orderNumber) !== (created._id || created.orderNumber)
      ),
    ];
    localStorage.setItem('lumea_orders', JSON.stringify(updated));
  } catch (error) {
    console.warn('Could not save local order:', error);
  }

  return created;
};

export const getMyOrders = async () => {
  const token = getToken();

  if (!token) {
    return readLocalOrders();
  }

  try {
    const data = await apiRequest('/users/orders');
    const orders = data?.orders || data?.data?.orders || data?.data || data || [];
    if (Array.isArray(orders) && orders.length > 0) {
      return orders;
    }
  } catch (error) {
    console.warn('Server getMyOrders failed, falling back to local:', error.message);
  }

  return readLocalOrders();
};

export const getOrderById = async (orderId) => {
  const target = String(orderId || '').trim();
  if (!target) return null;

  try {
    const data = await apiRequest(`/orders/${encodeURIComponent(target)}`);
    const found = data?.order || data?.data?.order || data?.data || data;
    if (found && (found._id || found.orderNumber || found.items)) {
      return found;
    }
  } catch (error) {
    console.warn('Server lookup failed, trying local:', error.message);
  }

  try {
    const local = readLocalOrders();
    return local.find(
      (o) => o._id === target || o.orderNumber === target || o.orderId === target
    ) || null;
  } catch (error) {
    console.warn('Local lookup failed:', error);
    return null;
  }
};

export const getOrderByNumber = getOrderById;
export const trackOrder = getOrderById;