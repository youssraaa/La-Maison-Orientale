import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";
import ReservationAlert from "../components/ReservationAlert";
import ReservationCancelModal from "../components/ReservationCancelModal";
import ManageLateModal from "../components/ManageLateModal";
import ManageSignal from "../components/ManageSignal";
import useReservationPolicy from "../hooks/useReservationPolicy";
import { formatDeadlineFr } from "../utils/reservationPolicy";
import {
  cancelReservation,
  fetchManageAvailability,
  fetchReservationByToken,
  modifyReservation,
} from "../api/reservationManageApi";
import {
  clearReservationSuccess,
  loadReservationSuccess,
  saveReservationSuccess,
} from "../utils/reservationSuccessStorage";
import {
  hasValidationErrors,
  validateModifyReservationForm,
} from "../utils/validateReservationForm";
import {
  getFormBannerMessage,
  mergeApiError,
} from "../../../common/utils/formErrors";

function formatDateFr(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatStatus(statut) {
  switch (statut) {
    case "CONFIRMEE":
      return { label: "Confirmée", tone: "ok" };
    case "ANNULEE":
      return { label: "Annulée", tone: "cancelled" };
    default:
      return { label: statut || "—", tone: "pending" };
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function splitClientName(nomClient) {
  const parts = String(nomClient || "")
    .trim()
    .split(/\s+/);
  if (parts.length <= 1) {
    return { prenom: parts[0] || "", nomFamille: "" };
  }
  return { prenom: parts[0], nomFamille: parts.slice(1).join(" ") };
}

function persistModifiedSuccess(updated, token, reservation) {
  const existing = loadReservationSuccess();
  const nameParts = existing?.form?.prenom
    ? { prenom: existing.form.prenom, nomFamille: existing.form.nomFamille }
    : splitClientName(reservation.nomClient);

  saveReservationSuccess({
    form: {
      ...(existing?.form || {}),
      ...nameParts,
      email: reservation.emailClient || existing?.form?.email || "",
      telephone: existing?.form?.telephone || "",
      phoneIso: existing?.form?.phoneIso,
      date: updated.date,
      heure: String(updated.heure).slice(0, 5),
      nbPersonnes: String(updated.nbPersonnes),
      commentaire: updated.commentaire || "",
    },
    successMessage:
      "Votre modification a bien été enregistrée. À bientôt à La Maison Orientale !",
    manageUrl: existing?.manageUrl || `/gerer/${token}`,
    cancelled: false,
    modified: true,
  });
}

function isUpcomingReservation(reservation) {
  if (!reservation?.date || !reservation?.heure) return false;
  const at = new Date(`${reservation.date}T${String(reservation.heure).slice(0, 5)}:00`);
  return at.getTime() > Date.now();
}

function ReservationManagePage() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { info } = useRestaurantInfo();
  const { policy } = useReservationPolicy();
  const phone = info.phone;
  const maxOnlineCovers = policy.maxOnlineCovers;
  const modDeadlineLabel = formatDeadlineFr(policy.modificationDeadlineHours);
  const fromReservation =
    location.state?.fromReservation === true ||
    sessionStorage.getItem("lmo_manage_from_reservation") === "1";
  const [reservation, setReservation] = useState(null);
  const [form, setForm] = useState({ date: "", heure: "", nbPersonnes: "2", commentaire: "" });
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [lateModalOpen, setLateModalOpen] = useState(false);
  const [justCancelled, setJustCancelled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchReservationByToken(token)
      .then((data) => {
        if (cancelled) return;
        setReservation(data);
        setForm({
          date: data.date,
          heure: String(data.heure).slice(0, 5),
          nbPersonnes: String(data.nbPersonnes),
          commentaire: data.commentaire || "",
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!form.date || !reservation?.modifiable) return;
    let cancelled = false;
    setSlotsLoading(true);
    fetchManageAvailability(token, form.date, Number(form.nbPersonnes) || 2)
      .then((data) => {
        if (cancelled) return;
        const nextSlots = data.closed ? [] : data.slots || [];
        setSlots(nextSlots);
        setForm((current) => {
          if (!current.heure) return current;
          const selected = nextSlots.find((slot) => slot.time === current.heure);
          if (selected?.available) return current;
          return { ...current, heure: "" };
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
  }, [form.date, form.nbPersonnes, reservation?.modifiable, token]);

  const availableSlots = slots.filter((slot) => slot.available);
  const isCancelled = reservation?.statut === "ANNULEE";
  const isUpcoming = reservation && isUpcomingReservation(reservation);
  const isLocked =
    reservation && !isCancelled && isUpcoming && !reservation.modifiable && !reservation.cancellable;
  const isCancelOnly =
    reservation && !isCancelled && isUpcoming && !reservation.modifiable && reservation.cancellable;
  const isPhoneCancel =
    reservation &&
    !isCancelled &&
    isUpcoming &&
    reservation.nbPersonnes > maxOnlineCovers &&
    !reservation.modifiable;

  const lateVariant = isPhoneCancel
    ? "phone"
    : isLocked
      ? "locked"
      : isCancelOnly
        ? "cancelOnly"
        : null;

  useEffect(() => {
    if (lateVariant && reservation && !loading) {
      setLateModalOpen(true);
    }
  }, [lateVariant, reservation, loading]);

  function handleLateModalClose() {
    setLateModalOpen(false);
    if (fromReservation) {
      navigate("/reservation", { state: { restoreSuccess: true }, replace: true });
    }
  }

  const status = reservation ? formatStatus(reservation.statut) : null;

  async function handleModify(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const maxNb =
      reservation.nbPersonnes > maxOnlineCovers ? reservation.nbPersonnes : null;
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
      persistModifiedSuccess(updated, token, reservation);
      sessionStorage.setItem("lmo_manage_from_reservation", "1");
      navigate("/reservation", { state: { restoreSuccess: true }, replace: true });
    } catch (err) {
      const mapped = mergeApiError(err);
      setFieldErrors(mapped);
      setError(getFormBannerMessage(mapped, err.message || "Modification impossible."));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setError("");
    setBusy(true);
    try {
      const updated = await cancelReservation(token);
      setReservation(updated);
      setCancelOpen(false);
      setJustCancelled(true);
      clearReservationSuccess();
      sessionStorage.removeItem("lmo_manage_from_reservation");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page manage-page reservation-page">
      <PublicNavbar />

      <section className="page__hero page__hero--reservation">
        <p className="page__hero-kicker">La Maison Orientale</p>
        <h1>Gérer ma réservation</h1>
        <p>Modifiez ou annulez votre table en quelques clics.</p>
      </section>

      <div className="manage-stage">
        {loading ? (
          <div className="manage-panel manage-panel--loading">
            <p>Chargement de votre réservation…</p>
          </div>
        ) : null}

        {!loading && error && !reservation ? (
          <div className="manage-panel manage-panel--solo">
            <ReservationAlert title="Réservation introuvable">{error}</ReservationAlert>
            <Link to="/" className="manage-panel__back">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        ) : null}

        {reservation ? (
          <div
            className={`manage-panel${
              isCancelled ? " manage-panel--cancelled" : ""
            }${reservation.modifiable ? " manage-panel--edit" : ""}${
              isLocked || isPhoneCancel ? " manage-panel--restricted" : ""
            }${isCancelOnly ? " manage-panel--cancel-window" : ""}`}
          >
            <header className="manage-panel__head">
              {!isCancelled ? (
                <>
                  <p className="manage-panel__kicker">La Maison Orientale</p>
                  <h2>Modifier ma table</h2>
                  {status ? (
                    isCancelOnly ? (
                      <div className="manage-panel__ticket manage-panel__ticket--premium">
                        <span className={`manage-panel__badge manage-panel__badge--${status.tone}`}>
                          {status.label}
                        </span>
                        <dl className="manage-panel__ticket-grid">
                          <div>
                            <dt className="manage-panel__ticket-label">Invité</dt>
                            <dd>
                              <strong>{reservation.nomClient}</strong>
                            </dd>
                          </div>
                          <div>
                            <dt className="manage-panel__ticket-label">Date</dt>
                            <dd>
                              <strong>{formatDateFr(reservation.date)}</strong>
                            </dd>
                          </div>
                          <div>
                            <dt className="manage-panel__ticket-label">Heure</dt>
                            <dd>
                              <strong>{String(reservation.heure).slice(0, 5)}</strong>
                            </dd>
                          </div>
                          <div>
                            <dt className="manage-panel__ticket-label">Couverts</dt>
                            <dd>
                              <strong>{reservation.nbPersonnes} pers.</strong>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    ) : (
                      <p className="manage-panel__recap manage-panel__recap--burgundy">
                        <span className={`manage-panel__badge manage-panel__badge--${status.tone}`}>
                          {status.label}
                        </span>
                        <span className="manage-panel__recap-name">{reservation.nomClient}</span>
                        <span className="manage-panel__recap-date">{formatDateFr(reservation.date)}</span>
                        <span className="manage-panel__recap-time">{String(reservation.heure).slice(0, 5)}</span>
                        <span className="manage-panel__recap-guests">{reservation.nbPersonnes} pers.</span>
                      </p>
                    )
                  ) : null}
                </>
              ) : null}
            </header>

            {error ? (
              <ManageSignal variant="error" tag="Erreur" title="Une erreur est survenue">
                <p>{error}</p>
              </ManageSignal>
            ) : null}

            {isCancelled ? (
              <div className="manage-cancelled">
                <div className="manage-cancelled__card">
                  <span className="manage-cancelled__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                      <path
                        d="M15 9l-6 6M9 9l6 6"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <p className="manage-cancelled__tag">
                    {justCancelled ? "Annulation confirmée" : "Réservation inactive"}
                  </p>
                  <h2 className="manage-cancelled__title">
                    {justCancelled
                      ? "Votre réservation est annulée"
                      : "Cette réservation n'est plus active"}
                  </h2>
                  <p className="manage-cancelled__text">
                    {justCancelled ? (
                      <>
                        Un e-mail de confirmation vient de vous être envoyé. Nous serons ravis de
                        vous accueillir une prochaine fois à{" "}
                        <strong>La Maison Orientale</strong>.
                      </>
                    ) : (
                      <>
                        Cette réservation n&apos;est plus valable. Vous pouvez réserver une nouvelle
                        table quand vous le souhaitez.
                      </>
                    )}
                  </p>
                  <div className="manage-cancelled__actions">
                    <Link to="/reservation" className="manage-cancelled__cta">
                      Nouvelle réservation
                    </Link>
                    <Link to="/" className="manage-cancelled__home">
                      Retour à l&apos;accueil
                    </Link>
                  </div>
                </div>
              </div>
            ) : reservation.modifiable ? (
              <div className="manage-panel__body">
                <form className="manage-panel__form" onSubmit={handleModify} noValidate>
                  <div className="manage-panel__grid">
                    <label className={`res-field${fieldErrors.date ? " is-invalid" : ""}`}>
                      <span>Date</span>
                      <input
                        type="date"
                        min={todayIso()}
                        value={form.date}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, date: e.target.value, heure: "" }))
                        }
                        required
                        aria-invalid={Boolean(fieldErrors.date)}
                      />
                      {fieldErrors.date ? (
                        <ReservationAlert compact title={fieldErrors.date} />
                      ) : null}
                    </label>
                    <label className={`res-field${fieldErrors.nbPersonnes ? " is-invalid" : ""}`}>
                      <span>Couverts</span>
                      <input
                        type="number"
                        min={1}
                        max={
                          reservation.nbPersonnes > maxOnlineCovers
                            ? reservation.nbPersonnes
                            : maxOnlineCovers
                        }
                        value={form.nbPersonnes}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, nbPersonnes: e.target.value, heure: "" }))
                        }
                        required
                        aria-invalid={Boolean(fieldErrors.nbPersonnes)}
                      />
                      {fieldErrors.nbPersonnes ? (
                        <ReservationAlert compact title={fieldErrors.nbPersonnes} />
                      ) : null}
                    </label>
                  </div>

                  <div className="manage-panel__slots">
                    <p className="manage-panel__slots-label">
                      Créneau <span aria-hidden="true">*</span>
                    </p>

                    {slotsLoading && availableSlots.length === 0 ? (
                      <p className="manage-panel__slots-hint">Chargement des horaires…</p>
                    ) : null}

                    {!slotsLoading && form.date && availableSlots.length === 0 ? (
                      <ReservationAlert title="Aucun créneau disponible">
                        Essayez une autre date ou modifiez le nombre de couverts.
                      </ReservationAlert>
                    ) : null}

                    {availableSlots.length > 0 ? (
                      <div className="res-slots" role="listbox" aria-label="Créneaux disponibles">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            role="option"
                            aria-selected={form.heure === slot.time}
                            className={`res-slot${form.heure === slot.time ? " is-selected" : ""}`}
                            onClick={() => setForm((f) => ({ ...f, heure: slot.time }))}
                          >
                            <span className="res-slot__time">{slot.time}</span>
                            <span className="res-slot__status">Libre</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {fieldErrors.heure ? (
                      <ReservationAlert compact title={fieldErrors.heure} />
                    ) : null}
                  </div>

                  <label className={`res-field${fieldErrors.commentaire ? " is-invalid" : ""}`}>
                    <span>Commentaire (optionnel)</span>
                    <textarea
                      rows={3}
                      value={form.commentaire}
                      onChange={(e) => setForm((f) => ({ ...f, commentaire: e.target.value }))}
                      placeholder="Anniversaire, demande particulière…"
                      aria-invalid={Boolean(fieldErrors.commentaire)}
                    />
                    {fieldErrors.commentaire ? (
                      <ReservationAlert compact title={fieldErrors.commentaire} />
                    ) : null}
                  </label>

                  <div className="manage-panel__actions">
                    <button
                      type="submit"
                      className="res-done__btn res-done__btn--burgundy"
                      disabled={busy || slotsLoading || !form.heure || availableSlots.length === 0}
                    >
                      {busy ? "Enregistrement…" : "Enregistrer"}
                    </button>
                    {reservation.cancellable ? (
                      <button
                        type="button"
                        className="res-done__btn res-done__btn--ghost manage-panel__cancel-link"
                        onClick={() => setCancelOpen(true)}
                        disabled={busy}
                      >
                        Annuler la réservation
                      </button>
                    ) : reservation.nbPersonnes > maxOnlineCovers ? (
                      <p className="manage-panel__phone-note">
                        Pour annuler un groupe de plus de {maxOnlineCovers} personnes,{" "}
                        {phone?.display ? (
                          <>
                            appelez-nous au <a href={phone.href}>{phone.display}</a>.
                          </>
                        ) : (
                          "contactez-nous par téléphone."
                        )}
                      </p>
                    ) : null}
                  </div>
                </form>
              </div>
            ) : (
              <div className={`manage-outcome${lateVariant ? " manage-outcome--solo" : ""}`}>
                {lateVariant ? (
                  <p className="manage-panel__hint">
                    Votre table reste confirmée. Fermez la fenêtre pour revenir à votre
                    confirmation.
                  </p>
                ) : (
                  <div className="manage-outcome__actions">
                    <Link to="/reservation" className="res-done__btn res-done__btn--gold">
                      Nouvelle réservation
                    </Link>
                  </div>
                )}
              </div>
            )}

            {!isCancelled ? (
              <nav className="manage-panel__nav" aria-label="Navigation">
                {fromReservation ? (
                  <Link
                    to="/reservation"
                    state={{ restoreSuccess: true }}
                    className="manage-panel__nav-link manage-panel__nav-link--gold"
                  >
                    ← Retour à la réservation
                  </Link>
                ) : null}
                <Link to="/" className="manage-panel__nav-link manage-panel__nav-link--burgundy">
                  ← Retour à l&apos;accueil
                </Link>
              </nav>
            ) : null}

            <ManageLateModal
              open={lateModalOpen}
              variant={lateVariant || "cancelOnly"}
              deadlineLabel={modDeadlineLabel}
              phone={phone?.display ? phone : null}
              busy={busy}
              onCancel={() => {
                setLateModalOpen(false);
                setCancelOpen(true);
              }}
              onClose={handleLateModalClose}
            />

            <ReservationCancelModal
              open={cancelOpen}
              busy={busy}
              nom={reservation.nomClient}
              date={reservation.date}
              heure={reservation.heure}
              nbPersonnes={reservation.nbPersonnes}
              email={reservation.emailClient}
              onConfirm={handleCancel}
              onCancel={() => !busy && setCancelOpen(false)}
            />
          </div>
        ) : null}
      </div>

      <SiteFooter />
    </main>
  );
}

export default ReservationManagePage;
