import { useRef, useState } from "react";
import { submitContactForm } from "../api/contactApi";
import ContactIcon from "./ContactIcons";
import {
  hasValidationErrors,
  validateContactForm,
} from "../utils/validateContactForm";
import { EMAIL_FORMAT_EXAMPLE } from "../../../common/utils/contactFieldValidation";
import { mergeApiError } from "../../../common/utils/formErrors";

const initialForm = {
  nom: "",
  email: "",
  sujet: "",
  message: "",
};

const FIELD_META = {
  nom: { label: "Nom", icon: "user", autoComplete: "name" },
  email: { label: "E-mail", icon: "mail", autoComplete: "email", type: "email" },
  sujet: { label: "Sujet", icon: "tag", autoComplete: "off" },
  message: { label: "Message", icon: "message", autoComplete: "off" },
};

function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [successMessage, setSuccessMessage] = useState("");
  const formRef = useRef(null);

  const messageLength = form.message.length;
  const fieldErrorCount = Object.keys(fieldErrors).filter((k) => k !== "_form").length;

  function scrollToFirstError(errors) {
    const firstKey = ["nom", "email", "sujet", "message"].find((key) => errors[key]);
    if (!firstKey) return;
    formRef.current
      ?.querySelector(`[name="${firstKey}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

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
      scrollToFirstError(clientErrors);
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
      const errors = mergeApiError(error);
      setFieldErrors(errors);
      scrollToFirstError(errors);
    }
  }

  function renderField(name) {
    const meta = FIELD_META[name];
    const error = fieldErrors[name];
    const isTextarea = name === "message";

    return (
      <div
        className={`contact-form__field${error ? " contact-form__field--invalid" : ""}`}
      >
        <label htmlFor={name}>
          <ContactIcon name={meta.icon} />
          <span>
            {meta.label} <span className="contact-form__required">*</span>
          </span>
        </label>
        <div className="contact-form__control">
          {isTextarea ? (
            <textarea
              id={name}
              name={name}
              rows={6}
              maxLength={2000}
              value={form[name]}
              onChange={handleChange}
              placeholder="Décrivez votre demande…"
              aria-invalid={Boolean(error)}
              aria-describedby={`${name}-hint ${name}-error`}
            />
          ) : (
            <input
              id={name}
              name={name}
              type={meta.type || "text"}
              autoComplete={meta.autoComplete}
              maxLength={name === "nom" ? 100 : name === "email" ? 255 : 120}
              placeholder={
                name === "email"
                  ? EMAIL_FORMAT_EXAMPLE
                  : name === "sujet"
                    ? "Ex. : anniversaire, événement, question…"
                    : undefined
              }
              value={form[name]}
              onChange={handleChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${name}-error` : undefined}
            />
          )}
        </div>
        {name === "message" ? (
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
        ) : null}
        {error ? (
          <p id={`${name}-error`} className="contact-form__error" role="alert">
            <ContactIcon name="alert" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="contact-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {fieldErrorCount > 1 ? (
        <div className="contact-form__summary" role="alert">
          <ContactIcon name="alert" />
          <p>
            Veuillez corriger les <strong>{fieldErrorCount} champs</strong> signalés
            ci-dessous.
          </p>
        </div>
      ) : null}

      {fieldErrors._form ? (
        <div
          className={`contact-form__banner contact-form__banner--error${
            fieldErrors._form.includes("enregistré")
              ? " contact-form__banner--warning"
              : ""
          }`}
          role="alert"
        >
          <ContactIcon name="alert" />
          <p>{fieldErrors._form}</p>
        </div>
      ) : null}

      {successMessage ? (
        <div className="contact-form__banner contact-form__banner--success" role="status">
          <ContactIcon name="check" />
          <p>{successMessage}</p>
        </div>
      ) : null}

      {renderField("nom")}
      {renderField("email")}
      {renderField("sujet")}
      {renderField("message")}

      <button
        type="submit"
        className="contact-form__submit"
        disabled={status === "loading"}
      >
        <ContactIcon name="send" />
        <span>{status === "loading" ? "Envoi en cours…" : "Envoyer le message"}</span>
      </button>
    </form>
  );
}

export default ContactForm;
