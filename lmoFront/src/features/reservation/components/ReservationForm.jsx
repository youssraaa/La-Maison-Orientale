import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAvailability, submitReservation } from "../api/reservationApi";
import {
  buildDateOptions,
  buildTimeSlots,
} from "../utils/reservationAvailability";
import { DEFAULT_PHONE_ISO } from "../utils/phoneDialCodes";
import {
  firstContactErrorField,
  fullClientName,
  fullPhoneNumber,
  hasValidationErrors,
  validateStepContact,
  validateStepDateTime,
} from "../utils/validateReservationForm";
import PhoneCountrySelect from "./PhoneCountrySelect";
import ReservationDateCalendar from "./ReservationDateCalendar";
import {
  ReservationPolicyToggle,
  ReservationTip,
} from "./ReservationInfoBlock";
import ReservationRecap from "./ReservationRecap";

const STEPS = [
  { id: 1, label: "Créneau" },
  { id: 2, label: "Coordonnées" },
  { id: 3, label: "Confirmer" },
];

const COVER_PRESETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const initialForm = {
  prenom: "",
  nomFamille: "",
  phoneIso: DEFAULT_PHONE_ISO,
  telephone: "",
  email: "",
  date: "",
  heure: "",
  nbPersonnes: "2",
  commentaire: "",
};

function formatDateInput(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function ReservationForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    const dates = buildDateOptions();
    const firstOpen = dates.find((d) => !d.closed);
    return {
      ...initialForm,
      date: firstOpen?.iso ?? "",
    };
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [successMessage, setSuccessMessage] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [extraCovers, setExtraCovers] = useState(false);

  const dateStripRef = useRef(null);
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const coversValue = Number(form.nbPersonnes) || 2;
  const availableSlots = timeSlots.filter((s) => s.available);
  const showExtraCovers = extraCovers || coversValue > 10;

  useEffect(() => {
    if (!form.date) {
      setTimeSlots([]);
      setSlotsError("");
      setSlotsLoading(false);
      return;
    }

    const localSlots = buildTimeSlots(form.date).map((s) => ({
      time: s.time,
      available: s.available,
      label: s.label,
    }));
    setTimeSlots(localSlots);
    setSlotsError("");

    let cancelled = false;
    setSlotsLoading(true);

    fetchAvailability(form.date, coversValue)
      .then((data) => {
        if (cancelled) return;
        const slots = data.closed ? [] : data.slots || [];
        setTimeSlots(slots);
        setSlotsError("");
        setForm((prev) => {
          if (!prev.heure) return prev;
          const stillOk = slots.some((s) => s.time === prev.heure && s.available);
          return stillOk ? prev : { ...prev, heure: "" };
        });
      })
      .catch(() => {
        if (cancelled) return;
        setSlotsError("");
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.date, coversValue]);

  function updateField(name, value) {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "date" || name === "nbPersonnes") next.heure = "";
      return next;
    });
    setFieldErrors((prev) => ({ ...prev, [name]: undefined, _form: undefined }));
    if (status === "success") {
      setStatus("idle");
      setSuccessMessage("");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    updateField(name, value);
  }

  function scrollDates(dir) {
    dateStripRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  }

  function selectDate(iso) {
    updateField("date", iso);
    setCalendarOpen(false);
  }

  function selectCovers(n) {
    setExtraCovers(false);
    updateField("nbPersonnes", String(n));
  }

  function goNextFromStep1() {
    const errors = validateStepDateTime(form);
    const selected = timeSlots.find((s) => s.time === form.heure);
    if (form.heure && selected && !selected.available) {
      errors.heure = "Ce créneau n'est plus disponible.";
    }
    if (hasValidationErrors(errors)) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStep(2);
  }

  function goNextFromStep2() {
    const errors = validateStepContact(form);
    if (hasValidationErrors(errors)) {
      setFieldErrors(errors);
      const first = firstContactErrorField(errors);
      requestAnimationFrame(() => {
        const el = document.getElementById(first === "telephone" ? "telephone" : first);
        el?.focus?.();
        el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setFieldErrors({});
    setStep(3);
  }

  async function handleConfirm() {
    const errors = {
      ...validateStepDateTime(form),
      ...validateStepContact(form),
    };
    if (hasValidationErrors(errors)) {
      setFieldErrors(errors);
      setStep(
        Object.keys(errors).some((k) =>
          ["date", "heure", "nbPersonnes"].includes(k)
        )
          ? 1
          : 2
      );
      return;
    }

    setStatus("loading");
    setFieldErrors({});
    setSuccessMessage("");

    const payload = {
      nom: fullClientName(form.prenom, form.nomFamille),
      telephone: fullPhoneNumber(form.telephone, form.phoneIso),
      email: form.email.trim(),
      date: form.date,
      heure: form.heure,
      nbPersonnes: Number(form.nbPersonnes),
      commentaire: form.commentaire.trim() || null,
    };

    try {
      const result = await submitReservation(payload);
      setStatus("success");
      setSuccessMessage(
        result.message ||
          "Votre table est réservée. À bientôt à La Maison Orientale !"
      );
    } catch (error) {
      setStatus("error");
      const errorsMap = { ...(error.fieldErrors || {}) };
      if (error.message && (!errorsMap._form || error.code !== "VALIDATION")) {
        errorsMap._form = error.message;
      }
      setFieldErrors(errorsMap);
      if (error.message?.toLowerCase().includes("créneau")) {
        setStep(1);
      }
    }
  }

  function startNewReservation() {
    const dates = buildDateOptions();
    const firstOpen = dates.find((d) => !d.closed);
    setForm({ ...initialForm, date: firstOpen?.iso ?? "" });
    setTimeSlots([]);
    setExtraCovers(false);
    setFieldErrors({});
    setSuccessMessage("");
    setStatus("idle");
    setCalendarOpen(false);
    setStep(1);
  }

  const showTicket = step >= 2 || status === "success";

  return (
    <div className={`res-desk${showTicket ? "" : " res-desk--solo"}`}>
      <div className="res-desk__main">
        <nav className="res-rail" aria-label="Étapes de réservation">
          {STEPS.map((s) => {
            const isActive = status !== "success" && step === s.id;
            const isDone = status === "success" || step > s.id;
            return (
              <div
                key={s.id}
                className={`res-rail__item${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
              >
                <span className="res-rail__num" aria-hidden="true">
                  {isDone && !isActive ? "✓" : s.id}
                </span>
                <span className="res-rail__label">{s.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="res-panel">
          <ReservationTip />

          {step === 1 && (
            <div className="res-step">
              <header className="res-step__head">
                <p className="res-step__kicker">Étape 1</p>
                <h3 className="res-step__title">Choisissez votre moment</h3>
                <p className="res-step__lead">
                  Date, couverts, puis un créneau encore libre.
                </p>
              </header>

              <section className="res-block" aria-labelledby="res-date-label">
                <h4 id="res-date-label" className="res-block__label">
                  Date <span aria-hidden="true">*</span>
                </h4>

                <div className="res-dates">
                  <div
                    className="res-dates__strip"
                    ref={dateStripRef}
                    role="listbox"
                    aria-label="Dates disponibles"
                  >
                    {dateOptions.map((opt) => (
                      <button
                        key={opt.iso}
                        type="button"
                        role="option"
                        disabled={opt.closed}
                        aria-selected={form.date === opt.iso}
                        className={`res-date${form.date === opt.iso ? " is-selected" : ""}${opt.closed ? " is-closed" : ""}`}
                        onClick={() => selectDate(opt.iso)}
                      >
                        <span className="res-date__day">{opt.weekday}</span>
                        <span className="res-date__num">{opt.dayNum}</span>
                        {opt.closed && (
                          <span className="res-date__note">Fermé</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="res-dates__nav">
                    <button
                      type="button"
                      className="res-dates__arrow"
                      onClick={() => scrollDates(-1)}
                      aria-label="Dates précédentes"
                    >
                      ‹
                    </button>
                    <div className="res-dates__track" aria-hidden="true" />
                    <button
                      type="button"
                      className="res-dates__arrow"
                      onClick={() => scrollDates(1)}
                      aria-label="Dates suivantes"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="res-date-field">
                  <input
                    type="text"
                    readOnly
                    value={formatDateInput(form.date)}
                    aria-label="Date sélectionnée"
                    onClick={() => setCalendarOpen((v) => !v)}
                  />
                  <button
                    type="button"
                    className="res-date-field__btn"
                    aria-expanded={calendarOpen}
                    aria-controls="reservation-date-calendar"
                    onClick={() => setCalendarOpen((v) => !v)}
                    aria-label="Ouvrir le calendrier"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
                      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {calendarOpen && (
                  <div id="reservation-date-calendar">
                    <ReservationDateCalendar
                      value={form.date}
                      onChange={selectDate}
                    />
                  </div>
                )}

                {fieldErrors.date && (
                  <p className="contact-form__error" role="alert">
                    {fieldErrors.date}
                  </p>
                )}
              </section>

              <section className="res-block" aria-labelledby="res-covers-label">
                <h4 id="res-covers-label" className="res-block__label">
                  Couverts <span aria-hidden="true">*</span>
                </h4>

                <div className="res-covers" role="group" aria-label="Nombre de couverts">
                  {COVER_PRESETS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`res-cover${coversValue === n && !showExtraCovers ? " is-selected" : ""}`}
                      aria-pressed={coversValue === n && !showExtraCovers}
                      onClick={() => selectCovers(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`res-cover res-cover--more${showExtraCovers ? " is-selected" : ""}`}
                    aria-pressed={showExtraCovers}
                    onClick={() => {
                      setExtraCovers(true);
                      if (coversValue <= 10) updateField("nbPersonnes", "11");
                    }}
                    aria-label="Plus de 10 personnes"
                  >
                    +
                  </button>
                </div>

                {showExtraCovers && (
                  <label className="res-covers__extra">
                    <span>Plus de 10</span>
                    <select
                      name="nbPersonnes"
                      value={coversValue > 10 ? form.nbPersonnes : "11"}
                      onChange={handleChange}
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 11).map((n) => (
                        <option key={n} value={n}>
                          {n} personnes
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {fieldErrors.nbPersonnes && (
                  <p className="contact-form__error" role="alert">
                    {fieldErrors.nbPersonnes}
                  </p>
                )}
              </section>

              <section className="res-block" aria-labelledby="res-slots-label">
                <h4 id="res-slots-label" className="res-block__label">
                  Créneau <span aria-hidden="true">*</span>
                </h4>

                {slotsLoading && availableSlots.length === 0 && (
                  <p className="res-step__hint">Chargement des horaires…</p>
                )}
                {slotsError && (
                  <span className="contact-form__error" role="alert">
                    {slotsError}
                  </span>
                )}
                {!slotsLoading && !slotsError && availableSlots.length === 0 && (
                  <p className="res-step__hint">
                    Aucun créneau disponible pour cette date.
                  </p>
                )}
                {availableSlots.length > 0 && (
                  <div className="res-slots" role="listbox" aria-label="Créneaux disponibles">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        role="option"
                        aria-selected={form.heure === slot.time}
                        className={`res-slot${form.heure === slot.time ? " is-selected" : ""}`}
                        onClick={() => updateField("heure", slot.time)}
                      >
                        <span className="res-slot__time">{slot.time}</span>
                        <span className="res-slot__status">Libre</span>
                      </button>
                    ))}
                  </div>
                )}
                {fieldErrors.heure && (
                  <span className="contact-form__error" role="alert">
                    {fieldErrors.heure}
                  </span>
                )}
              </section>

              <button
                type="button"
                className="res-cta"
                onClick={goNextFromStep1}
              >
                Continuer vers les coordonnées
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="res-step">
              <header className="res-step__head">
                <p className="res-step__kicker">Étape 2</p>
                <h3 className="res-step__title">Vos coordonnées</h3>
                <p className="res-step__lead">
                  Téléphone et e-mail sont tous les deux requis. Le ticket à droite
                  reprend votre créneau.
                </p>
              </header>

              {Object.keys(fieldErrors).some((k) =>
                ["prenom", "nomFamille", "telephone", "email", "commentaire"].includes(k)
              ) && (
                <div className="res-error-summary" role="alert">
                  Merci de corriger les champs en rouge ci-dessous.
                </div>
              )}

              <div className="res-contact">
                <div className="res-contact__row">
                  <div className={`res-field${fieldErrors.prenom ? " is-invalid" : ""}`}>
                    <label htmlFor="prenom">
                      Prénom <span className="res-req" aria-label="obligatoire">*</span>
                    </label>
                    <input
                      id="prenom"
                      name="prenom"
                      type="text"
                      autoComplete="given-name"
                      maxLength={50}
                      placeholder="Sarah"
                      value={form.prenom}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.prenom)}
                      required
                    />
                    {fieldErrors.prenom && (
                      <span className="contact-form__error" role="alert">
                        {fieldErrors.prenom}
                      </span>
                    )}
                  </div>

                  <div className={`res-field${fieldErrors.nomFamille ? " is-invalid" : ""}`}>
                    <label htmlFor="nomFamille">
                      Nom <span className="res-req" aria-label="obligatoire">*</span>
                    </label>
                    <input
                      id="nomFamille"
                      name="nomFamille"
                      type="text"
                      autoComplete="family-name"
                      maxLength={50}
                      placeholder="Dupont"
                      value={form.nomFamille}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.nomFamille)}
                      required
                    />
                    {fieldErrors.nomFamille && (
                      <span className="contact-form__error" role="alert">
                        {fieldErrors.nomFamille}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`res-field res-field--phone${fieldErrors.telephone ? " is-invalid" : ""}`}
                >
                  <label htmlFor="telephone">
                    Téléphone <span className="res-req" aria-label="obligatoire">*</span>
                  </label>
                  <div className="reservation-phone">
                    <PhoneCountrySelect
                      id="phoneIso"
                      value={form.phoneIso}
                      onChange={(iso) => updateField("phoneIso", iso)}
                    />
                    <input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      maxLength={16}
                      placeholder="470 12 34 56"
                      value={form.telephone}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors.telephone)}
                      required
                    />
                  </div>
                  {fieldErrors.telephone && (
                    <span className="contact-form__error" role="alert">
                      {fieldErrors.telephone}
                    </span>
                  )}
                </div>

                <div className={`res-field${fieldErrors.email ? " is-invalid" : ""}`}>
                  <label htmlFor="email">
                    E-mail <span className="res-req" aria-label="obligatoire">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    placeholder="sarah.dupont@email.com"
                    value={form.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.email)}
                    required
                  />
                  <span className="res-field__help">
                    Pour recevoir la confirmation.
                  </span>
                  {fieldErrors.email && (
                    <span className="contact-form__error" role="alert">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div className={`res-field${fieldErrors.commentaire ? " is-invalid" : ""}`}>
                  <label htmlFor="commentaire">Commentaire</label>
                  <textarea
                    id="commentaire"
                    name="commentaire"
                    rows={3}
                    maxLength={2000}
                    placeholder="Allergies, occasion, demande particulière…"
                    value={form.commentaire}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.commentaire)}
                  />
                  {fieldErrors.commentaire && (
                    <span className="contact-form__error" role="alert">
                      {fieldErrors.commentaire}
                    </span>
                  )}
                </div>
              </div>

              <div className="res-actions">
                <button type="button" className="res-btn-ghost" onClick={() => setStep(1)}>
                  Retour
                </button>
                <button type="button" className="res-cta" onClick={goNextFromStep2}>
                  Voir la confirmation
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="res-step">
              <header className="res-step__head">
                <p className="res-step__kicker">Étape 3</p>
                <h3 className="res-step__title">
                  {status === "success" ? "Table réservée" : "Dernier regard"}
                </h3>
                <p className="res-step__lead">
                  {status === "success"
                    ? "Le détail de votre table reste affiché à droite."
                    : "Vérifiez le ticket à droite, puis confirmez. La table est réservée immédiatement."}
                </p>
              </header>

              {fieldErrors._form && (
                <p className="contact-form__error contact-form__error--global" role="alert">
                  {fieldErrors._form}
                </p>
              )}

              {successMessage && (
                <p className="res-success" role="status">
                  {successMessage}
                </p>
              )}

              {status === "success" ? (
                <div className="res-actions">
                  <Link to="/" className="res-btn-ghost">
                    Retour à l’accueil
                  </Link>
                  <button
                    type="button"
                    className="res-cta"
                    onClick={startNewReservation}
                  >
                    Nouvelle réservation
                  </button>
                </div>
              ) : (
                <div className="res-actions">
                  <button
                    type="button"
                    className="res-btn-ghost"
                    onClick={() => setStep(2)}
                    disabled={status === "loading"}
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    className="res-cta"
                    onClick={handleConfirm}
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Réservation…" : "Réserver ma table"}
                  </button>
                </div>
              )}
            </div>
          )}

          <ReservationPolicyToggle />
        </div>
      </div>

      {showTicket ? (
        <div className="res-desk__side">
          <ReservationRecap form={form} step={step} status={status} />
        </div>
      ) : null}
    </div>
  );
}

export default ReservationForm;
