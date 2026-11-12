import { useEffect, useState } from "react";
import { submitContactForm } from "../../contact/api/contactApi";
import {
  hasValidationErrors,
  validateContactForm,
} from "../../contact/utils/validateContactForm";
import { mergeApiError } from "../../../common/utils/formErrors";
import { IconMail, IconUser } from "./ClientPortalIcons";

const EMPTY_FORM = { nom: "", email: "", sujet: "", message: "" };

export default function ClientContactForm({ profile, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const nom = [profile?.prenom, profile?.nom].filter(Boolean).join(" ").trim() || profile?.nom || "";
    setForm((prev) => ({
      ...prev,
      nom: nom || prev.nom,
      email: profile?.email || prev.email,
    }));
  }, [profile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const clientErrors = validateContactForm(form);
    if (hasValidationErrors(clientErrors)) {
      setFieldErrors(clientErrors);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const result = await submitContactForm({
        nom: form.nom.trim(),
        email: form.email.trim(),
        sujet: form.sujet.trim(),
        message: form.message.trim(),
        telephone: profile?.telephone?.trim() || null,
      });
      setForm((prev) => ({ ...EMPTY_FORM, nom: prev.nom, email: prev.email }));
      setFieldErrors({});
      onSuccess?.(result.message || "Votre message a bien été envoyé.");
    } catch (err) {
      const mapped = mergeApiError(err);
      setFieldErrors(mapped);
      setError(err.message || "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="client-messages-form" onSubmit={handleSubmit} noValidate>
      {error ? (
        <p className="client-messages-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="client-messages-form__grid">
        <label className="client-profile-field">
          <span>Nom</span>
          <div className="client-profile-input">
            <IconUser />
            <input name="nom" value={form.nom} onChange={handleChange} autoComplete="name" required />
          </div>
          {fieldErrors.nom ? <em className="client-messages-form__field-error">{fieldErrors.nom}</em> : null}
        </label>

        <label className="client-profile-field">
          <span>E-mail</span>
          <div className="client-profile-input">
            <IconMail />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          {fieldErrors.email ? <em className="client-messages-form__field-error">{fieldErrors.email}</em> : null}
        </label>

        <label className="client-profile-field client-profile-field--full">
          <span>Sujet</span>
          <div className="client-profile-input">
            <input name="sujet" value={form.sujet} onChange={handleChange} required />
          </div>
          {fieldErrors.sujet ? <em className="client-messages-form__field-error">{fieldErrors.sujet}</em> : null}
        </label>

        <label className="client-profile-field client-profile-field--full">
          <span>Message</span>
          <textarea
            className="client-messages-form__textarea"
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            placeholder="Posez votre question au restaurant…"
            required
          />
          {fieldErrors.message ? (
            <em className="client-messages-form__field-error">{fieldErrors.message}</em>
          ) : null}
        </label>
      </div>

      <button type="submit" className="client-home__action client-home__action--primary" disabled={busy}>
        {busy ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}
