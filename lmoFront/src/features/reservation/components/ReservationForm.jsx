import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClientAuth } from "../../../common/auth/ClientAuthContext";
import { fetchClientProfile } from "../../client/api/clientAccountApi";
import { fetchAvailability, submitReservation } from "../api/reservationApi";
import {
  buildDateOptions,
  buildTimeSlots,
} from "../utils/reservationAvailability";
import { DEFAULT_PHONE_ISO } from "../utils/phoneDialCodes";
import {
  EMAIL_FORMAT_EXAMPLE,
  PHONE_NATIONAL_EXAMPLE,
  sanitizePhoneNationalInput,
} from "../../../common/utils/contactFieldValidation";
import {
  firstContactErrorField,
  fullClientName,
  fullPhoneNumber,
  clearFieldErrors,
  DATETIME_FIELD_KEYS,
  hasFieldErrors,
  hasValidationErrors,
  profileToContactFields,
  validateStepContact,
  validateStepDateTime,
  CONTACT_FIELD_ORDER,
} from "../utils/validateReservationForm";
import { mapReservationApiErrors, mergeApiError } from "../../../common/utils/formErrors";
import PhoneCountrySelect from "./PhoneCountrySelect";
import ReservationAlert from "./ReservationAlert";
import ReservationDateCalendar from "./ReservationDateCalendar";
import {
  ReservationPolicyToggle,
  ReservationTip,
} from "./ReservationInfoBlock";
import ReservationRecap from "./ReservationRecap";
import ReservationSuccess from "./ReservationSuccess";
import useReservationPolicy from "../hooks/useReservationPolicy";
import {
  clearReservationSuccess,
  loadReservationSuccess,
  saveReservationSuccess,
} from "../utils/reservationSuccessStorage";

const STEPS = [
  { id: 1, label: "Créneau" },
  { id: 2, label: "Coordonnées" },
  { id: 3, label: "Confirmée" },
];

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
  const location = useLocation();
  const { token, user, isClientAuthenticated } = useClientAuth();
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
  const [reservationCancelled, setReservationCancelled] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [manageUrl, setManageUrl] = useState("");
  const [reservationModified, setReservationModified] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { policy } = useReservationPolicy();
  const maxOnlineCovers = policy.maxOnlineCovers;
  const coverPresets = useMemo(
    () => Array.from({ length: maxOnlineCovers }, (_, index) => index + 1),
    [maxOnlineCovers]
  );

  const dateStripRef = useRef(null);
  const profilePrefilledRef = useRef(false);
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const coversValue = Number(form.nbPersonnes) || 2;
  const availableSlots = timeSlots.filter((s) => s.available);

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

  useEffect(() => {
    const saved = loadReservationSuccess();
    if (!saved?.form) return;
    setForm((prev) => ({ ...prev, ...saved.form }));
    setStep(2);
    setStatus("success");
    setSuccessMessage(saved.successMessage || "");
    setManageUrl(saved.manageUrl || "");
    setReservationCancelled(Boolean(saved.cancelled));
    setReservationModified(Boolean(saved.modified));
  }, []);

  useEffect(() => {
    if (!location.state?.restoreSuccess) return;
    const saved = loadReservationSuccess();
    if (!saved?.form) return;
    setForm((prev) => ({ ...prev, ...saved.form }));
    setStep(2);
    setStatus("success");
    setSuccessMessage(saved.successMessage || "");
    setManageUrl(saved.manageUrl || "");
    setReservationCancelled(Boolean(saved.cancelled));
    setReservationModified(Boolean(saved.modified));
    window.history.replaceState({}, document.title);
  }, [location.state?.restoreSuccess]);

  useEffect(() => {
    if (location.state?.resumeStep === 2 && status !== "success") {
      setStep(2);
    }
  }, [location.state?.resumeStep, status]);

  useEffect(() => {
    if (!token || !isClientAuthenticated) {
      profilePrefilledRef.current = false;
      return;
    }
    if (profilePrefilledRef.current) return;

    let cancelled = false;
    fetchClientProfile(token)
      .then((profile) => {
        if (cancelled) return;
        profilePrefilledRef.current = true;
        const contact = profileToContactFields(profile);
        setForm((prev) => ({
          ...prev,
          prenom: prev.prenom || contact.prenom,
          nomFamille: prev.nomFamille || contact.nomFamille,
          email: prev.email || contact.email,
          phoneIso: prev.telephone ? prev.phoneIso : contact.phoneIso,
          telephone: prev.telephone || contact.telephone,
        }));
      })
      .catch(() => {
        if (!cancelled && user) {
          profilePrefilledRef.current = true;
          const contact = profileToContactFields(user);
          setForm((prev) => ({
            ...prev,
            email: prev.email || contact.email,
            prenom: prev.prenom || contact.prenom,
            nomFamille: prev.nomFamille || contact.nomFamille,
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, isClientAuthenticated, user]);

  function updateField(name, value) {
    const nextValue = name === "telephone" ? sanitizePhoneNationalInput(value) : value;
    setForm((prev) => {
      const next = { ...prev, [name]: nextValue };
      if (name === "date" || name === "nbPersonnes") next.heure = "";
      return next;
    });
    setFieldErrors((prev) =>
      clearFieldErrors(
        prev,
        ...(name === "date" || name === "nbPersonnes" ? [name, "heure"] : [name])
      )
    );
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
    updateField("nbPersonnes", String(n));
  }

  function goNextFromStep1() {
    const errors = validateStepDateTime(form, maxOnlineCovers);
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

  async function handleConfirm() {
    const errors = {
      ...validateStepDateTime(form, maxOnlineCovers),
      ...validateStepContact(form),
    };
    if (hasValidationErrors(errors)) {
      setFieldErrors(errors);
      const contactOnly = !Object.keys(errors).some((k) =>
        ["date", "heure", "nbPersonnes"].includes(k)
      );
      if (contactOnly) {
        const first = firstContactErrorField(errors);
        requestAnimationFrame(() => {
          const el = document.getElementById(first === "telephone" ? "telephone" : first);
          el?.focus?.();
          el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
        });
      } else {
        setStep(1);
      }
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
      const result = await submitReservation(payload, token);
      const message =
        result.message ||
        "Votre table est réservée. À bientôt à La Maison Orientale !";
      setStatus("success");
      setSuccessMessage(message);
      setManageUrl(result.manageUrl || "");
      saveReservationSuccess({
        form: {
          prenom: form.prenom,
          nomFamille: form.nomFamille,
          email: form.email,
          telephone: form.telephone,
          phoneIso: form.phoneIso,
          date: form.date,
          heure: form.heure,
          nbPersonnes: form.nbPersonnes,
          commentaire: form.commentaire,
        },
        successMessage: message,
        manageUrl: result.manageUrl || "",
        cancelled: false,
        modified: false,
      });
    } catch (error) {
      setStatus("error");
      const mapped = mapReservationApiErrors(mergeApiError(error));
      setFieldErrors(mapped);
      if (mapped.date || mapped.heure || mapped.nbPersonnes || error.message?.toLowerCase().includes("créneau")) {
        setStep(1);
      }
    }
  }

  function startNewReservation() {
    clearReservationSuccess();
    sessionStorage.removeItem("lmo_manage_from_reservation");
    const dates = buildDateOptions();
    const firstOpen = dates.find((d) => !d.closed);
    setForm({ ...initialForm, date: firstOpen?.iso ?? "" });
    setTimeSlots([]);
    setFieldErrors({});
    setSuccessMessage("");
    setManageUrl("");
    setReservationCancelled(false);
    setReservationModified(false);
    setStatus("idle");
    setCalendarOpen(false);
    setStep(1);
  }

  const showTicket = step >= 2 || status === "success";

  return (
    <div className={`res-desk${showTicket ? "" : " res-desk--solo"}`}>
      <div className="res-desk__main">
        <nav className="res-rail" aria-label="Étapes de réservation">
          {(status === "success" ? STEPS : STEPS.slice(0, 2)).map((s) => {
            const isSuccess = status === "success";
            const isActive = isSuccess ? s.id === 3 : step === s.id;
            const isDone = isSuccess ? s.id <= 3 : step > s.id;
            return (
              <div
                key={s.id}
                className={`res-rail__item${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
              >
                <span className="res-rail__num" aria-hidden="true">
                  {isSuccess || (isDone && !isActive) ? "✓" : s.id}
                </span>
                <span className="res-rail__label">{s.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="res-panel">
          {step === 1 && (
            <div className="res-panel__intro">
              <ReservationTip />
              <ReservationPolicyToggle />
            </div>
          )}

          {status === "success" && (
            <div className="res-panel__intro">
              <ReservationPolicyToggle />
            </div>
          )}

          {step === 1 && (
            <div className="res-step">
              <header className="res-step__head">
                <p className="res-step__kicker">Étape 1</p>
                <h3 className="res-step__title">Choisissez votre moment</h3>
              </header>

              {hasFieldErrors(fieldErrors, DATETIME_FIELD_KEYS) && (
                <ReservationAlert
                  className="res-alert--summary"
                  title="Informations incomplètes"
                >
                  Vérifiez la date, le nombre de couverts et le créneau sélectionné.
                </ReservationAlert>
              )}

              <section className="res-block" aria-labelledby="res-date-label">
                <div className="res-block__head">
                  <span className="res-block__num" aria-hidden="true">
                    1
                  </span>
                  <div>
                    <h4 id="res-date-label" className="res-block__label">
                      Date <span aria-hidden="true">*</span>
                    </h4>
                    <p className="res-block__sub">Le jour de votre réservation.</p>
                  </div>
                </div>

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
                  <ReservationAlert compact title={fieldErrors.date} />
                )}
              </section>

              <section className="res-block" aria-labelledby="res-covers-label">
                <div className="res-block__head">
                  <span className="res-block__num" aria-hidden="true">
                    2
                  </span>
                  <div>
                    <h4 id="res-covers-label" className="res-block__label">
                      Couverts <span aria-hidden="true">*</span>
                    </h4>
                    <p className="res-block__sub">Combien serez-vous à table ?</p>
                  </div>
                </div>

                <div className="res-covers" role="group" aria-label="Nombre de couverts">
                  {coverPresets.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`res-cover${coversValue === n ? " is-selected" : ""}`}
                      aria-pressed={coversValue === n}
                      onClick={() => selectCovers(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {fieldErrors.nbPersonnes && (
                  <ReservationAlert compact title={fieldErrors.nbPersonnes} />
                )}
              </section>

              <section className="res-block" aria-labelledby="res-slots-label">
                <div className="res-block__head">
                  <span className="res-block__num" aria-hidden="true">
                    3
                  </span>
                  <div>
                    <h4 id="res-slots-label" className="res-block__label">
                      Créneau <span aria-hidden="true">*</span>
                    </h4>
                    <p className="res-block__sub">L&apos;horaire encore disponible.</p>
                  </div>
                </div>

                {slotsLoading && availableSlots.length === 0 && (
                  <p className="res-step__hint">Chargement des horaires…</p>
                )}
                {slotsError && (
                  <ReservationAlert title="Créneaux indisponibles">{slotsError}</ReservationAlert>
                )}
                {!slotsLoading && !slotsError && availableSlots.length === 0 && (
                  <ReservationAlert title="Aucun créneau disponible">
                    Essayez une autre date ou modifiez le nombre de couverts.
                  </ReservationAlert>
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
                  <ReservationAlert compact title={fieldErrors.heure} />
                )}
              </section>

              <div className="res-step__actions">
                <button
                  type="button"
                  className="res-cta res-cta--next"
                  onClick={goNextFromStep1}
                  disabled={!slotsLoading && availableSlots.length === 0}
                >
                  Continuer vers les coordonnées
                  <span className="res-cta__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="res-step">
              {status === "success" ? (
                <ReservationSuccess
                  form={form}
                  successMessage={successMessage}
                  manageUrl={manageUrl}
                  isClientAuthenticated={isClientAuthenticated}
                  cancelled={reservationCancelled}
                  modified={reservationModified}
                  onNewReservation={startNewReservation}
                  onCancelled={() => {
                    setReservationCancelled(true);
                    setReservationModified(false);
                    clearReservationSuccess();
                    sessionStorage.removeItem("lmo_manage_from_reservation");
                  }}
                />
              ) : (
                <>
              <header className="res-step__head res-step__head--with-action">
                <div>
                  <p className="res-step__kicker">Étape 2</p>
                  <h3 className="res-step__title">Vos coordonnées</h3>
                </div>
                {isClientAuthenticated ? (
                    <p className="res-client-badge">
                      Connecté · {user?.email}
                    </p>
                  ) : (
                    <Link
                      to="/connexion"
                      state={{ from: "/reservation", returnState: { resumeStep: 2 } }}
                      className="res-client-link"
                    >
                      Déjà client ?
                    </Link>
                  )}
              </header>

                  {hasFieldErrors(fieldErrors, CONTACT_FIELD_ORDER) && (
                    <ReservationAlert
                      className="res-alert--summary"
                      title="Coordonnées à corriger"
                    >
                      Merci de compléter les champs signalés ci-dessous.
                    </ReservationAlert>
                  )}

                  {fieldErrors._form && (
                    <ReservationAlert className="res-alert--summary" title="Réservation impossible">
                      {fieldErrors._form}
                    </ReservationAlert>
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
                      <ReservationAlert compact title={fieldErrors.prenom} />
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
                      <ReservationAlert compact title={fieldErrors.nomFamille} />
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
                      maxLength={14}
                      placeholder={PHONE_NATIONAL_EXAMPLE}
            value={form.telephone}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.telephone)}
                      required
          />
                  </div>
          {fieldErrors.telephone && (
                    <ReservationAlert compact title={fieldErrors.telephone} />
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
                    placeholder={EMAIL_FORMAT_EXAMPLE}
            value={form.email}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.email)}
                    required
          />
                  <span className="res-field__help">
                    Pour recevoir la confirmation.
                  </span>
          {fieldErrors.email && (
                    <ReservationAlert compact title={fieldErrors.email} />
          )}
        </div>

                <div className={`res-field${fieldErrors.commentaire ? " is-invalid" : ""}`}>
        <label htmlFor="commentaire">Commentaire</label>
        <textarea
          id="commentaire"
          name="commentaire"
                    rows={3}
          maxLength={2000}
                    placeholder="Occasion, demande particulière…"
          value={form.commentaire}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.commentaire)}
        />
        {fieldErrors.commentaire && (
                    <ReservationAlert compact title={fieldErrors.commentaire} />
                  )}
                </div>
      </div>

                  <div className="res-actions">
                    <button
                      type="button"
                      className="res-btn-ghost"
                      onClick={() => setStep(1)}
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
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showTicket ? (
        <div className="res-desk__side">
          <ReservationRecap
            form={form}
            step={step}
            status={reservationCancelled ? "cancelled" : status}
          />
        </div>
      ) : null}
    </div>
  );
}

export default ReservationForm;
