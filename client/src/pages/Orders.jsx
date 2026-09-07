import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await getMyOrders();
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500 tracking-wider text-sm">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">
          ORDER HISTORY
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mt-2">
          My Orders
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-[#faf8f5] border border-stone-200">
          <p className="text-stone-600 mb-6 font-serif">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-stone-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const orderCode =
              order?.orderNumber ||
              order?.orderId ||
              order?._id ||
              `ORDER-${index + 1}`;

            const items = Array.isArray(order?.items)
              ? order.items
              : Array.isArray(order?.orderItems)
              ? order.orderItems
              : [];

            const total = Number(
              order?.totalAmount || order?.totalPrice || order?.total || 0
            ).toFixed(2);
            const status = order?.orderStatus || order?.status || 'Processing';

            return (
              <div
                key={order?._id || orderCode}
                className="bg-[#faf8f5] border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-400 transition-colors"
              >
                {/* Left: Mini Images + Order Reference */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {items.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {items.map((item, idx) => {
                        const imgSrc =
                          item?.image ||
                          item?.thumbnail ||
                          item?.product?.image ||
                          item?.product?.thumbnail ||
                          (item?.product?.images && item.product.images[0]) ||
                          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80';

                        return (
                          <div
                            key={idx}
                            className="relative w-12 h-12 min-w-[3rem] bg-white border border-stone-200 overflow-hidden flex-shrink-0"
                          >
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
                            {(item?.quantity > 1 || item?.qty > 1) && (
                              <span className="absolute bottom-0 right-0 bg-stone-900 text-white text-[9px] px-1 font-mono">
                                ×{item?.quantity || item?.qty}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <h3 className="font-mono text-sm text-stone-900 font-semibold tracking-wide">
                      {orderCode}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs capitalize font-medium text-stone-700">
                        {status}
                      </span>
                      {order?.createdAt && (
                        <span className="text-xs text-stone-500">
                          • {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Total Price & Tracking Link */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                  <span className="text-lg font-serif text-stone-900 font-semibold">
                    ${total}
                  </span>
                  <Link
                    to={`/track-order?orderId=${encodeURIComponent(orderCode)}`}
                    className="text-xs uppercase tracking-wider font-medium text-stone-900 underline hover:text-stone-600"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}