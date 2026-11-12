import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function staffLoginRedirect(location) {
  const from = `${location.pathname}${location.search || ""}`;
  return <Navigate to="/connexion" replace state={{ from }} />;
}

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return staffLoginRedirect(location);
  }

  if (role && role !== "ADMIN") {
    return <Navigate to="/connexion" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
