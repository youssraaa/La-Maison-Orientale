import { Navigate, useLocation } from "react-router-dom";
import { useClientAuth } from "./ClientAuthContext";

function ProtectedClientRoute({ children }) {
  const { isClientAuthenticated } = useClientAuth();
  const location = useLocation();

  if (!isClientAuthenticated) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedClientRoute;
