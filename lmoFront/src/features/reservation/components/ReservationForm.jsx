import { useState } from "react";
import { submitReservation } from "../api/reservationApi";
import {
  hasValidationErrors,
  validateReservationForm,
} from "../utils/validateReservationForm";

const initialForm = {
  nom: "",
  telephone: "",
  email: "",
  date: "",
  heure: "",
  nbPersonnes: "2",
  commentaire: "",
};

function todayIsoDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function ReservationForm() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [successMessage, setSuccessMessage] = useState("");

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

    const clientErrors = validateReservationForm(form);
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
      telephone: form.telephone.trim(),
      email: form.email.trim() || null,
      date: form.date,
      heure: form.heure,
      nbPersonnes: Number(form.nbPersonnes),
      commentaire: form.commentaire.trim() || null,
    };

    try {
      const result = await submitReservation(payload);
      setStatus("success");
      setSuccessMessage(result.message);
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      const errors = { ...(error.fieldErrors || {}) };
      if (error.message && (!errors._form || error.code !== "VALIDATION")) {
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

      <div className="contact-form__row">
        <div className="contact-form__field">
          <label htmlFor="telephone">Téléphone *</label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="+32 …"
            value={form.telephone}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.telephone)}
            aria-describedby={
              fieldErrors.telephone ? "telephone-error" : undefined
            }
          />
          {fieldErrors.telephone && (
            <span
              id="telephone-error"
              className="contact-form__error"
              role="alert"
            >
              {fieldErrors.telephone}
            </span>
          )}
        </div>

        <div className="contact-form__field">
          <label htmlFor="email">E-mail</label>
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
      </div>

      <div className="contact-form__row contact-form__row--three">
        <div className="contact-form__field">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            name="date"
            type="date"
            min={todayIsoDate()}
            value={form.date}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.date)}
            aria-describedby={fieldErrors.date ? "date-error" : undefined}
          />
          {fieldErrors.date && (
            <span id="date-error" className="contact-form__error" role="alert">
              {fieldErrors.date}
            </span>
          )}
        </div>

        <div className="contact-form__field">
          <label htmlFor="heure">Heure *</label>
          <input
            id="heure"
            name="heure"
            type="time"
            value={form.heure}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.heure)}
            aria-describedby={fieldErrors.heure ? "heure-error" : undefined}
          />
          {fieldErrors.heure && (
            <span id="heure-error" className="contact-form__error" role="alert">
              {fieldErrors.heure}
            </span>
          )}
        </div>

        <div className="contact-form__field">
          <label htmlFor="nbPersonnes">Personnes *</label>
          <input
            id="nbPersonnes"
            name="nbPersonnes"
            type="number"
            min={1}
            max={30}
            value={form.nbPersonnes}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.nbPersonnes)}
            aria-describedby={
              fieldErrors.nbPersonnes ? "nbPersonnes-error" : undefined
            }
          />
          {fieldErrors.nbPersonnes && (
            <span
              id="nbPersonnes-error"
              className="contact-form__error"
              role="alert"
            >
              {fieldErrors.nbPersonnes}
            </span>
          )}
        </div>
      </div>

      <p className="contact-form__hint">
        Les réservations sont confirmées par le restaurant. Nous vous
        recontactons par téléphone ou e-mail.
      </p>

      <div className="contact-form__field">
        <label htmlFor="commentaire">Commentaire</label>
        <textarea
          id="commentaire"
          name="commentaire"
          rows={4}
          maxLength={2000}
          placeholder="Allergies, occasion spéciale, demande particulière…"
          value={form.commentaire}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.commentaire)}
          aria-describedby={
            fieldErrors.commentaire ? "commentaire-error" : undefined
          }
        />
        {fieldErrors.commentaire && (
          <span
            id="commentaire-error"
            className="contact-form__error"
            role="alert"
          >
            {fieldErrors.commentaire}
          </span>
        )}
      </div>

      {fieldErrors._form && (
        <p
          className="contact-form__error contact-form__error--global"
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
        {status === "loading" ? "Envoi en cours…" : "Demander une réservation"}
      </button>
    </form>
  );
}

export default ReservationForm;
