import { useEffect, useState } from "react";
import AdminPageHeader from "../components/AdminPageHeader";
import { useAuth } from "../../context/AuthContext";
import { adminDashboardService } from "../../services/adminDashboardService";

export default function AdminSettings() {
  const { user } = useAuth();
  const [threshold, setThreshold] = useState(null);

  useEffect(() => {
    adminDashboardService
      .getStats()
      .then((stats) => setThreshold(stats.lowStockThreshold))
      .catch(() => {});
  }, []);

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Store configuration and admin account info." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
        <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
          <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Inventory</h2>
          <p className="text-sm text-charcoal-soft">
            Products at or below this stock count are flagged "Low Stock" across the dashboard.
          </p>
          <p className="mt-3 text-2xl text-charcoal">
            {threshold ?? "—"} <span className="text-sm text-charcoal-soft">units</span>
          </p>
          <p className="mt-2 text-xs text-charcoal-soft">
            Set via the <code className="bg-cream px-1">LOW_STOCK_THRESHOLD</code> environment
            variable on the server.
          </p>
        </section>

        <section className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
          <h2 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Your Admin Account</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-luxe text-charcoal-soft">Name</dt>
              <dd className="text-charcoal mt-0.5">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-luxe text-charcoal-soft">Email</dt>
              <dd className="text-charcoal mt-0.5">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-luxe text-charcoal-soft">Role</dt>
              <dd className="text-charcoal mt-0.5">{user?.role}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
