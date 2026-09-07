import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
import { AdminEmptyState, AdminErrorState, AdminTableSkeleton } from "../components/AdminStates";
import { adminOrderService } from "../../services/adminOrderService";

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminOrderService
      .getOrders({
        status: status !== "All" ? status : undefined,
        search: debouncedSearch || undefined,
        limit: 100,
      })
      .then(({ orders: fetched }) => {
        if (!cancelled) setOrders(fetched);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Couldn't load orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, debouncedSearch, retryToken]);

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nude-dark" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, or email..."
            className="w-full border border-charcoal/20 bg-ivory pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-rose"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs uppercase tracking-luxe border transition-colors ${
                status === s
                  ? "bg-charcoal text-ivory border-charcoal"
                  : "border-charcoal/20 text-charcoal-soft hover:text-charcoal"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ivory border border-charcoal/10 overflow-x-auto">
        {loading ? (
          <div className="p-5">
            <AdminTableSkeleton rows={6} cols={6} />
          </div>
        ) : error ? (
          <AdminErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
        ) : orders.length === 0 ? (
          <AdminEmptyState
            icon={ShoppingBag}
            title="No orders found"
            description="Orders placed by logged-in customers will show up here."
          />
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-5 py-3 text-charcoal font-medium">{order.orderId}</td>
                  <td className="px-5 py-3">
                    <p className="text-charcoal">{order.customer?.fullName}</p>
                    <p className="text-xs text-charcoal-soft">{order.customer?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-charcoal">₹{order.total}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.payment?.status} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-xs uppercase tracking-luxe text-rose hover:text-rose-dark"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
