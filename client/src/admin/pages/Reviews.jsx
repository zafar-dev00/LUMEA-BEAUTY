import { useEffect, useState } from "react";
import { Star, Trash2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { AdminEmptyState, AdminErrorState, AdminTableSkeleton } from "../components/AdminStates";
import { adminReviewService } from "../../services/adminReviewService";
import { useToast } from "../../context/ToastContext";

const STATUS_FILTERS = ["All", "pending", "approved", "hidden"];

export default function AdminReviews() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminReviewService
      .getReviews(status !== "All" ? status : undefined)
      .then(setReviews)
      .catch((err) => setError(err.message || "Couldn't load reviews."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, retryToken]);

  const updateStatus = async (review, newStatus) => {
    try {
      const updated = await adminReviewService.updateReviewStatus(review._id, newStatus);
      setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      showToast(`Review ${newStatus}.`);
    } catch (err) {
      showToast(err.message || "Couldn't update this review.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminReviewService.deleteReview(deleteTarget._id);
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      showToast("Review deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || "Couldn't delete this review.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        subtitle={`${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-1 bg-ivory border border-charcoal/10 p-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-xs uppercase tracking-luxe capitalize transition-colors ${
                  status === s ? "bg-charcoal text-ivory" : "text-charcoal-soft hover:text-charcoal"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />

      <div className="bg-ivory border border-charcoal/10 overflow-x-auto">
        {loading ? (
          <div className="p-5">
            <AdminTableSkeleton rows={5} cols={5} />
          </div>
        ) : error ? (
          <AdminErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
        ) : reviews.length === 0 ? (
          <AdminEmptyState
            icon={Star}
            title="No reviews found"
            description="Customer reviews will appear here once the review submission flow is built."
          />
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Review</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id} className="border-b border-charcoal/5 last:border-0 align-top">
                  <td className="px-5 py-3 text-charcoal">{r.name}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{r.product?.name || "—"}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{r.rating} / 5</td>
                  <td className="px-5 py-3 text-charcoal-soft max-w-xs">
                    <p className="line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 text-charcoal-soft">
                      {r.status !== "approved" && (
                        <button
                          type="button"
                          aria-label="Approve review"
                          onClick={() => updateStatus(r, "approved")}
                          className="hover:text-rose transition-colors"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {r.status !== "hidden" ? (
                        <button
                          type="button"
                          aria-label="Hide review"
                          onClick={() => updateStatus(r, "hidden")}
                          className="hover:text-rose transition-colors"
                        >
                          <EyeOff size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label="Unhide review"
                          onClick={() => updateStatus(r, "approved")}
                          className="hover:text-rose transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Delete review"
                        onClick={() => setDeleteTarget(r)}
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
        title="Are you sure you want to delete this review?"
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
