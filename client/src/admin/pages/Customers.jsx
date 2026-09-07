import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
import { AdminEmptyState, AdminErrorState, AdminTableSkeleton } from "../components/AdminStates";
import { adminCustomerService } from "../../services/adminCustomerService";
import { useToast } from "../../context/ToastContext";

export default function AdminCustomers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminCustomerService
      .getCustomers({ search: debouncedSearch || undefined, limit: 100 })
      .then(({ customers: fetched }) => {
        if (!cancelled) setCustomers(fetched);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Couldn't load customers.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, retryToken]);

  const toggleActive = async (customer) => {
    setUpdatingId(customer._id);
    try {
      const updated = await adminCustomerService.setCustomerActive(
        customer._id,
        !customer.isActive
      );
      setCustomers((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      showToast(`Customer ${updated.isActive ? "activated" : "deactivated"}.`);
    } catch (err) {
      showToast(err.message || "Couldn't update this customer.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        subtitle={`${customers.length} customer${customers.length !== 1 ? "s" : ""}`}
      />

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nude-dark" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full border border-charcoal/20 bg-ivory pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-rose"
        />
      </div>

      <div className="bg-ivory border border-charcoal/10 overflow-x-auto">
        {loading ? (
          <div className="p-5">
            <AdminTableSkeleton rows={6} cols={6} />
          </div>
        ) : error ? (
          <AdminErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
        ) : customers.length === 0 ? (
          <AdminEmptyState icon={Users} title="No customers found" />
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-5 py-3 text-charcoal font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{c.email}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{c.phone}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{c.role}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.isActive ? "active" : "inactive"} />
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-4 text-xs uppercase tracking-luxe">
                      <Link to={`/admin/customers/${c._id}`} className="text-rose hover:text-rose-dark">
                        View
                      </Link>
                      {c.role !== "ADMIN" && (
                        <button
                          type="button"
                          onClick={() => toggleActive(c)}
                          disabled={updatingId === c._id}
                          className="text-charcoal-soft hover:text-rose transition-colors"
                        >
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
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
