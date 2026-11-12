import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import clientAuthApi from "../../../common/api/clientAuthApi";
import { useClientAuth } from "../../../common/auth/ClientAuthContext";
import ClientAuthBrandPanel from "../components/ClientAuthBrandPanel";
import {
  EMAIL_FORMAT_EXAMPLE,
  PHONE_LOCAL_EXAMPLE,
  sanitizePhoneLocalInput,
} from "../../../common/utils/contactFieldValidation";
import {
  getFormBannerMessage,
  mergeApiError,
} from "../../../common/utils/formErrors";
import { validateSignupForm } from "../../../common/utils/formValidation";

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18M10.58 10.58A2 2 0 0 0 12 15a2 2 0 0 0 1.42-.58M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7a11.8 11.8 0 0 1-1.67 2.94M6.1 6.1A11.65 11.65 0 0 0 3 12c1.73 3.89 6 7 11 7 1.05 0 2.06-.13 3-.37"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function ClientSignupPage() {
  const { isClientAuthenticated, login } = useClientAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    nom: params.get("nom") || "",
    email: params.get("email") || "",
    telephone: params.get("telephone") || "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isClientAuthenticated) {
    return <Navigate to="/mon-compte" replace />;
  }

  function updateField(name, value) {
    const nextValue = name === "telephone" ? sanitizePhoneLocalInput(value) : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const clientErrors = validateSignupForm(form);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError(getFormBannerMessage(clientErrors));
      return;
    }

    setLoading(true);
    try {
      const data = await clientAuthApi.signUp({
        nom: form.nom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim() || null,
        password: form.password,
      });
      login({
        token: data.token,
        user: { id: data.userId, nom: data.nom, email: data.email, role: data.role },
        rememberMe: true,
      });
      navigate("/mon-compte", { replace: true });
    } catch (err) {
      const mapped = mergeApiError(err);
      setFieldErrors(mapped);
      setError(getFormBannerMessage(mapped, err.message || "Inscription impossible."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page client-auth-page client-auth-page--signup">
      <PublicNavbar />
      <section className="client-auth">
        <div className="client-auth__stage">
          <div className="client-auth__glow client-auth__glow--teal" aria-hidden="true" />
          <div className="client-auth__glow client-auth__glow--gold" aria-hidden="true" />

          <div className="client-auth__shell client-auth__shell--signup">
            <ClientAuthBrandPanel variant="signup" />

            <div className="client-auth__panel">
              <div className="client-auth__panel-inner">
                <header className="client-auth__head">
                  <p className="client-auth__kicker">Inscription</p>
                  <h1>Créez votre espace client</h1>
                  <p className="client-auth__lead">
                    Rapide, gratuit et sans engagement.
                  </p>
                </header>

                <form className="client-auth__form client-auth__form--signup" onSubmit={handleSubmit} noValidate>
                  {error && (
                    <p className="client-auth__error" role="alert">
                      {error}
                    </p>
                  )}

                  <label className={`client-auth__field${fieldErrors.nom ? " client-auth__field--invalid" : ""}`}>
                    <span>Nom complet</span>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => updateField("nom", e.target.value)}
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Prénom et nom"
                      aria-invalid={Boolean(fieldErrors.nom)}
                    />
                    {fieldErrors.nom ? (
                      <span className="client-auth__field-error" role="alert">
                        {fieldErrors.nom}
                      </span>
                    ) : null}
                  </label>

                  <label className={`client-auth__field${fieldErrors.telephone ? " client-auth__field--invalid" : ""}`}>
                    <span>
                      Téléphone <span className="client-auth__opt">(optionnel)</span>
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      maxLength={18}
                      value={form.telephone}
                      onChange={(e) => updateField("telephone", e.target.value)}
                      autoComplete="tel"
                      placeholder={PHONE_LOCAL_EXAMPLE}
                      aria-invalid={Boolean(fieldErrors.telephone)}
                    />
                    {fieldErrors.telephone ? (
                      <span className="client-auth__field-error" role="alert">
                        {fieldErrors.telephone}
                      </span>
                    ) : null}
                  </label>

                  <label className={`client-auth__field${fieldErrors.email ? " client-auth__field--invalid" : ""}`}>
                    <span>Adresse e-mail</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                      autoComplete="email"
                      placeholder={EMAIL_FORMAT_EXAMPLE}
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                    {fieldErrors.email ? (
                      <span className="client-auth__field-error" role="alert">
                        {fieldErrors.email}
                      </span>
                    ) : null}
                  </label>

                  <label className={`client-auth__field${fieldErrors.password ? " client-auth__field--invalid" : ""}`}>
                    <span>Mot de passe</span>
                    <div className="client-auth__password">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="8 caractères minimum"
                        aria-invalid={Boolean(fieldErrors.password)}
                      />
                      <button
                        type="button"
                        className="client-auth__password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                        }
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <span className="client-auth__field-error" role="alert">
                        {fieldErrors.password}
                      </span>
                    ) : null}
                  </label>

                  <label className={`client-auth__field${fieldErrors.confirm ? " client-auth__field--invalid" : ""}`}>
                    <span>Confirmer le mot de passe</span>
                    <div className="client-auth__password">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirm}
                        onChange={(e) => updateField("confirm", e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Répétez le mot de passe"
                        aria-invalid={Boolean(fieldErrors.confirm)}
                      />
                      <button
                        type="button"
                        className="client-auth__password-toggle"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={
                          showConfirm
                            ? "Masquer la confirmation"
                            : "Afficher la confirmation"
                        }
                      >
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                    {fieldErrors.confirm ? (
                      <span className="client-auth__field-error" role="alert">
                        {fieldErrors.confirm}
                      </span>
                    ) : null}
                  </label>

                  <button type="submit" className="client-auth__submit" disabled={loading}>
                    {loading ? "Création…" : "Créer mon compte"}
                  </button>

                  <p className="client-auth__switch">
                    Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
                  </p>
                </form>
              </div>
            </div>
          </div>

          <p className="client-auth__page-foot">
            <Link to="/">← Retour à l&apos;accueil</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ClientSignupPage;
