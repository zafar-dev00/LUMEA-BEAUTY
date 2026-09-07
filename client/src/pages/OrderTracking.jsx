import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const params = useParams();

  const queryCode =
    params?.orderId ||
    searchParams.get('orderId') ||
    searchParams.get('orderNumber') ||
    searchParams.get('id') ||
    '';

  const [inputVal, setInputVal] = useState(queryCode);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const lookupOrder = async (targetId) => {
    if (!targetId) return;
    setLoading(true);
    setSearched(true);

    try {
      const data = await getOrderById(targetId);
      setOrder(data && (data._id || data.orderNumber || data.items) ? data : null);
    } catch (err) {
      console.error('Tracking fetch failed:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryCode) {
      setInputVal(queryCode);
      lookupOrder(queryCode);
    }
  }, [queryCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      lookupOrder(inputVal.trim());
    }
  };

  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const status = order?.orderStatus || order?.status || 'Processing';
  const activeIdx = steps.findIndex(
    (s) => s.toLowerCase() === status.toLowerCase()
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">
          Order Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mt-2">
          Track Your Package
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto flex gap-2 mb-12"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="e.g. LUMEA-MT1GSXTK3D90"
          className="flex-1 bg-[#faf8f5] border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-stone-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-stone-900 text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {loading && (
        <div className="py-12 text-center">
          <p className="text-stone-500 text-sm">Locating package details...</p>
        </div>
      )}

      {!loading && searched && !order && (
        <div className="text-center py-10 bg-stone-50 border border-stone-200 mb-8">
          <p className="text-rose-600 text-sm font-medium">
            Order not found. Please verify your reference number.
          </p>
        </div>
      )}

      {order && (
        <div className="bg-[#faf8f5] border border-stone-200 p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider font-mono">
                Order Reference
              </span>
              <h2 className="text-lg font-mono font-bold text-stone-900 mt-0.5">
                {order.orderNumber || order._id}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-stone-500 uppercase tracking-wider">Total</span>
              <p className="text-xl font-serif font-semibold text-stone-900">
                ${Number(order.totalAmount || order.totalPrice || order.total || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Steps */}
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium block mb-4">
              Status Progression
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {steps.map((step, idx) => {
                const isPassed = activeIdx >= idx || (activeIdx === -1 && idx === 0);
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-full h-1.5 mb-2 rounded-full ${
                        isPassed ? 'bg-stone-900' : 'bg-stone-200'
                      }`}
                    />
                    <span className={`font-medium ${isPassed ? 'text-stone-900' : 'text-stone-400'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div>
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium block mb-4">
              Items
            </span>
            <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
              {(order.items || order.orderItems || []).map((item, index) => {
                const imgSrc =
                  item?.image ||
                  item?.thumbnail ||
                  item?.product?.image ||
                  item?.product?.thumbnail ||
                  (item?.product?.images && item.product.images[0]) ||
                  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80';

                return (
                  <div key={index} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white border border-stone-200 flex-shrink-0 overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={item?.name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-stone-900">
                          {item?.name || item?.product?.name || 'Beauty Product'}
                        </h4>
                        <span className="text-xs text-stone-500 font-mono">
                          Qty: {item?.quantity || item?.qty || 1}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-serif font-medium text-stone-900">
                      ${Number((item?.price || 0) * (item?.quantity || item?.qty || 1)).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div className="flex justify-between items-center pt-4">
            <Link
              to="/account/orders"
              className="text-xs uppercase tracking-wider font-semibold text-stone-800 underline hover:text-stone-600"
            >
              ← Back to All Orders
            </Link>
            <Link
              to="/shop"
              className="bg-stone-900 text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}