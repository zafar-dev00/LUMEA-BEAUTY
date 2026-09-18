import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { usePageTitle } from "../hooks/usePageTitle";

const inputClasses =
  "w-full border border-charcoal/20 bg-ivory px-4 py-3 text-sm focus:outline-none focus:border-rose";

export default function Account() {
  usePageTitle("My Account");
  const { user, updateProfile, error, clearError } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) return null; // ProtectedRoute guarantees this page is only reached when authenticated

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const startEditing = () => {
    setForm({ name: user.name, phone: user.phone });
    setSuccess(false);
    clearError();
    setEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await updateProfile(form);
      setSuccess(true);
      setEditing(false);
    } catch {
      // error surfaced via context `error`
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-ivory">
      <div className="bg-cream py-12">
        <div className="container-luxe text-center">
          <p className="text-xs uppercase tracking-luxe text-rose mb-3">
            Your Profile
          </p>
          <h1 className="text-4xl sm:text-5xl text-charcoal">My Account</h1>
        </div>
      </div>

      <div className="container-luxe py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        <aside className="space-y-2">
          <p className="text-xs uppercase tracking-luxe text-charcoal mb-2">
            Account
          </p>
          <nav className="flex flex-col gap-3 text-sm text-charcoal-soft">
            <span className="text-charcoal">Profile</span>
            <Link to="/account/orders" className="hover:text-rose transition-colors">
              My Orders
            </Link>
            <Link to="/wishlist" className="hover:text-rose transition-colors">
              Wishlist
            </Link>
          </nav>
        </aside>

        <div className="max-w-lg">
          {success && (
            <div className="mb-6 bg-cream border border-rose/40 text-charcoal text-sm px-4 py-3">
              Profile updated successfully.
            </div>
          )}
          {error && (
            <div className="mb-6 bg-rose/10 border border-rose text-rose-dark text-sm px-4 py-3">
              {error}
            </div>
          )}

          {!editing ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-luxe text-nude-dark">Name</p>
                <p className="mt-1 text-charcoal">{user.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-luxe text-nude-dark">Email</p>
                <p className="mt-1 text-charcoal">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-luxe text-nude-dark">Phone</p>
                <p className="mt-1 text-charcoal">{user.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-luxe text-nude-dark">
                  Member Since
                </p>
                <p className="mt-1 text-charcoal">{memberSince}</p>
              </div>

              <Button variant="secondary" size="md" onClick={startEditing} className="mt-4">
                Edit Profile
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs uppercase tracking-luxe text-charcoal mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs uppercase tracking-luxe text-charcoal mb-2"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={inputClasses}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
