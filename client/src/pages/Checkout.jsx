import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../services/orderService';
import { apiRequest } from '../services/api';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    house: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    deliveryMethod: 'standard',
    paymentMethod: 'razorpay',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    const result = await applyCoupon(couponInput);
    setCouponLoading(false);

    if (result.status === 'success') {
      showToast(`Coupon ${result.code} applied!`);
      setCouponInput('');
    } else if (result.status === 'already') {
      showToast(`Coupon ${result.code} is already applied.`);
    } else if (result.status === 'invalid') {
      showToast(result.message || 'That coupon code is not valid.');
    }
  };

  const buildPayload = (paymentMethodId, paymentStatus, paymentRef = null) => {
    return {
      items: items.map((item) => ({
        product: item.id,
        id: item.id,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        qty: Number(item.qty || 1),
      })),
      customer: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },
      address: {
        house: formData.house.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      },
      delivery: {
        id: formData.deliveryMethod,
        label: formData.deliveryMethod === 'express' ? 'Express Delivery' : 'Standard Delivery',
        price: Number(shipping) || 0,
      },
      payment: {
        id: paymentMethodId,
        method: paymentMethodId === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery (COD)',
        status: paymentStatus,
        reference: paymentRef,
      },
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      tax: Number(tax) || 0,
      total: Number(total) || 0,
      couponCode: appliedCoupon?.code || null,
    };
  };

  // Automated Razorpay Gateway Flow
  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      showToast('Payment gateway script failed to load. Please refresh.');
      setLoading(false);
      return;
    }

    try {
      // 1. Backend se official Razorpay Order ID mangwayein
      const orderData = await apiRequest('/payment/order', {
        method: 'POST',
        body: { amount: total },
      });

      const razorpayOrder = orderData?.order || orderData?.paymentOrder;
      if (!razorpayOrder?.id) {
        throw new Error(orderData?.message || 'Could not initialize payment gateway.');
      }

      // 2. Razorpay Popup Configuration
      const options = {
        key: RAZORPAY_KEY || orderData?.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'LUMÉA BEAUTY',
        description: 'Order Payment',
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            setLoading(true);
            // 3. Cryptographic Signature Verification
            const verifyRes = await apiRequest('/payment/verify', {
              method: 'POST',
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyRes?.success) {
              // 4. Verification pass hone ke baad order database me save karein
              const payload = buildPayload('razorpay', 'Paid', response.razorpay_payment_id);
              const result = await createOrder(payload);
              const order = result?.order || result;
              const orderRef = order?.orderId || order?.orderNumber || order?._id;

              clearCart();
              showToast('Payment verified successfully! Order confirmed.');
              navigate(`/order-success?orderId=${encodeURIComponent(orderRef)}`);
            } else {
              showToast('Payment verification failed! Order not placed.');
            }
          } catch (err) {
            console.error('Order creation error:', err);
            showToast('Payment verified, but order creation failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#2b2622',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            showToast('Payment cancelled. Order was not placed.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Gateway Error:', err);
      showToast(err.message || 'Payment initiation failed.');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!items || items.length === 0) {
      showToast('Your cart is empty.');
      return;
    }

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.house ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      showToast('Please fill in all required shipping fields.');
      return;
    }

    setLoading(true);

    // Online Payment Option
    if (formData.paymentMethod === 'razorpay') {
      handleRazorpayPayment();
      return;
    }

    // Cash on Delivery Flow
    try {
      const payload = buildPayload('cod', 'Pending');
      const result = await createOrder(payload);
      const order = result?.order || result;
      const orderRef = order?.orderId || order?.orderNumber || order?._id || `LUMEA-${Date.now().toString(36).toUpperCase()}`;

      clearCart();
      showToast('Order placed successfully via COD!');
      navigate(`/order-success?orderId=${encodeURIComponent(orderRef)}`);
    } catch (err) {
      console.error('Order submission failed:', err);
      showToast(err?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif text-stone-900 mb-4">Your Shopping Bag is Empty</h2>
        <p className="text-stone-500 mb-8 text-sm">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="inline-block bg-stone-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">Checkout</span>
        <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mt-2">Complete Your Order</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Information */}
          <div className="bg-[#faf8f5] border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-serif text-stone-900 border-b border-stone-200 pb-3">1. Customer Information</h3>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full bg-white border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-800"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#faf8f5] border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-serif text-stone-900 border-b border-stone-200 pb-3">2. Shipping Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">House / Flat *</label>
                <input
                  type="text"
                  name="house"
                  required
                  value={formData.house}
                  onChange={handleChange}
                  placeholder="Apt 4B"
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Street / Area *</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Main Street"
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="400001"
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#faf8f5] border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-serif text-stone-900 border-b border-stone-200 pb-3">3. Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 bg-white border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={formData.paymentMethod === 'razorpay'}
                  onChange={handleChange}
                />
                <div>
                  <span className="text-sm text-stone-900 font-medium block">Online Payment (Cards, UPI, NetBanking)</span>
                  <span className="text-[11px] text-stone-500">Fast and secure automated payment with Razorpay Test Mode</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-white border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                />
                <div>
                  <span className="text-sm text-stone-900 font-medium block">Cash on Delivery (COD)</span>
                  <span className="text-[11px] text-stone-500">Pay cash upon delivery</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#faf8f5] border border-stone-200 p-6 sticky top-24 space-y-6">
            <h3 className="text-base font-serif text-stone-900 border-b border-stone-200 pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            <div className="divide-y divide-stone-200 max-h-72 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover border border-stone-200 bg-white" />
                    <div>
                      <h4 className="text-xs font-medium text-stone-900 line-clamp-1">{item.name}</h4>
                      <span className="text-[11px] text-stone-500 font-mono">Qty: {item.qty}</span>
                    </div>
                  </div>
                  <span className="text-xs font-serif font-medium text-stone-900">
                    ₹{(Number(item.price) * Number(item.qty)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs">
                  <span className="text-emerald-800 font-medium">Coupon <span className="font-mono">{appliedCoupon.code}</span> applied</span>
                  <button type="button" onClick={removeCoupon} className="text-emerald-700 underline hover:text-emerald-900">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 bg-white border border-stone-300 px-3 py-2 text-sm outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-stone-900 text-white px-4 py-2 text-xs uppercase tracking-wider hover:bg-stone-800 disabled:bg-stone-400"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-stone-200 pt-4 space-y-2 text-sm text-stone-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(subtotal).toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-₹{Number(discount).toFixed(2)}</span></div>}
              <div className="flex justify-between text-base font-serif font-semibold text-stone-900 border-t border-stone-200 pt-3">
                <span>Total</span><span>₹{Number(total).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full bg-stone-900 text-white py-3.5 text-xs uppercase tracking-widest hover:bg-stone-800 disabled:bg-stone-400 font-medium cursor-pointer"
            >
              {loading ? 'Processing Payment...' : `Place Order • ₹${Number(total).toFixed(2)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}