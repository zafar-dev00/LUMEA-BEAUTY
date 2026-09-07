import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { AdminEmptyState, AdminErrorState, AdminTableSkeleton } from "../components/AdminStates";
import Button from "../../components/ui/Button";
import { adminCategoryService } from "../../services/adminCategoryService";
import { useToast } from "../../context/ToastContext";

const inputClasses =
  "w-full border border-charcoal/20 bg-ivory px-3 py-2 text-sm focus:outline-none focus:border-rose";
const labelClasses = "block text-xs uppercase tracking-luxe text-charcoal mb-1.5";

const EMPTY_FORM = { name: "", image: "", description: "" };

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // category being edited, or null for "new"
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminCategoryService
      .getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message || "Couldn't load categories."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [retryToken]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, image: cat.image || "", description: cat.description || "" });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Category name is required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        const updated = await adminCategoryService.updateCategory(editing._id, form);
        setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        showToast("Category updated successfully.");
      } else {
        const created = await adminCategoryService.createCategory(form);
        setCategories((prev) => [created, ...prev]);
        showToast("Category created successfully.");
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Something went wrong saving this category.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (cat) => {
    try {
      const updated = await adminCategoryService.updateCategory(cat._id, {
        isActive: !cat.isActive,
      });
      setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      showToast(`Category ${updated.isActive ? "activated" : "deactivated"}.`);
    } catch (err) {
      showToast(err.message || "Couldn't update this category.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminCategoryService.deleteCategory(deleteTarget._id);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      showToast("Category deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || "Couldn't delete this category.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle={`${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`}
        actions={
          <Button variant="primary" size="md" onClick={openNew}>
            <Plus size={16} />
            Add Category
          </Button>
        }
      />

      <div className="bg-ivory border border-charcoal/10 overflow-x-auto">
        {loading ? (
          <div className="p-5">
            <AdminTableSkeleton rows={5} cols={4} />
          </div>
        ) : error ? (
          <AdminErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />
        ) : categories.length === 0 ? (
          <AdminEmptyState
            icon={Tags}
            title="No categories yet"
            description="Add your first category to get started."
            action={
              <Button variant="primary" size="md" onClick={openNew}>
                Add Category
              </Button>
            }
          />
        ) : (
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-luxe text-charcoal-soft">
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {cat.image && (
                        <img src={cat.image} alt="" loading="lazy" className="h-9 w-9 rounded-full object-cover bg-cream" />
                      )}
                      <span className="text-charcoal font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={cat.isActive ? "active" : "inactive"} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-4 text-charcoal-soft">
                      <button
                        type="button"
                        onClick={() => toggleActive(cat)}
                        className="text-xs uppercase tracking-luxe hover:text-rose transition-colors"
                      >
                        {cat.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        aria-label="Edit category"
                        onClick={() => openEdit(cat)}
                        className="hover:text-rose transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete category"
                        onClick={() => setDeleteTarget(cat)}
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

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-charcoal/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-ivory w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg text-charcoal font-medium mb-5">
              {editing ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {formError && (
                <div className="bg-rose/10 border border-rose text-rose-dark text-sm px-3 py-2">
                  {formError}
                </div>
              )}
              <div>
                <label htmlFor="cat-name" className={labelClasses}>Name</label>
                <input
                  id="cat-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="cat-image" className={labelClasses}>Image URL</label>
                <input
                  id="cat-image"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className={inputClasses}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label htmlFor="cat-description" className={labelClasses}>Description</label>
                <textarea
                  id="cat-description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className={inputClasses}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" size="md" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? "Saving..." : editing ? "Save Changes" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Are you sure you want to delete this category?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed.` : ""}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
