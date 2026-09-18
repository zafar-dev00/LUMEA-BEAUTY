import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
import { AdminErrorState } from "../components/AdminStates";
import Button from "../../components/ui/Button";
import { adminCustomerService } from "../../services/adminCustomerService";
import { useToast } from "../../context/ToastContext";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function AdminCustomerDetails() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminCustomerService
      .getCustomerById(id)
      .then(setData)
      .catch((err) => setError(err.message || "Couldn't load this customer."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const toggleActive = async () => {
    if (!data) return;
    setUpdating(true);
    try {
      const updated = await adminCustomerService.setCustomerActive(id, !data.customer.isActive);
      setData((d) => ({ ...d, customer: updated }));
      showToast(`Customer ${updated.isActive ? "activated" : "deactivated"}.`);
    } catch (err) {
      showToast(err.message || "Couldn't update this customer.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Customer Details" />
        <div className="h-64 animate-pulse bg-ivory border border-charcoal/10" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <AdminPageHeader title="Customer Details" />
        <AdminErrorState message={error || "Customer not found."} onRetry={load} />
      </div>
    );
  }

  const { customer, orders, orderCount, totalSpent } = data;

  return (
    <div>
      <Link
        to="/admin/customers"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxe text-charcoal-soft hover:text-rose mb-4"
      >
        <ChevronLeft size={14} /> Back to Customers
      </Link>

      <AdminPageHeader
        title={customer.name}
        subtitle={customer.email}
        actions={
          customer.role !== "ADMIN" && (
            <Button
              variant="secondary"
              size="md"
              onClick={toggleActive}
              disabled={updating}
            >
              {customer.isActive ? "Deactivate" : "Activate"}
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
            <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Profile</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-luxe text-charcoal-soft">Phone</dt>
                <dd className="text-charcoal mt-0.5">{customer.phone}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-luxe text-charcoal-soft">Role</dt>
                <dd className="text-charcoal mt-0.5">{customer.role}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-luxe text-charcoal-soft">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={customer.isActive ? "active" : "inactive"} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-luxe text-charcoal-soft">Registered</dt>
                <dd className="text-charcoal mt-0.5">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ivory border border-charcoal/10 p-5">
              <p className="text-xs uppercase tracking-luxe text-charcoal-soft">Orders</p>
              <p className="mt-2 text-2xl text-charcoal">{orderCount}</p>
            </div>
            <div className="bg-ivory border border-charcoal/10 p-5">
              <p className="text-xs uppercase tracking-luxe text-charcoal-soft">Total Spent</p>
              <p className="mt-2 text-2xl text-charcoal">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <section className="bg-ivory border border-charcoal/10 overflow-x-auto">
            <h2 className="text-sm uppercase tracking-luxe text-charcoal p-5 sm:p-6 pb-0">
              Order History
            </h2>
            {orders.length === 0 ? (
              <p className="p-5 sm:p-6 text-sm text-charcoal-soft">No orders yet.</p>
            ) : (
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="border-t border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-charcoal/5 last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-charcoal hover:text-rose transition-colors"
                        >
                          {order.orderId}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-charcoal-soft">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-charcoal">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
