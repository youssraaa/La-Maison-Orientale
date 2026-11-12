import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  cancelReservation,
  fetchManageAvailability,
  fetchReservationByToken,
  modifyReservation,
} from "../../reservation/api/reservationManageApi";
import ReservationCancelModal from "../../reservation/components/ReservationCancelModal";
import useReservationPolicy from "../../reservation/hooks/useReservationPolicy";
import {
  hasValidationErrors,
  validateModifyReservationForm,
} from "../../reservation/utils/validateReservationForm";
import {
  getFormBannerMessage,
  mergeApiError,
} from "../../../common/utils/formErrors";
import { formatShortDate, isUpcomingReservation } from "../hooks/useClientAccountData";

function formatHeureLabel(heure) {
  const value = String(heure || "").slice(0, 5);
  if (!value) return "—";
  return value.replace(":", "h");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function buildFormFromReservation(reservation) {
  return {
    date: reservation?.date || "",
    heure: String(reservation?.heure || "").slice(0, 5),
    nbPersonnes: String(reservation?.nbPersonnes || "2"),
    commentaire: reservation?.commentaire || "",
  };
}

export default function ClientReservationModifyModal({
  open,
  reservation,
  profile,
  onClose,
  onSuccess,
}) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onSuccessRef = useRef(onSuccess);
  onCloseRef.current = onClose;
  onSuccessRef.current = onSuccess;

  const { policy } = useReservationPolicy();
  const maxOnlineCovers = policy.maxOnlineCovers;

  const [liveReservation, setLiveReservation] = useState(() => reservation || null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => buildFormFromReservation(reservation));
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [cancelOpen, setCancelOpen] = useState(false);

  const reservationId = reservation?.id;
  const reservationToken = reservation?.gestionToken;
  const token = liveReservation?.gestionToken || reservationToken;
  const current = liveReservation || reservation;

  useLayoutEffect(() => {
    if (!open || !reservation) return;

    setError("");
    setFieldErrors({});
    setCancelOpen(false);
    setLiveReservation(reservation);
    setForm(buildFormFromReservation(reservation));
  }, [open, reservationId, reservationToken, reservation]);

  useEffect(() => {
    if (!open || !reservationToken) return undefined;

    let cancelled = false;
    setLoading(true);

    fetchReservationByToken(reservationToken)
      .then((data) => {
        if (cancelled) return;
        setLiveReservation(data);
        setForm(buildFormFromReservation(data));
        if (!data.modifiable) {
          setError("Cette réservation ne peut plus être modifiée en ligne.");
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
  }, [open, reservationId, reservationToken, reservation]);

  useEffect(() => {
    const editable = liveReservation?.modifiable ?? reservation?.modifiable ?? true;
    if (!open || !token || !editable) return undefined;
    if (!form.date) return undefined;

    let cancelled = false;
    setSlotsLoading(true);

    fetchManageAvailability(token, form.date, Number(form.nbPersonnes) || 2)
      .then((data) => {
        if (cancelled) return;
        const nextSlots = data.closed ? [] : data.slots || [];
        setSlots(nextSlots);
        setForm((prev) => {
          const preferredHeure =
            prev.heure || String(current?.heure || reservation?.heure || "").slice(0, 5);
          if (!preferredHeure) return prev;
          const selected = nextSlots.find((slot) => slot.time === preferredHeure);
          if (selected?.available) {
            return prev.heure === preferredHeure ? prev : { ...prev, heure: preferredHeure };
          }
          if (prev.heure && !selected?.available) {
            return { ...prev, heure: "" };
          }
          return prev;
        });
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, token, form.date, form.nbPersonnes, liveReservation?.modifiable, reservation?.modifiable]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape" && !busy && !cancelOpen) onCloseRef.current?.();
    };

    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, busy, cancelOpen]);

  const isCancelled = ["ANNULEE", "ANNULE"].includes(String(current?.statut || "").toUpperCase());
  const upcoming = current ? isUpcomingReservation(current) : false;
  const canCancel = Boolean(current?.cancellable && token && !isCancelled && upcoming);
  const availableSlots = useMemo(() => slots.filter((slot) => slot.available), [slots]);

  const handleModify = useCallback(
    async (event) => {
      event.preventDefault();
      if (!token || !current) return;

      setError("");
      setFieldErrors({});

      const maxNb =
        Number(current.nbPersonnes) > maxOnlineCovers ? Number(current.nbPersonnes) : null;
      const clientErrors = validateModifyReservationForm(form, maxOnlineCovers, maxNb);

      if (!form.heure) {
        clientErrors.heure = clientErrors.heure || "Choisissez un créneau disponible.";
      } else {
        const selected = slots.find((slot) => slot.time === form.heure);
        if (!selected?.available) {
          clientErrors.heure = "Ce créneau n'est plus disponible. Choisissez un autre horaire.";
        }
      }

      if (hasValidationErrors(clientErrors)) {
        setFieldErrors(clientErrors);
        setError(getFormBannerMessage(clientErrors));
        return;
      }

      setBusy(true);
      try {
        const updated = await modifyReservation(token, {
          date: form.date,
          heure: form.heure,
          nbPersonnes: Number(form.nbPersonnes),
          commentaire: form.commentaire.trim() || null,
        });
        onSuccessRef.current?.({
          tone: "success",
          message: `Votre réservation du ${formatShortDate(updated.date)} a bien été modifiée.`,
        });
        onCloseRef.current?.();
      } catch (err) {
        const mapped = mergeApiError(err);
        setFieldErrors(mapped);
        setError(getFormBannerMessage(mapped, err.message || "Modification impossible."));
      } finally {
        setBusy(false);
      }
    },
    [token, current, form, slots, maxOnlineCovers]
  );

  const handleCancelConfirm = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    try {
      await cancelReservation(token);
      setCancelOpen(false);
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
    <>
      <div
        className="client-res-modal__overlay"
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget && !busy && !cancelOpen) onCloseRef.current?.();
        }}
      >
        <div
          className="client-res-modal client-res-modal--edit"
          role="dialog"
          aria-modal="true"
          aria-labelledby="client-res-modify-title"
        >
          <header className="client-res-modal__head">
            <div>
              <p className="client-res-modal__kicker">Réservation à venir</p>
              <h2 id="client-res-modify-title">Modifier la réservation</h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="client-res-modal__close"
              aria-label="Fermer"
              onClick={() => onCloseRef.current?.()}
              disabled={busy}
            >
              ×
            </button>
          </header>

          <div className="client-res-modal__body">
            {error ? (
              <p className="client-res-modal__error" role="alert">
                {error}
              </p>
            ) : null}

            <form className="client-res-modal__form" onSubmit={handleModify} noValidate>
              <p className="client-res-modal__form-lead">
                Réf. #{current.id || "—"} · {formatShortDate(current.date)} ·{" "}
                {formatHeureLabel(current.heure)}
                {loading ? " · Mise à jour…" : ""}
              </p>
              <p className="client-res-modal__form-hint">
                Modifiez la date, l&apos;heure ou le nombre de convives de votre table.
              </p>

              <div className="client-res-modal__form-grid">
                <label className={fieldErrors.date ? "is-invalid" : ""}>
                  <span>Date</span>
                  <input
                    type="date"
                    min={todayIso()}
                    value={form.date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, date: e.target.value, heure: "" }))
                    }
                    required
                  />
                  {fieldErrors.date ? <em>{fieldErrors.date}</em> : null}
                </label>

                <label className={fieldErrors.nbPersonnes ? "is-invalid" : ""}>
                  <span>Couverts</span>
                  <input
                    type="number"
                    min={1}
                    max={
                      Number(current.nbPersonnes) > maxOnlineCovers
                        ? Number(current.nbPersonnes)
                        : maxOnlineCovers
                    }
                    value={form.nbPersonnes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, nbPersonnes: e.target.value, heure: "" }))
                    }
                    required
                  />
                  {fieldErrors.nbPersonnes ? <em>{fieldErrors.nbPersonnes}</em> : null}
                </label>
              </div>

              <div className="client-res-modal__slots">
                <p className="client-res-modal__slots-label">
                  Créneau <span aria-hidden="true">*</span>
                </p>

                {slotsLoading && availableSlots.length === 0 ? (
                  <p className="client-res-modal__slots-hint">Chargement des horaires…</p>
                ) : null}

                {!slotsLoading && form.date && availableSlots.length === 0 ? (
                  <p className="client-res-modal__slots-empty">
                    Aucun créneau disponible pour cette date.
                  </p>
                ) : null}

                {availableSlots.length > 0 ? (
                  <div className="client-res-modal__slot-list" role="listbox" aria-label="Créneaux">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        role="option"
                        aria-selected={form.heure === slot.time}
                        className={`client-res-modal__slot${
                          form.heure === slot.time ? " is-selected" : ""
                        }`}
                        onClick={() => setForm((prev) => ({ ...prev, heure: slot.time }))}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : null}
                {fieldErrors.heure ? (
                  <em className="client-res-modal__field-error">{fieldErrors.heure}</em>
                ) : null}
              </div>

              <label className={fieldErrors.commentaire ? "is-invalid" : ""}>
                <span>Commentaire (optionnel)</span>
                <textarea
                  rows={3}
                  value={form.commentaire}
                  onChange={(e) => setForm((prev) => ({ ...prev, commentaire: e.target.value }))}
                  placeholder="Anniversaire, demande particulière…"
                />
                {fieldErrors.commentaire ? <em>{fieldErrors.commentaire}</em> : null}
              </label>

              <div className="client-res-modal__actions">
                <button
                  type="submit"
                  className="client-res-modal__btn client-res-modal__btn--primary"
                  disabled={
                    busy ||
                    loading ||
                    slotsLoading ||
                    !form.heure ||
                    (availableSlots.length === 0 && !slotsLoading)
                  }
                >
                  {busy ? "Enregistrement…" : "Enregistrer les modifications"}
                </button>
                {canCancel ? (
                  <button
                    type="button"
                    className="client-res-modal__btn client-res-modal__btn--danger"
                    onClick={() => setCancelOpen(true)}
                    disabled={busy}
                  >
                    Annuler la réservation
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>

      <ReservationCancelModal
        open={cancelOpen}
        busy={busy}
        nom={current.nomClient || profile?.nom}
        date={current.date}
        heure={current.heure}
        nbPersonnes={current.nbPersonnes}
        email={current.emailClient || profile?.email}
        onConfirm={handleCancelConfirm}
        onCancel={() => {
          if (!busy) setCancelOpen(false);
        }}
      />
    </>,
    document.body
  );
}
