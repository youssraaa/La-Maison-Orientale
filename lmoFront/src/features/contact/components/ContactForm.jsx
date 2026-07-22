import { useState } from "react";
import { submitContactForm } from "../api/contactApi";
import {
  hasValidationErrors,
  validateContactForm,
} from "../utils/validateContactForm";

const initialForm = {
  nom: "",
  email: "",
  sujet: "",
  message: "",
};

function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [successMessage, setSuccessMessage] = useState("");

  const messageLength = form.message.length;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined, _form: undefined }));
    if (status === "success") {
      setStatus("idle");
      setSuccessMessage("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const clientErrors = validateContactForm(form);
    if (hasValidationErrors(clientErrors)) {
      setFieldErrors(clientErrors);
      setStatus("error");
      setSuccessMessage("");
      return;
    }

    setStatus("loading");
    setFieldErrors({});
    setSuccessMessage("");

    const payload = {
      nom: form.nom.trim(),
      email: form.email.trim(),
      sujet: form.sujet.trim(),
      message: form.message.trim(),
      telephone: null,
    };

    try {
      const result = await submitContactForm(payload);
      setStatus("success");
      setSuccessMessage(result.message);
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      const errors = { ...(error.fieldErrors || {}) };
      if (
        error.message &&
        (!errors._form ||
          error.code === "NETWORK" ||
          error.code === "SERVER" ||
          error.code === "MAIL")
      ) {
        errors._form = error.message;
      }
      setFieldErrors(errors);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__field">
        <label htmlFor="nom">Nom *</label>
        <input
          id="nom"
          name="nom"
          type="text"
          autoComplete="name"
          maxLength={100}
          value={form.nom}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.nom)}
          aria-describedby={fieldErrors.nom ? "nom-error" : undefined}
        />
        {fieldErrors.nom && (
          <span id="nom-error" className="contact-form__error" role="alert">
            {fieldErrors.nom}
          </span>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="email">E-mail *</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={255}
          value={form.email}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email && (
          <span id="email-error" className="contact-form__error" role="alert">
            {fieldErrors.email}
          </span>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="sujet">Sujet *</label>
        <input
          id="sujet"
          name="sujet"
          type="text"
          maxLength={120}
          placeholder="Ex. : anniversaire, événement, question…"
          value={form.sujet}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.sujet)}
          aria-describedby={fieldErrors.sujet ? "sujet-error" : undefined}
        />
        {fieldErrors.sujet && (
          <span id="sujet-error" className="contact-form__error" role="alert">
            {fieldErrors.sujet}
          </span>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          maxLength={2000}
          value={form.message}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby="message-hint message-error"
        />
        <div className="contact-form__meta">
          <span id="message-hint" className="contact-form__hint">
            Minimum 10 caractères
          </span>
          <span
            className={`contact-form__counter${messageLength > 2000 ? " contact-form__counter--over" : ""}`}
            aria-live="polite"
          >
            {messageLength} / 2000
          </span>
        </div>
        {fieldErrors.message && (
          <span id="message-error" className="contact-form__error" role="alert">
            {fieldErrors.message}
          </span>
        )}
      </div>

      {fieldErrors._form && (
        <p
          className={`contact-form__error contact-form__error--global${status === "error" && fieldErrors._form.includes("enregistré") ? " contact-form__error--warning" : ""}`}
          role="alert"
        >
          {fieldErrors._form}
        </p>
      )}

      {successMessage && (
        <p className="contact-form__success" role="status">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        className="btn btn--accent contact-form__submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}

export default ContactForm;
