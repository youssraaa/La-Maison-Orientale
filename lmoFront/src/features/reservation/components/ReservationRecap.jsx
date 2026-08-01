import { fullClientName, fullPhoneNumber } from "../utils/validateReservationForm";

function formatDateFr(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function RecapRow({ label, value, placeholder }) {
  const filled = Boolean(value);
  return (
    <div className={`res-ticket__row${filled ? " is-filled" : ""}`}>
      <dt>{label}</dt>
      <dd>{filled ? value : placeholder}</dd>
    </div>
  );
}

function ReservationRecap({ form, step, status }) {
  const name = fullClientName(form.prenom, form.nomFamille);
  const phone = form.telephone?.trim()
    ? fullPhoneNumber(form.telephone, form.phoneIso)
    : "";
  const dateLabel = formatDateFr(form.date);
  const covers = form.nbPersonnes
    ? `${form.nbPersonnes} personne${Number(form.nbPersonnes) > 1 ? "s" : ""}`
    : "";
  const isSuccess = status === "success";
  const progress = isSuccess ? 100 : Math.min(95, ((step - 1) / 2) * 100 + (form.heure ? 15 : 0));

  return (
    <aside className="res-ticket" aria-live="polite" aria-label="Récapitulatif de réservation">
      <div className="res-ticket__seal" aria-hidden="true">
        <span>LMO</span>
      </div>

      <header className="res-ticket__head">
        <p className="res-ticket__eyebrow">Votre table</p>
        <h2 className="res-ticket__title">
          {isSuccess ? "Réservée" : "En préparation"}
        </h2>
        <p className="res-ticket__brand">La Maison Orientale</p>
      </header>

      <div className="res-ticket__progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <dl className="res-ticket__body">
        <RecapRow label="Date" value={dateLabel} placeholder="Choisir une date" />
        <RecapRow label="Heure" value={form.heure || ""} placeholder="Choisir un créneau" />
        <RecapRow label="Couverts" value={covers} placeholder="Nombre de convives" />
        <RecapRow
          label="Nom"
          value={name}
          placeholder={step < 2 ? "Après le créneau" : "Prénom et nom"}
        />
        <RecapRow
          label="Téléphone"
          value={phone}
          placeholder={step < 2 ? "—" : "Votre numéro"}
        />
        <RecapRow
          label="E-mail"
          value={form.email?.trim() || ""}
          placeholder={step < 2 ? "—" : "Pour la confirmation"}
        />
        {form.commentaire?.trim() ? (
          <RecapRow label="Note" value={form.commentaire.trim()} placeholder="" />
        ) : null}
      </dl>

      <footer className="res-ticket__foot">
        {isSuccess ? (
          <p className="res-ticket__status is-ok">Confirmation immédiate · table gardée</p>
        ) : (
          <p className="res-ticket__status">
            {step === 1 && "Étape 1 · Date, couverts & heure"}
            {step === 2 && "Étape 2 · Vos coordonnées"}
            {step === 3 && "Étape 3 · Validez pour confirmer"}
          </p>
        )}
      </footer>
    </aside>
  );
}

export default ReservationRecap;
