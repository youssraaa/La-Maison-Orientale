import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function staffLoginRedirect(location) {
  const from = `${location.pathname}${location.search || ""}`;
  return <Navigate to="/connexion" replace state={{ from }} />;
}

/** Réservé aux agents (gestion opérationnelle du restaurant). */
function ProtectedAgentOnlyRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return staffLoginRedirect(location);
  }

  if (role !== "AGENT") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default ProtectedAgentOnlyRoute;
