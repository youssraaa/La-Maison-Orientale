import { Navigate, useParams } from "react-router-dom";

/** Ancienne URL — redirige vers la page de confirmation. */
function CommandeManagePage() {
  const { token } = useParams();
  return <Navigate to={`/commande/confirmation/${token}`} replace />;
}

export default CommandeManagePage;
