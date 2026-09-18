import { apiRequest } from './api';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load the payment provider'));
    document.body.appendChild(script);
  });
}

export async function startRazorpayPayment({ amount, customer }) {
  await loadRazorpay();
  const { paymentOrder, keyId } = await apiRequest('/payments/order', {
    method: 'POST',
    body: { amount },
  });

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: keyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: 'LUMEA BEAUTY',
      description: 'Beauty order',
      order_id: paymentOrder.id,
      prefill: {
        name: customer.fullName,
        email: customer.email,
        contact: customer.phone,
      },
      handler: async (response) => {
        try {
          await apiRequest('/payments/verify', {
            method: 'POST',
            body: response,
          });
          resolve(response);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled')),
      },
    });

    checkout.on('payment.failed', () => reject(new Error('Payment failed')));
    checkout.open();
  });
}
