import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  Clock,
  AlertTriangle,
} from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatCard from "../components/StatCard";
import { AdminErrorState } from "../components/AdminStates";
import { adminDashboardService } from "../../services/adminDashboardService";
import { adminProductService } from "../../services/adminProductService";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      adminDashboardService.getStats(),
      adminProductService.getProducts({ limit: 100 }),
    ])
      .then(([statsData, { products }]) => {
        if (cancelled) return;
        setStats(statsData);
        setLowStock(
          products
            .filter((p) => p.stock <= (statsData.lowStockThreshold ?? 10))
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 8)
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Couldn't load dashboard data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div>
        <AdminPageHeader title="Dashboard" />
        <AdminErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="A snapshot of how the store is doing right now."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Revenue"
          icon={IndianRupee}
          value={loading ? "—" : formatCurrency(stats.totalRevenue)}
        />
        <StatCard
          label="Total Orders"
          icon={ShoppingBag}
          value={loading ? "—" : stats.totalOrders}
        />
        <StatCard
          label="Total Customers"
          icon={Users}
          value={loading ? "—" : stats.totalCustomers}
        />
        <StatCard
          label="Total Products"
          icon={Package}
          value={loading ? "—" : stats.totalProducts}
        />
        <StatCard
          label="Pending Orders"
          icon={Clock}
          value={loading ? "—" : stats.pendingOrders}
          tone={!loading && stats.pendingOrders > 0 ? "accent" : "default"}
        />
        <StatCard
          label="Low Stock Products"
          icon={AlertTriangle}
          value={loading ? "—" : stats.lowStockProducts}
          tone={!loading && stats.lowStockProducts > 0 ? "warning" : "default"}
          hint={!loading ? `Threshold: ${stats.lowStockThreshold} units` : undefined}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-charcoal">Low Stock Products</h2>
          <Link to="/admin/products" className="text-xs uppercase tracking-luxe text-rose hover:text-rose-dark">
            View All Products
          </Link>
        </div>

        <div className="bg-ivory border border-charcoal/10 overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-charcoal-soft">Loading...</div>
          ) : lowStock.length === 0 ? (
            <div className="p-6 text-sm text-charcoal-soft">
              No products are currently low on stock.
            </div>
          ) : (
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p._id} className="border-b border-charcoal/5 last:border-0">
                    <td className="px-5 py-3">
                      <Link to={`/admin/products/${p._id}/edit`} className="hover:text-rose transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-charcoal-soft">{p.category}</td>
                    <td className="px-5 py-3">
                      <span className={p.stock === 0 ? "text-rose-dark font-medium" : "text-charcoal"}>
                        {p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
