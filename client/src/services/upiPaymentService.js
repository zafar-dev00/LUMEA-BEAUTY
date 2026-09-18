import { apiRequest, buildQuery } from './api';

export const getUPIPayment = async (amount, orderId) => {
  const query = buildQuery({ amount, orderId });
  return apiRequest(`/payments/upi${query}`);
};

export const updateOrderPaymentStatus = async (orderId, status, transactionId = null) => {
  return apiRequest(`/orders/${orderId}/payment-status`, {
    method: 'PATCH',
    body: { status, transactionId },
  });
};

export const generateQRCodeURL = (upiString) => {
  // Use a QR code API service to generate QR code image
  // Google Charts API for QR codes
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;
};
