import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authApi from "../../../common/api/authApi";
import { getFormBannerMessage, mergeApiError } from "../../../common/utils/formErrors";
import { validateInvitePasswordForm } from "../../../common/utils/formValidation";
import StaffAuthLayout from "../components/StaffAuthLayout";
import StaffPasswordFields from "../components/StaffPasswordFields";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

function ActivationSteps({ active = 2 }) {
  const steps = [
    { id: 1, label: "Invitation" },
    { id: 2, label: "Mot de passe" },
    { id: 3, label: "Accès" },
  ];

  return (
    <ol className="staff-auth__steps" aria-label="Étapes d'activation">
      {steps.map((step) => {
        const state =
          step.id < active ? "is-done" : step.id === active ? "is-active" : "is-pending";
        return (
          <li key={step.id} className={`staff-auth__step ${state}`}>
            <span className="staff-auth__step-num" aria-hidden="true">
              {step.id < active ? "✓" : step.id}
            </span>
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function StatusBlock({ tone, icon, title, children, action }) {
  return (
    <div className={`staff-auth__status staff-auth__status--${tone}`}>
      <span className={`staff-auth__status-icon staff-auth__status-icon--${tone}`} aria-hidden="true">
        {icon}
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}

function AgentActivatePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Lien d'invitation invalide.");
      setLoading(false);
      return;
    }
    authApi
      .previewInvite(token)
      .then(setPreview)
      .catch(() => setError("Invitation invalide ou expirée."))
      .finally(() => setLoading(false));
  }, [token]);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const clientErrors = validateInvitePasswordForm(password, confirm);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError(getFormBannerMessage(clientErrors));
      return;
    }

    setSaving(true);
    try {
      await authApi.acceptInvite(token, password);
      setDone(true);
    } catch (err) {
      const mapped = mergeApiError(err);
      setFieldErrors(mapped);
      setError(getFormBannerMessage(mapped, err.message || "Activation impossible."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <StaffAuthLayout variant="activate" pageClass="staff-auth-page--activate">
      {loading ? (
        <div className="staff-auth__loader" aria-busy="true" aria-live="polite">
          <div className="staff-auth__loader-ring" aria-hidden="true" />
          <p>Vérification de votre invitation…</p>
        </div>
      ) : done ? (
        <>
          <ActivationSteps active={4} />
          <StatusBlock
            tone="ok"
            icon="✓"
            title="Compte activé"
            action={
              <button
                type="button"
                className="client-auth__submit"
                onClick={() => navigate("/connexion", { replace: true })}
              >
                Se connecter à l&apos;espace agent
              </button>
            }
          >
            Votre mot de passe est enregistré. Vous pouvez maintenant accéder au tableau de
            bord et aux outils du restaurant.
          </StatusBlock>
        </>
      ) : preview?.used ? (
        <StatusBlock
          tone="warn"
          icon="!"
          title="Invitation déjà utilisée"
          action={
            <Link to="/connexion" className="client-auth__secondary">
              Aller à la connexion
            </Link>
          }
        >
          Ce compte a déjà été activé. Connectez-vous avec votre mot de passe ou demandez une
          réinitialisation à l&apos;administrateur.
        </StatusBlock>
      ) : preview?.expired ? (
        <StatusBlock
          tone="warn"
          icon="⏱"
          title="Invitation expirée"
          action={
            <Link to="/connexion" className="client-auth__secondary">
              Retour à la connexion
            </Link>
          }
        >
          Ce lien n&apos;est plus valable. Demandez à l&apos;administrateur de renvoyer une
          nouvelle invitation depuis la gestion des agents.
        </StatusBlock>
      ) : preview ? (
        <>
          <header className="client-auth__head">
            <p className="client-auth__kicker">Espace agent</p>
            <h1>Choisissez votre mot de passe</h1>
            <p className="client-auth__lead">
              Dernière étape pour accéder à votre espace agent.
            </p>
          </header>

          <ActivationSteps active={2} />

          <div className="staff-auth__account-card">
            <span className="staff-auth__account-avatar" aria-hidden="true">
              {initials(preview.nom)}
            </span>
            <div>
              <strong>{preview.nom}</strong>
              <span>{preview.email}</span>
            </div>
          </div>

          <form className="client-auth__form" onSubmit={onSubmit} noValidate>
            {error ? (
              <p className="client-auth__error" role="alert">
                {error}
              </p>
            ) : null}

            <StaffPasswordFields
              password={password}
              confirm={confirm}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
              fieldErrors={fieldErrors}
            />

            <button type="submit" className="client-auth__submit" disabled={saving}>
              {saving ? "Activation en cours…" : "Activer mon espace agent"}
            </button>
          </form>
        </>
      ) : (
        <StatusBlock
          tone="error"
          icon="×"
          title="Lien invalide"
          action={
            <Link to="/connexion" className="client-auth__secondary">
              Retour à la connexion
            </Link>
          }
        >
          {error || "Ce lien d'activation est incorrect ou a expiré."}
        </StatusBlock>
      )}
    </StaffAuthLayout>
  );
}

export default AgentActivatePage;
