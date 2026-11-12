const TONE_MAP = {
  CONFIRMEE: "success",
  CONFIRME: "success",
  REFUSEE: "danger",
  NOUVELLE: "pending",
  TRAITEE: "success",
  EN_ATTENTE: "pending",
  EN_PREPARATION: "pending",
  PREPAREE: "pending",
  PRETE: "ready",
  REMIS: "success",
  LIVREE: "success",
  RETIREE: "success",
  ANNULEE: "danger",
  ANNULE: "danger",
  ARRIVEE: "success",
  NO_SHOW: "danger",
};

export default function ClientStatusBadge({ statut }) {
  const key = String(statut || "").toUpperCase();
  const tone = TONE_MAP[key] || "neutral";
  const label =
    {
      CONFIRMEE: "Confirmée",
      CONFIRME: "Confirmée",
      REFUSEE: "Refusée",
      EN_ATTENTE: "En attente",
      NOUVELLE: "En attente",
      TRAITEE: "Répondu",
      EN_PREPARATION: "En préparation",
      PREPAREE: "En préparation",
      PRETE: "Prête",
      REMIS: "Remise",
      LIVREE: "Livrée",
      RETIREE: "Retirée",
      ANNULEE: "Annulée",
      ANNULE: "Annulée",
      ARRIVEE: "Arrivée",
      NO_SHOW: "No-show",
    }[key] || statut || "—";

  return <span className={`client-badge client-badge--${tone}`}>{label}</span>;
}
