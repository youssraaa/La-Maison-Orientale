import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authApi from "../../../common/api/authApi";
import { getFormBannerMessage, mergeApiError } from "../../../common/utils/formErrors";
import { validateInvitePasswordForm } from "../../../common/utils/formValidation";
import StaffAuthLayout from "../components/StaffAuthLayout";
import StaffPasswordFields from "../components/StaffPasswordFields";

function AgentResetPasswordPage() {
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
      setError("Lien de réinitialisation invalide.");
      setLoading(false);
      return;
    }
    authApi
      .previewReset(token)
      .then(setPreview)
      .catch(() => setError("Lien invalide ou expiré."))
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
      await authApi.acceptReset(token, password);
      setDone(true);
    } catch (err) {
      const mapped = mergeApiError(err);
      setFieldErrors(mapped);
      setError(getFormBannerMessage(mapped, err.message || "Réinitialisation impossible."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <StaffAuthLayout variant="reset" pageClass="staff-auth-page--reset">
      {loading ? (
        <div className="staff-auth__loader" aria-busy="true" aria-live="polite">
          <div className="staff-auth__loader-ring" aria-hidden="true" />
          <p>Vérification du lien…</p>
        </div>
      ) : done ? (
        <div className="staff-auth__status">
          <span className="staff-auth__status-icon staff-auth__status-icon--ok" aria-hidden="true">
            ✓
          </span>
          <h2>Mot de passe mis à jour</h2>
          <p>Vous pouvez vous connecter avec votre nouveau mot de passe.</p>
          <button
            type="button"
            className="client-auth__submit"
            onClick={() => navigate("/connexion", { replace: true })}
          >
            Aller à la connexion
          </button>
        </div>
      ) : preview?.used ? (
        <div className="staff-auth__status">
          <span className="staff-auth__status-icon staff-auth__status-icon--warn" aria-hidden="true">
            !
          </span>
          <h2>Lien déjà utilisé</h2>
          <p>Ce lien de réinitialisation a déjà servi. Demandez-en un nouveau si nécessaire.</p>
          <Link to="/connexion" className="client-auth__secondary">
            Retour à la connexion
          </Link>
        </div>
      ) : preview?.expired ? (
        <div className="staff-auth__status">
          <span className="staff-auth__status-icon staff-auth__status-icon--warn" aria-hidden="true">
            ⏱
          </span>
          <h2>Lien expiré</h2>
          <p>Ce lien n&apos;est plus valable. Contactez l&apos;administrateur pour en obtenir un nouveau.</p>
          <Link to="/connexion" className="client-auth__secondary">
            Retour à la connexion
          </Link>
        </div>
      ) : preview ? (
        <>
          <header className="client-auth__head">
            <p className="client-auth__kicker">Espace agent</p>
            <h1>Nouveau mot de passe</h1>
            <p className="client-auth__lead">
              Compte : <strong>{preview.nom || preview.email}</strong>
            </p>
          </header>

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
              passwordLabel="Mot de passe"
            />

            <button type="submit" className="client-auth__submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer le mot de passe"}
            </button>
          </form>
        </>
      ) : (
        <div className="staff-auth__status">
          <span className="staff-auth__status-icon staff-auth__status-icon--error" aria-hidden="true">
            ×
          </span>
          <h2>Lien invalide</h2>
          <p>{error || "Ce lien de réinitialisation est incorrect ou a expiré."}</p>
          <Link to="/connexion" className="client-auth__secondary">
            Retour à la connexion
          </Link>
        </div>
      )}
    </StaffAuthLayout>
  );
}

export default AgentResetPasswordPage;
