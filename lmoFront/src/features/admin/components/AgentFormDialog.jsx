import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  EMAIL_FORMAT_EXAMPLE,
  validateEmail,
} from "../../../common/utils/contactFieldValidation";
import { validatePersonName } from "../../../common/utils/formValidation";

const EMPTY_FORM = { prenom: "", nom: "", email: "" };

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      />
    </svg>
  );
}

function IconAdd() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
      />
    </svg>
  );
}

function AgentFormDialog({
  open,
  mode = "create",
  initialValues = EMPTY_FORM,
  pendingInvite = false,
  saving = false,
  serverError = "",
  serverFieldErrors = {},
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const firstFieldRef = useRef(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    setForm({
      prenom: initialValues.prenom || "",
      nom: initialValues.nom || "",
      email: initialValues.email || "",
    });
    setErrors({});
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open, initialValues.prenom, initialValues.nom, initialValues.email]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape" && !saving) onClose?.();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, saving, onClose]);

  if (!open) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    const nomError = validatePersonName(form.nom, "Le nom");
    const prenomError = validatePersonName(form.prenom, "Le prénom");
    const emailError = validateEmail(form.email, { required: true });
    if (nomError) nextErrors.nom = nomError;
    if (prenomError) nextErrors.prenom = prenomError;
    if (emailError) nextErrors.email = emailError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit?.({
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      email: form.email.trim().toLowerCase(),
    });
  }

  const fieldError = (key) => errors[key] || serverFieldErrors[key] || "";

  return createPortal(
    <div
      className="admin-agents__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) onClose?.();
      }}
    >
      <div
        className={`admin-agents__modal admin-agent-dialog${isEdit ? " admin-agent-dialog--edit" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-dialog-title"
      >
        <header className="admin-agent-dialog__hero">
          <div className="admin-agent-dialog__hero-icon" aria-hidden="true">
            {isEdit ? <IconEdit /> : <IconAdd />}
          </div>
          <div className="admin-agent-dialog__hero-copy">
            <h2 id="agent-dialog-title">
              {isEdit ? "Modifier un agent" : "Créer un agent"}
            </h2>
            <p>
              {isEdit
                ? "Mettez à jour les informations du compte agent."
                : "Un e-mail d'invitation sera envoyé pour que l'agent choisisse son mot de passe."}
            </p>
          </div>
          <button
            type="button"
            className="admin-agents__modal-close admin-agent-dialog__close"
            onClick={onClose}
            disabled={saving}
            aria-label="Fermer"
          >
            <IconClose />
          </button>
        </header>

        <form className="admin-agents__form admin-agent-dialog__form" onSubmit={handleSubmit} noValidate>
          {serverError ? (
            <div className="admin-agent-dialog__alert admin-agent-dialog__alert--error" role="alert">
              {serverError}
            </div>
          ) : null}

          {!isEdit ? (
            <div className="admin-agent-dialog__alert admin-agent-dialog__alert--info">
              Après la création, l&apos;agent recevra un lien sécurisé par e-mail (valide 72 h).
            </div>
          ) : null}

          <label className="admin-agents__field">
            <span>Nom</span>
            <input
              ref={firstFieldRef}
              name="nom"
              value={form.nom}
              onChange={handleChange}
              autoComplete="family-name"
              placeholder="Ex. Karayem"
              required
              aria-invalid={Boolean(fieldError("nom"))}
            />
            {fieldError("nom") ? <em>{fieldError("nom")}</em> : null}
          </label>

          <label className="admin-agents__field">
            <span>Prénom</span>
            <input
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              autoComplete="given-name"
              placeholder="Ex. Salah"
              required
              aria-invalid={Boolean(fieldError("prenom"))}
            />
            {fieldError("prenom") ? <em>{fieldError("prenom")}</em> : null}
          </label>

          <label className="admin-agents__field">
            <span>E-mail</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder={EMAIL_FORMAT_EXAMPLE}
              required
              aria-invalid={Boolean(fieldError("email"))}
            />
            {fieldError("email") ? <em>{fieldError("email")}</em> : null}
          </label>

          {isEdit && pendingInvite ? (
            <p className="admin-agents__hint">
              Le compte sera activé automatiquement lorsque l&apos;agent aura confirmé
              son invitation par e-mail.
            </p>
          ) : null}

          <div className="admin-agents__modal-actions admin-agent-dialog__actions">
            <button
              type="button"
              className="admin-agents__ghost"
              onClick={onClose}
              disabled={saving}
            >
              Annuler
            </button>
            <button type="submit" className="admin-agents__submit" disabled={saving}>
              {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer l'agent"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default AgentFormDialog;
