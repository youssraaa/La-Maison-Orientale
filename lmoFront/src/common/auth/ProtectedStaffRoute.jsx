import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const STAFF_ROLES = new Set(["ADMIN", "AGENT"]);

function staffLoginRedirect(location) {
  const from = `${location.pathname}${location.search || ""}`;
  return <Navigate to="/connexion" replace state={{ from }} />;
}

/** Accès espace staff (admin ou agent). */
function ProtectedStaffRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return staffLoginRedirect(location);
  }

  if (role && !STAFF_ROLES.has(role)) {
    return <Navigate to="/connexion" replace />;
  }

  return children;
}

export default ProtectedStaffRoute;
