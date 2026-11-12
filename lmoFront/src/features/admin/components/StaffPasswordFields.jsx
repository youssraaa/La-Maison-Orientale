import { useState } from "react";

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

export default function StaffPasswordFields({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  fieldErrors = {},
  passwordLabel = "Nouveau mot de passe",
  confirmLabel = "Confirmation",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <label
        className={`client-auth__field${fieldErrors.password ? " client-auth__field--invalid" : ""}`}
      >
        <span>{passwordLabel}</span>
        <div className="client-auth__password">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Minimum 8 caractères"
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <button
            type="button"
            className="client-auth__password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {fieldErrors.password ? (
          <span className="client-auth__field-error" role="alert">
            {fieldErrors.password}
          </span>
        ) : (
          <span className="staff-auth__hint">Au moins 8 caractères</span>
        )}
      </label>

      <label
        className={`client-auth__field${fieldErrors.confirm ? " client-auth__field--invalid" : ""}`}
      >
        <span>{confirmLabel}</span>
        <div className="client-auth__password">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => onConfirmChange(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Répétez le mot de passe"
            aria-invalid={Boolean(fieldErrors.confirm)}
          />
          <button
            type="button"
            className="client-auth__password-toggle"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Masquer la confirmation" : "Afficher la confirmation"}
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
    </>
  );
}
