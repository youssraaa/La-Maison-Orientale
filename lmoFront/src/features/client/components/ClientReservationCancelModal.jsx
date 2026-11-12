import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  cancelReservation,
  fetchReservationByToken,
} from "../../reservation/api/reservationManageApi";
import ReservationCancelModal from "../../reservation/components/ReservationCancelModal";
import { formatShortDate } from "../hooks/useClientAccountData";

export default function ClientReservationCancelModal({
  open,
  reservation,
  profile,
  onClose,
  onSuccess,
}) {
  const onCloseRef = useRef(onClose);
  const onSuccessRef = useRef(onSuccess);
  onCloseRef.current = onClose;
  onSuccessRef.current = onSuccess;

  const [liveReservation, setLiveReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reservationId = reservation?.id;
  const reservationToken = reservation?.gestionToken;

  useEffect(() => {
    if (!open || !reservation) return undefined;

    setError("");
    setLiveReservation(reservation);

    if (!reservationToken) return undefined;

    let cancelled = false;
    setLoading(true);

    fetchReservationByToken(reservationToken)
      .then((data) => {
        if (cancelled) return;
        setLiveReservation(data);
        if (!data.cancellable) {
          setError("Cette réservation ne peut plus être annulée en ligne.");
        }
      })
      .catch(() => {
        if (!cancelled) setLiveReservation(reservation);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, reservationId, reservationToken]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onCloseRef.current?.();
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, busy]);

  const current = liveReservation || reservation;
  const token = current?.gestionToken || reservationToken;

  const handleConfirm = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      await cancelReservation(token);
      onSuccessRef.current?.({
        tone: "success",
        message: `Votre réservation du ${formatShortDate(current?.date)} a bien été annulée.`,
      });
      onCloseRef.current?.();
    } catch (err) {
      setError(err.message || "Impossible d'annuler cette réservation.");
    } finally {
      setBusy(false);
    }
  }, [token, current?.date]);

  if (!open || !current) return null;

  return createPortal(
    <ReservationCancelModal
      open
      busy={busy}
      loadingDetails={loading}
      error={error}
      nom={current.nomClient || profile?.nom}
      date={current.date}
      heure={current.heure}
      nbPersonnes={current.nbPersonnes}
      email={current.emailClient || profile?.email}
      onConfirm={handleConfirm}
      onCancel={() => {
        if (!busy) onCloseRef.current?.();
      }}
    />,
    document.body
  );
}
