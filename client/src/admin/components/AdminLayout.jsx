import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Menu, ExternalLink } from "lucide-react";
import AdminSidebar, { MobileSidebarClose } from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function AdminLayout() {
  usePageTitle("Admin Dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="fixed top-0 left-0 h-screen w-64">
          <AdminSidebar onLogout={handleLogout} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80vw] relative">
            <MobileSidebarClose onClose={() => setDrawerOpen(false)} />
            <AdminSidebar
              onNavigate={() => setDrawerOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 lg:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-ivory border-b border-charcoal/10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden text-charcoal"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <p className="hidden lg:block text-sm uppercase tracking-luxe text-charcoal-soft">
              LUMÉA Beauty Admin
            </p>

            <div className="flex items-center gap-5 text-sm">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-charcoal-soft hover:text-rose transition-colors"
              >
                View Site
                <ExternalLink size={14} />
              </Link>
              <span className="text-charcoal-soft">
                Hi, <span className="text-charcoal font-medium">{user?.name?.split(" ")[0] || "Admin"}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
