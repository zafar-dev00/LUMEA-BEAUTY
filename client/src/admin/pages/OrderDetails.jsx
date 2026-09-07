import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
import { AdminErrorState } from "../components/AdminStates";
import { adminOrderService } from "../../services/adminOrderService";
import { useToast } from "../../context/ToastContext";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrderDetails() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminOrderService
      .getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err.message || "Couldn't load this order."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setUpdating(true);
    try {
      const updated = await adminOrderService.updateOrderStatus(id, status);
      setOrder(updated);
      showToast(`Order status updated to "${status}".`);
    } catch (err) {
      showToast(err.message || "Couldn't update order status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Order Details" />
        <div className="h-64 animate-pulse bg-ivory border border-charcoal/10" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <AdminPageHeader title="Order Details" />
        <AdminErrorState message={error || "Order not found."} onRetry={load} />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxe text-charcoal-soft hover:text-rose mb-4"
      >
        <ChevronLeft size={14} /> Back to Orders
      </Link>

      <AdminPageHeader
        title={order.orderId}
        subtitle={`Placed on ${new Date(order.createdAt).toLocaleString()}`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <select
              value={order.status}
              onChange={handleStatusChange}
              disabled={updating}
              className="border border-charcoal/20 bg-ivory px-3 py-2 text-sm focus:outline-none focus:border-rose"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
            <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Products</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Qty</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-charcoal/5 last:border-0">
                    <td className="py-3 flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt="" loading="lazy" className="h-10 w-10 object-cover bg-cream" />
                      )}
                      <span className="text-charcoal">{item.name}</span>
                    </td>
                    <td className="py-3 text-charcoal-soft">{item.qty}</td>
                    <td className="py-3 text-charcoal-soft">₹{item.price}</td>
                    <td className="py-3 text-charcoal">₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-charcoal/10 space-y-1.5 text-sm max-w-xs ml-auto">
              <div className="flex justify-between text-charcoal-soft">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-charcoal-soft">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-soft">
                <span>Shipping</span>
                <span>₹{order.shipping}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-charcoal-soft">
                  <span>Tax</span>
                  <span>₹{order.tax}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal font-medium pt-1.5 border-t border-charcoal/10">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
            <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Shipping</h2>
            <p className="text-sm text-charcoal">
              {order.address?.house}, {order.address?.street}
            </p>
            <p className="text-sm text-charcoal-soft">
              {order.address?.city}, {order.address?.state} - {order.address?.pincode}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          {/* Customer */}
          <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
            <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Customer</h2>
            <p className="text-sm text-charcoal">{order.customer?.fullName}</p>
            <p className="text-sm text-charcoal-soft">{order.customer?.email}</p>
            <p className="text-sm text-charcoal-soft">{order.customer?.phone}</p>
          </section>

          {/* Payment */}
          <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
            <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Payment</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal-soft">Method</span>
              <span className="text-charcoal capitalize">{order.payment?.method}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-charcoal-soft">Status</span>
              <StatusBadge status={order.payment?.status} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
