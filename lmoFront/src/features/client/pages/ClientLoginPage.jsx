import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import authApi from "../../../common/api/authApi";
import { useAuth } from "../../../common/auth/AuthContext";
import {
  getRememberedEmail,
  getRememberPreference,
  useClientAuth,
} from "../../../common/auth/ClientAuthContext";
import ClientAuthBrandPanel from "../components/ClientAuthBrandPanel";
import {
  EMAIL_FORMAT_EXAMPLE,
} from "../../../common/utils/contactFieldValidation";
import {
  getFormBannerMessage,
  mergeApiError,
} from "../../../common/utils/formErrors";
import { validateLoginForm } from "../../../common/utils/formValidation";

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

const STAFF_ROLES = new Set(["ADMIN", "AGENT"]);

function resolveReturnPath(from, defaultPath) {
  if (typeof from === "string" && from.trim()) return from;
  if (from?.pathname) return `${from.pathname}${from.search || ""}`;
  return defaultPath;
}

function staffDestination(from) {
  const path = resolveReturnPath(from, "/admin/dashboard");
  if (path.startsWith("/admin")) {
    return path;
  }
  return "/admin/dashboard";
}

function ClientLoginPage() {
  const { isClientAuthenticated, login: clientLogin, logout: clientLogout } = useClientAuth();
  const { isAuthenticated: isStaffAuthenticated, role, login: staffLogin, logout: staffLogout } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(getRememberedEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(getRememberPreference);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const returnPath = resolveReturnPath(location.state?.from, "/mon-compte");
  const fromReservation = returnPath === "/reservation";
  const signupPath = email.trim()
    ? `/inscription?email=${encodeURIComponent(email.trim())}`
    : "/inscription";

  if (isStaffAuthenticated && role && STAFF_ROLES.has(role)) {
    return <Navigate to={staffDestination(returnPath)} replace />;
  }

  if (isClientAuthenticated) {
    return <Navigate to={returnPath} replace state={location.state?.returnState} />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const clientErrors = validateLoginForm({ email, password });
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError(getFormBannerMessage(clientErrors));
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.signIn(email.trim(), password);
      const user = {
        id: data.userId,
        nom: data.nom,
        email: data.email,
        role: data.role,
      };

      if (data.role === "CLIENT") {
        staffLogout();
        clientLogin({
          token: data.token,
          user,
          rememberMe,
        });
        navigate(returnPath, {
          replace: true,
          state: location.state?.returnState,
        });
        return;
      }

      if (STAFF_ROLES.has(data.role)) {
        clientLogout();
        staffLogin({
          token: data.token,
          user,
        });
        navigate(staffDestination(returnPath), { replace: true });
        return;
      }

      setError("Ce compte ne peut pas se connecter ici.");
    } catch (err) {
      const mapped = mergeApiError(err);
      setFieldErrors(mapped);
      setError(getFormBannerMessage(mapped, err.message || "Connexion impossible."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page client-auth-page client-auth-page--login">
      <PublicNavbar />
      <section className="client-auth">
        <div className="client-auth__stage">
          <div className="client-auth__glow client-auth__glow--teal" aria-hidden="true" />
          <div className="client-auth__glow client-auth__glow--gold" aria-hidden="true" />

          <div className="client-auth__shell">
            <ClientAuthBrandPanel variant="login" />

            <div className="client-auth__panel">
              <div className="client-auth__panel-inner">
                <header className="client-auth__head">
                  <p className="client-auth__kicker">Connexion</p>
                  <h1>Identifiants</h1>
                  <p className="client-auth__lead">
                    {fromReservation
                      ? "Connectez-vous pour reprendre vos coordonnées !"
                      : "Clients, agents et administrateurs : connectez-vous avec votre e-mail et mot de passe."}
                  </p>
                </header>

                <form className="client-auth__form" onSubmit={handleSubmit} noValidate>
                  {error && (
                    <p className="client-auth__error" role="alert">
                      {error}
                    </p>
                  )}

                  <label className={`client-auth__field${fieldErrors.email ? " client-auth__field--invalid" : ""}`}>
                    <span>Adresse e-mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }}
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
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        required
                        autoComplete="current-password"
                        placeholder="Votre mot de passe"
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

                  <div className="client-auth__options">
                    <label className="client-auth__remember">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Se souvenir de moi</span>
                    </label>
                  </div>

                  <button type="submit" className="client-auth__submit" disabled={loading}>
                    {loading ? "Connexion…" : "Se connecter"}
                  </button>

                  <Link to={signupPath} className="client-auth__secondary">
                    Créer un compte
                  </Link>
                </form>
              </div>
            </div>
          </div>

          <p className="client-auth__page-foot">
            <Link to="/">← Retour à l&apos;accueil</Link>
            {fromReservation ? (
              <Link
                to="/reservation"
                state={location.state?.returnState}
                className="client-auth__page-foot-reservation"
              >
                ← Retour à la réservation
              </Link>
            ) : null}
          </p>
        </div>
      </section>
    </main>
  );
}

export default ClientLoginPage;
