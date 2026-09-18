import { useEffect, useState } from "react";
import AdminPageHeader from "../components/AdminPageHeader";
import BarChart from "../components/BarChart";
import { AdminErrorState } from "../components/AdminStates";
import { adminDashboardService } from "../../services/adminDashboardService";

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "year", label: "This Year" },
];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function Analytics() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminDashboardService
      .getAnalytics(range)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Couldn't load analytics.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        subtitle="Revenue, orders, and customer growth over time."
        actions={
          <div className="flex items-center gap-1 bg-ivory border border-charcoal/10 p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 text-xs uppercase tracking-luxe transition-colors ${
                  range === opt.value
                    ? "bg-charcoal text-ivory"
                    : "text-charcoal-soft hover:text-charcoal"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {error && <AdminErrorState message={error} onRetry={() => setRange((r) => r)} />}

      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
            <h3 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Revenue</h3>
            {loading ? (
              <div className="h-[220px] animate-pulse bg-cream" />
            ) : (
              <BarChart data={data.series.revenue} valueFormatter={formatCurrency} />
            )}
          </div>

          <div className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
            <h3 className="text-sm uppercase tracking-luxe text-charcoal mb-4">Orders</h3>
            {loading ? (
              <div className="h-[220px] animate-pulse bg-cream" />
            ) : (
              <BarChart data={data.series.orders} />
            )}
          </div>

          <div className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
            <h3 className="text-sm uppercase tracking-luxe text-charcoal mb-4">New Customers</h3>
            {loading ? (
              <div className="h-[220px] animate-pulse bg-cream" />
            ) : (
              <BarChart data={data.series.customers} />
            )}
          </div>

          <div className="bg-ivory border border-charcoal/10 p-5 sm:p-6">
            <h3 className="text-sm uppercase tracking-luxe text-charcoal mb-4">
              Top Products by Units Sold
            </h3>
            {loading ? (
              <div className="h-[220px] animate-pulse bg-cream" />
            ) : data.topProducts.length === 0 ? (
              <p className="text-sm text-charcoal-soft py-10 text-center">
                No product sales in this period.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.topProducts.map((p) => (
                  <li key={p.name} className="flex items-center justify-between text-sm">
                    <span className="text-charcoal truncate pr-4">{p.name}</span>
                    <span className="text-charcoal-soft shrink-0">
                      {p.unitsSold} sold · {formatCurrency(p.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
