import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, TicketPercent } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { AdminEmptyState, AdminErrorState, AdminTableSkeleton } from "../components/AdminStates";
import Button from "../../components/ui/Button";
import { adminCouponService } from "../../services/adminCouponService";
import { useToast } from "../../context/ToastContext";

const inputClasses =
  "w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm focus:outline-none focus:border-rose";
const labelClasses = "block text-xs uppercase tracking-luxe text-charcoal mb-1.5";

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const EMPTY_FORM = {
  code: "",
  discountPercentage: "",
  minOrder: "",
  maxDiscount: "",
  startDate: todayPlus(0),
  expiryDate: todayPlus(30),
  usageLimit: "",
  isActive: true,
};

function couponToForm(c) {
  return {
    code: c.code,
    discountPercentage: c.discountPercentage,
    minOrder: c.minOrder || "",
    maxDiscount: c.maxDiscount ?? "",
    startDate: c.startDate ? c.startDate.slice(0, 10) : todayPlus(0),
    expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : todayPlus(30),
    usageLimit: c.usageLimit ?? "",
    isActive: c.isActive,
  };
}

function formToPayload(form) {
  return {
    code: form.code.trim().toUpperCase(),
    discountPercentage: Number(form.discountPercentage),
    minOrder: form.minOrder ? Number(form.minOrder) : 0,
    maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
    startDate: form.startDate,
    expiryDate: form.expiryDate,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    isActive: form.isActive,
  };
}

function validate(form) {
  const errors = {};
  if (!form.code.trim()) errors.code = "Coupon code is required";
  if (!form.discountPercentage || Number(form.discountPercentage) <= 0 || Number(form.discountPercentage) > 100)
    errors.discountPercentage = "Enter a percentage between 1 and 100";
  if (!form.expiryDate) errors.expiryDate = "Expiry date is required";
  if (form.startDate && form.expiryDate && form.expiryDate <= form.startDate)
    errors.expiryDate = "Expiry date must be after the start date";
  return errors;
}

export default function AdminCoupons() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminCouponService
      .getCoupons()
      .then(setCoupons)
      .catch((err) => setError(err.message || "Couldn't load coupons."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [retryToken]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm(couponToForm(coupon));
    setErrors({});
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const payload = formToPayload(form);
      if (editing) {
        const updated = await adminCouponService.updateCoupon(editing._id, payload);
        setCoupons((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        showToast("Coupon updated successfully.");
      } else {
        const created = await adminCouponService.createCoupon(payload);
        setCoupons((prev) => [created, ...prev]);
        showToast("Coupon created successfully.");
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Something went wrong saving this coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      const updated = await adminCouponService.updateCoupon(coupon._id, {
        isActive: !coupon.isActive,
      });
      setCoupons((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      showToast(`Coupon ${updated.isActive ? "activated" : "deactivated"}.`);
    } catch (err) {
      showToast(err.message || "Couldn't update this coupon.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminCouponService.deleteCoupon(deleteTarget._id);
      setCoupons((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      showToast("Coupon deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || "Couldn't delete this coupon.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        subtitle={`${coupons.length} coupon${coupons.length !== 1 ? "s" : ""}`}
        actions={
          <Button variant="primary" size="md" onClick={openNew}>
            <Plus size={16} />
            Add Coupon
          </Button>
        }
      />

      <div className="bg-ivory border border-charcoal/10 overflow-x-auto">
        {loading ? (
          <div className="p-5">
            <AdminTableSkeleton rows={5} cols={6} />
          </div>
        ) : error ? (
          <AdminErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
        ) : coupons.length === 0 ? (
          <AdminEmptyState
            icon={TicketPercent}
            title="No coupons yet"
            description='Create your first coupon, e.g. "LUMEA10" or "GLOW20".'
            action={
              <Button variant="primary" size="md" onClick={openNew}>
                Add Coupon
              </Button>
            }
          />
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Min Order</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3">Usage</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-5 py-3 text-charcoal font-medium">{c.code}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{c.discountPercentage}%</td>
                  <td className="px-5 py-3 text-charcoal-soft">₹{c.minOrder || 0}</td>
                  <td className="px-5 py-3 text-charcoal-soft">
                    {new Date(c.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft">
                    {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.isActive ? "active" : "inactive"} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 text-charcoal-soft">
                      <button
                        type="button"
                        onClick={() => toggleActive(c)}
                        className="text-xs uppercase tracking-luxe hover:text-rose transition-colors"
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        aria-label="Edit coupon"
                        onClick={() => openEdit(c)}
                        className="hover:text-rose transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete coupon"
                        onClick={() => setDeleteTarget(c)}
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

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="absolute inset-0 bg-charcoal/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-ivory w-full max-w-lg p-6 shadow-xl my-auto">
            <h2 className="text-lg text-charcoal font-medium mb-5">
              {editing ? "Edit Coupon" : "Add Coupon"}
            </h2>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {formError && (
                <div className="bg-rose/10 border border-rose text-rose-dark text-sm px-3 py-2">
                  {formError}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="coupon-code" className={labelClasses}>Code</label>
                  <input
                    id="coupon-code"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    className={inputClasses}
                    placeholder="LUMEA10"
                  />
                  {errors.code && <p className="mt-1 text-xs text-rose-dark">{errors.code}</p>}
                </div>
                <div>
                  <label htmlFor="coupon-discountPercentage" className={labelClasses}>Discount %</label>
                  <input
                    id="coupon-discountPercentage"
                    type="number"
                    min="1"
                    max="100"
                    value={form.discountPercentage}
                    onChange={(e) => setForm((f) => ({ ...f, discountPercentage: e.target.value }))}
                    className={inputClasses}
                  />
                  {errors.discountPercentage && (
                    <p className="mt-1 text-xs text-rose-dark">{errors.discountPercentage}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="coupon-minOrder" className={labelClasses}>Minimum Order (₹)</label>
                  <input
                    id="coupon-minOrder"
                    type="number"
                    min="0"
                    value={form.minOrder}
                    onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="coupon-maxDiscount" className={labelClasses}>Maximum Discount (₹)</label>
                  <input
                    id="coupon-maxDiscount"
                    type="number"
                    min="0"
                    value={form.maxDiscount}
                    onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                    className={inputClasses}
                    placeholder="No cap"
                  />
                </div>
                <div>
                  <label htmlFor="coupon-startDate" className={labelClasses}>Start Date</label>
                  <input
                    id="coupon-startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="coupon-expiryDate" className={labelClasses}>Expiry Date</label>
                  <input
                    id="coupon-expiryDate"
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className={inputClasses}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-xs text-rose-dark">{errors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="coupon-usageLimit" className={labelClasses}>Usage Limit</label>
                  <input
                    id="coupon-usageLimit"
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                    className={inputClasses}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 text-sm text-charcoal-soft cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="h-4 w-4 accent-rose"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" size="md" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? "Saving..." : editing ? "Save Changes" : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Are you sure you want to delete this coupon?"
        message={deleteTarget ? `"${deleteTarget.code}" will be permanently removed.` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
