import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cancelReservation, fetchReservationByToken } from "../api/reservationManageApi";
import ReservationCancelModal from "./ReservationCancelModal";
import ManageLateModal from "./ManageLateModal";
import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";
import useReservationPolicy from "../hooks/useReservationPolicy";
import { formatDeadlineFr } from "../utils/reservationPolicy";
import {
  fullClientName,
  fullPhoneNumber,
} from "../utils/validateReservationForm";

function formatDateFr(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function extractManageToken(manageUrl) {
  if (!manageUrl) return "";
  const match = manageUrl.match(/\/gerer\/([^/?#]+)/);
  return match?.[1] || "";
}

function ActionIcon({ name }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        </svg>
      );
    case "cancel":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    default:
      return null;
  }
}

function ReservationSuccess({
  form,
  successMessage,
  manageUrl,
  isClientAuthenticated,
  onNewReservation,
  onCancelled,
  cancelled = false,
  modified = false,
}) {
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [lateModalOpen, setLateModalOpen] = useState(false);
  const [lateVariant, setLateVariant] = useState("cancelOnly");
  const [checkingModify, setCheckingModify] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { info } = useRestaurantInfo();
  const { policy } = useReservationPolicy();
  const modDeadlineLabel = formatDeadlineFr(policy.modificationDeadlineHours);
  const restaurantPhone = info.phone;
  const maxOnlineCovers = policy.maxOnlineCovers;

  const name = fullClientName(form.prenom, form.nomFamille);
  const clientPhone = fullPhoneNumber(form.telephone, form.phoneIso);
  const dateLabel = formatDateFr(form.date);
  const covers = `${form.nbPersonnes} personne${Number(form.nbPersonnes) > 1 ? "s" : ""}`;
  const managePath = manageUrl?.replace(/^https?:\/\/[^/]+/, "") || "";
  const manageToken = extractManageToken(manageUrl);
  const signupQuery = new URLSearchParams({
    email: form.email.trim(),
    nom: name,
    telephone: clientPhone,
  }).toString();

  async function handleCancel() {
    if (!manageToken) return;
    setBusy(true);
    setError("");
    try {
      await cancelReservation(manageToken);
      setCancelOpen(false);
      setLateModalOpen(false);
      onCancelled?.();
    } catch (err) {
      setError(err.message || "Impossible d'annuler la réservation.");
    } finally {
      setBusy(false);
    }
  }

  async function handleModifyClick(event) {
    event.preventDefault();
    if (!manageToken || !managePath) return;
    setCheckingModify(true);
    setError("");
    try {
      const data = await fetchReservationByToken(manageToken);
      if (data.modifiable) {
        sessionStorage.setItem("lmo_manage_from_reservation", "1");
        navigate(managePath, { state: { fromReservation: true } });
        return;
      }

      const phoneCancel =
        data.nbPersonnes > maxOnlineCovers && !data.modifiable;
      if (phoneCancel) {
        setLateVariant("phone");
      } else if (!data.cancellable) {
        setLateVariant("locked");
      } else {
        setLateVariant("cancelOnly");
      }
      setLateModalOpen(true);
    } catch (err) {
      setError(err.message || "Impossible d'ouvrir la modification.");
    } finally {
      setCheckingModify(false);
    }
  }

  return (
    <div className="res-done">
      <header className="res-done__hero">
        <div className="res-done__check" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="res-done__title">
          Merci {form.prenom?.trim() || "à vous"}&nbsp;!
        </h3>
        <p className="res-done__subtitle">
          {cancelled ? (
            <>Votre réservation a bien été annulée.</>
          ) : modified ? (
            <>
              Votre table à <strong>La Maison Orientale</strong> a bien été{" "}
              <strong>modifiée</strong>.
            </>
          ) : (
            <>
              Votre table à <strong>La Maison Orientale</strong> est confirmée.
            </>
          )}
        </p>
        {!cancelled && successMessage && (
          <p className="res-done__message" role="status">
            {successMessage}
          </p>
        )}
      </header>

      {!cancelled ? (
        <ul className="res-done__tips">
          <li>
            Un e-mail {modified ? "récapitulatif" : "de confirmation"} a été envoyé à{" "}
            <strong>{form.email.trim()}</strong>.
          </li>
          <li>
            {modified ? "Nouveau rendez-vous" : "Rendez-vous"} le{" "}
            <strong>{dateLabel}</strong> à <strong>{form.heure}</strong> pour{" "}
            <strong>{covers}</strong>.
          </li>
          <li>
            Le lien reçu par e-mail vous permet de{" "}
            <strong>modifier ou d&apos;annuler</strong> à tout moment.
          </li>
        </ul>
      ) : (
        <div className="res-done__cancel-note" role="status">
          <span className="res-done__cancel-note-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path
                d="M4 7.5 12 13l8-5.5V17a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17V7.5Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path d="M4 7.5 12 13l8-5.5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="res-done__cancel-note-lead">Annulation enregistrée.</p>
            {form.email?.trim() ? (
              <p className="res-done__cancel-note-email">
                Un récapitulatif a été envoyé à{" "}
                <strong>{form.email.trim()}</strong>.
              </p>
            ) : (
              <p className="res-done__cancel-note-email">
                Un e-mail récapitulatif vous a été envoyé.
              </p>
            )}
            <p className="res-done__cancel-note-sub">
              À très bientôt chez La Maison Orientale.
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="res-done__error" role="alert">
          {error}
        </p>
      )}

      <div className="res-done__actions">
        {!cancelled && managePath ? (
          <>
            <button
              type="button"
              className="res-done__btn res-done__btn--pine"
              onClick={handleModifyClick}
              disabled={checkingModify || busy}
            >
              <ActionIcon name="edit" />
              {checkingModify ? "Vérification…" : "Modifier ma réservation"}
            </button>
            {manageToken ? (
              <button
                type="button"
                className="res-done__btn res-done__btn--burgundy"
                onClick={() => setCancelOpen(true)}
                disabled={busy}
              >
                <ActionIcon name="cancel" />
                Annuler ma réservation
              </button>
            ) : null}
          </>
        ) : null}
        <button
          type="button"
          className="res-done__btn res-done__btn--gold"
          onClick={onNewReservation}
        >
          <ActionIcon name="plus" />
          Nouvelle réservation
        </button>
        <Link
          to="/"
          className="res-done__btn res-done__btn--home"
        >
          <ActionIcon name="home" />
          Retour à l&apos;accueil
        </Link>
      </div>

      {!isClientAuthenticated && !cancelled && (
        <aside className="res-signup-prompt" aria-labelledby="res-signup-prompt-title">
          <div className="res-signup-prompt__body">
            <p id="res-signup-prompt-title" className="res-signup-prompt__title">
              Envie de réserver encore plus vite la prochaine fois&nbsp;?
            </p>
            <p className="res-signup-prompt__subtitle">
              Créez votre espace client gratuitement en une minute&nbsp;!
            </p>
          </div>
          <Link to={`/inscription?${signupQuery}`} className="res-signup-prompt__cta">
            Créer mon compte
            <span className="res-signup-prompt__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </aside>
      )}

      <ReservationCancelModal
        open={cancelOpen}
        busy={busy}
        nom={name}
        date={form.date}
        heure={form.heure}
        nbPersonnes={form.nbPersonnes}
        email={form.email?.trim()}
        onConfirm={handleCancel}
        onCancel={() => !busy && setCancelOpen(false)}
      />

      <ManageLateModal
        open={lateModalOpen}
        variant={lateVariant}
        deadlineLabel={modDeadlineLabel}
        phone={restaurantPhone?.display ? restaurantPhone : null}
        busy={busy}
        onCancel={() => {
          setLateModalOpen(false);
          setCancelOpen(true);
        }}
        onClose={() => !busy && setLateModalOpen(false)}
      />
    </div>
  );
}

export default ReservationSuccess;
