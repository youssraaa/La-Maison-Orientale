export function reservationRef(reservation) {
  if (!reservation) return "";
  return reservation.gestionToken || String(reservation.id || "");
}

export function commandeRef(commande) {
  if (!commande) return "";
  return commande.gestionToken || String(commande.id || "");
}

export function reservationDetailPath(reservation) {
  const ref = reservationRef(reservation);
  return ref ? `/mon-compte/reservations/${encodeURIComponent(ref)}` : "/mon-compte/reservations";
}

export function commandeDetailPath(commande) {
  const ref = commandeRef(commande);
  return ref ? `/mon-compte/commandes/${encodeURIComponent(ref)}` : "/mon-compte/commandes";
}

export function findReservationByRef(reservations, ref) {
  if (!ref || !Array.isArray(reservations)) return null;
  const decoded = decodeURIComponent(ref);
  return (
    reservations.find(
      (item) => item.gestionToken === decoded || String(item.id) === decoded
    ) ?? null
  );
}

export function findCommandeByRef(commandes, ref) {
  if (!ref || !Array.isArray(commandes)) return null;
  const decoded = decodeURIComponent(ref);
  return (
    commandes.find(
      (item) => item.gestionToken === decoded || String(item.id) === decoded
    ) ?? null
  );
}
