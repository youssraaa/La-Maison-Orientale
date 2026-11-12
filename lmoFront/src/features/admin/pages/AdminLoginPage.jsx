import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import authApi from "../../../common/api/authApi";
import { useAuth } from "../../../common/auth/AuthContext";
import {
  EMAIL_FORMAT_EXAMPLE,
} from "../../../common/utils/contactFieldValidation";
import {
  getFormBannerMessage,
  mergeApiError,
} from "../../../common/utils/formErrors";
import { validateLoginForm } from "../../../common/utils/formValidation";

const MODULES = [
  {
    id: "reservations",
    label: "Réservations",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
        />
      </svg>
    ),
  },
  {
    id: "messages",
    label: "Messages",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"
        />
      </svg>
    ),
  },
  {
    id: "carte",
    label: "Carte",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M3 5v14h18V5H3zm16 12H5V7h14v10zM7 9h6v2H7V9zm0 4h10v2H7v-2z"
        />
      </svg>
    ),
  },
  {
    id: "horaires",
    label: "Horaires",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"
        />
      </svg>
    ),
  },
  {
    id: "avis",
    label: "Avis",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        />
      </svg>
    ),
  },
  {
    id: "equipe",
    label: "Équipe",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
        />
      </svg>
    ),
  },
];

function staffHome() {
  return "/admin/dashboard";
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(staffHome(), { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setFieldErrors({});

    const clientErrors = validateLoginForm({ email, password });
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setMessage(getFormBannerMessage(clientErrors));
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.signIn(email.trim(), password);
      login({
        token: data.token,
        user: {
          id: data.userId,
          email: data.email,
          nom: data.nom,
          role: data.role,
        },
      });
      navigate(staffHome(), { replace: true });
    } catch (error) {
      const mapped = mergeApiError(error);
      setFieldErrors(mapped);
      setMessage(getFormBannerMessage(mapped, error.message || "E-mail ou mot de passe incorrect."));
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) {
    return <Navigate to={staffHome()} replace />;
  }

  return (
    <main className="admin-login">
      <div className="admin-login__glow admin-login__glow--left" aria-hidden="true" />
      <div className="admin-login__glow admin-login__glow--right" aria-hidden="true" />

      <div className="admin-login__panel">
        <header className="admin-login__brand">
          <img
            src="/images/logo-round.png"
            alt=""
            className="admin-login__logo"
            width={48}
            height={48}
          />
          <div>
            <p className="admin-login__name">La Maison Orientale</p>
            <p className="admin-login__tagline">Espace Admin</p>
          </div>
        </header>

        <h1 className="admin-login__title">
          Bienvenue dans votre <strong>espace admin</strong>
        </h1>
        <p className="admin-login__lead">
          Connexion unique pour administrateurs et agents. Gérez les
          réservations, les messages et le quotidien du restaurant.
        </p>

        <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
          <label className={`admin-login__field${fieldErrors.email ? " admin-login__field--invalid" : ""}`} htmlFor="staff-email">
            <span>E-mail</span>
            <input
              id="staff-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder={EMAIL_FORMAT_EXAMPLE}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email ? <em className="admin-login__field-error">{fieldErrors.email}</em> : null}
          </label>

          <label className={`admin-login__field${fieldErrors.password ? " admin-login__field--invalid" : ""}`} htmlFor="staff-password">
            <span>Mot de passe</span>
            <input
              id="staff-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="mot de passe"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password ? <em className="admin-login__field-error">{fieldErrors.password}</em> : null}
          </label>

          <button type="button" className="admin-login__forgot" disabled>
            Mot de passe oublié ?
          </button>

          {message ? (
            <p className="admin-login__message" role="status">
              {message}
            </p>
          ) : null}

          <button type="submit" className="admin-login__submit" disabled={loading}>
            <span>{loading ? "Connexion…" : "Se connecter"}</span>
            <span className="admin-login__submit-icon" aria-hidden="true">
              →
            </span>
          </button>
        </form>

        <ul className="admin-login__modules" aria-label="Modules prévus">
          {MODULES.map((mod) => (
            <li key={mod.id}>
              <span className="admin-login__module-icon">{mod.icon}</span>
              <span className="admin-login__module-label">{mod.label}</span>
            </li>
          ))}
        </ul>

        <footer className="admin-login__foot">
          <span>v0.1 · aperçu</span>
          <Link to="/">Retour au site</Link>
        </footer>
      </div>
    </main>
  );
}

export default AdminLoginPage;
