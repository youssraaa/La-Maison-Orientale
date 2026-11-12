import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const STAFF_ROLES = new Set(["ADMIN", "AGENT"]);

/** /admin sans session → connexion unifiée ; avec session staff → dashboard. */
export default function StaffEntryRedirect() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && role && STAFF_ROLES.has(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Navigate
      to="/connexion"
      replace
      state={{ from: "/admin/dashboard" }}
    />
  );
}
