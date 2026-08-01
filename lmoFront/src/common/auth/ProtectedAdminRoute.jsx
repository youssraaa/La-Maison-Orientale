import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  if (role && role !== "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
