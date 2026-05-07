import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { isRouteAllowed } from "@/lib/role";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const role = useRole();
  const { pathname } = useLocation();

  if (!role) return <Navigate to="/" replace />;
  if (!isRouteAllowed(role, pathname)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
