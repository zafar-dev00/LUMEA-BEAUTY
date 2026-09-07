import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye, Package } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { AdminEmptyState, AdminErrorState, AdminTableSkeleton } from "../components/AdminStates";
import Button from "../../components/ui/Button";
import { adminProductService } from "../../services/adminProductService";
import { adminDashboardService } from "../../services/adminDashboardService";
import { useToast } from "../../context/ToastContext";

function stockStatus(stock, threshold) {
  if (stock <= 0) return "Out of Stock";
  if (stock <= threshold) return "Low Stock";
  return "In Stock";
}

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    adminDashboardService
      .getStats()
      .then((stats) => setThreshold(stats.lowStockThreshold ?? 10))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminProductService
      .getProducts({ search: debouncedSearch || undefined, limit: 100 })
      .then(({ products: fetched }) => {
        if (!cancelled) setProducts(fetched);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Couldn't load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, retryToken]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminProductService.deleteProduct(deleteTarget._id);
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      showToast("Product deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || "Couldn't delete this product.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle={`${products.length} product${products.length !== 1 ? "s" : ""}`}
        actions={
          <Button as={Link} to="/admin/products/new" variant="primary" size="md">
            <Plus size={16} />
            Add Product
          </Button>
        }
      />

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nude-dark" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full border border-charcoal/20 bg-ivory pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-rose"
        />
      </div>

      <div className="bg-ivory border border-charcoal/10 overflow-x-auto">
        {loading ? (
          <div className="p-5">
            <AdminTableSkeleton rows={6} cols={7} />
          </div>
        ) : error ? (
          <AdminErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
        ) : products.length === 0 ? (
          <AdminEmptyState
            icon={Package}
            title="No products found"
            description={search ? "Try a different search." : "Add your first product to get started."}
            action={
              !search && (
                <Button as={Link} to="/admin/products/new" variant="primary" size="md">
                  Add Product
                </Button>
              )
            }
          />
        ) : (
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-5 py-3">
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      loading="lazy"
                      className="h-12 w-12 object-cover bg-cream"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-charcoal font-medium">{p.name}</p>
                    <p className="text-xs text-charcoal-soft">{p.brand}</p>
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft">{p.category}</td>
                  <td className="px-5 py-3 text-charcoal">₹{p.price}</td>
                  <td className="px-5 py-3 text-charcoal">{p.stock}</td>
                  <td className="px-5 py-3 text-charcoal-soft">
                    {p.rating ? p.rating.toFixed(1) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={stockStatus(p.stock, threshold)} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 text-charcoal-soft">
                      <Link
                        to={`/product/${p._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View on site"
                        className="hover:text-rose transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/admin/products/${p._id}/edit`}
                        aria-label="Edit product"
                        className="hover:text-rose transition-colors"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        aria-label="Delete product"
                        onClick={() => setDeleteTarget(p)}
                        className="hover:text-rose-dark transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Are you sure you want to delete this product?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed.` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
