import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  Users,
  Ticket,
  Star,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col bg-charcoal text-ivory">
      <div className="px-6 py-6 border-b border-ivory/10">
        <p className="text-lg font-display tracking-luxe">LUMÉA BEAUTY</p>
        <p className="text-[10px] uppercase tracking-luxe text-nude mt-1">Admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                    isActive
                      ? "bg-ivory/10 text-rose"
                      : "text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 border-t border-ivory/10">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-ivory/70 hover:bg-ivory/5 hover:text-rose transition-colors rounded-sm"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}

export function MobileSidebarClose({ onClose }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close menu"
      className="absolute right-4 top-4 text-ivory/70 hover:text-ivory"
    >
      <X size={20} />
    </button>
  );
}
