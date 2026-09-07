import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Frontend-side gate for /admin/*. This is a UX convenience only — the real
 * boundary is enforced server-side (every /api/admin/* route requires a
 * valid JWT + role === 'ADMIN', checked against the DB user record, see
 * server/middleware/authMiddleware.js `adminOnly`). Even if this component
 * were bypassed, admin API calls would still fail with 401/403.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory text-charcoal-soft text-sm uppercase tracking-luxe">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectTarget = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/?forbidden=1" replace />;
  }

  return children;
}
