import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function staffLoginRedirect(location) {
  const from = `${location.pathname}${location.search || ""}`;
  return <Navigate to="/connexion" replace state={{ from }} />;
}

/** Réservé à l'administrateur (gestion des agents, etc.). */
function ProtectedAdminOnlyRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return staffLoginRedirect(location);
  }

  if (role !== "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default ProtectedAdminOnlyRoute;
