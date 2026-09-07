import * as orderService from '../services/orderService';

/**
 * Format currency price
 */
export const formatPrice = (amount) => {
  const num = Number(amount) || 0;
  return `$${num.toFixed(2)}`;
};

/**
 * Format ISO date string to readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
};

/**
 * Retrieve the latest placed order from localStorage
 */
export const getLastOrder = () => {
  try {
    const local = localStorage.getItem('lumea_orders') || localStorage.getItem('orders');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    }
  } catch (e) {
    console.warn('Could not read last order from storage:', e);
  }
  return null;
};

/**
 * Format order reference / code
 */
export const formatOrderNumber = (order) => {
  if (!order) return 'LUMEA-ORDER';
  return order.orderNumber || order.orderId || order._id || 'LUMEA-ORDER';
};

/**
 * Format shipping address into a single readable string
 */
export const formatAddress = (addressObj) => {
  if (!addressObj) return '';
  if (typeof addressObj === 'string') return addressObj;
  const parts = [
    addressObj.address || addressObj.street,
    addressObj.city,
    addressObj.state,
    addressObj.zipCode || addressObj.postalCode,
    addressObj.country,
  ].filter(Boolean);
  return parts.join(', ');
};

/**
 * Tailwind badge styling for order statuses
 */
export const getOrderStatusColor = (status = 'Pending') => {
  switch (String(status).toLowerCase()) {
    case 'delivered':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'shipped':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'processing':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-stone-100 text-stone-800 border-stone-200';
  }
};

/**
 * Fallback-safe image extractor for order cards
 */
export const getFirstItemImage = (order) => {
  const items = order?.items || order?.orderItems || [];
  if (!items.length) {
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80';
  }

  const first = items[0];
  return (
    first?.image ||
    first?.thumbnail ||
    first?.product?.image ||
    first?.product?.thumbnail ||
    (first?.product?.images && first?.product?.images[0]) ||
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80'
  );
};

// Re-export orderService functions so all consumers work seamlessly
export const createOrder = (...args) => orderService.createOrder(...args);
export const getMyOrders = (...args) => orderService.getMyOrders(...args);
export const getOrderById = (...args) => orderService.getOrderById(...args);
export const getOrderByNumber = (...args) => orderService.getOrderById(...args);
export const trackOrder = (...args) => orderService.getOrderById(...args);