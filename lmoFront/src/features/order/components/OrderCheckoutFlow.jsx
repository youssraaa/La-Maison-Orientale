import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "../../menu/data/menuData";
import { restaurantInfo } from "../../../common/data/restaurantInfo";
import {
  composeDeliveryAddress,
  isValidDeliveryAddress,
} from "../../../common/utils/contactFieldValidation";
import { PAYMENT_METHODS, getPaymentMethodsForMode } from "../utils/paymentMethods";
import OrderModeToggle from "./OrderModeToggle";
import {
  DEFAULT_MAX_DELIVERY_KM,
  getPostalCodeZoneError,
  validateDeliveryZone,
} from "../utils/deliveryZone";

function PaymentIcon({ type }) {
  if (type === "ESPECES") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="7" width="18" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="12" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }
  if (type === "BANCONTACT") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path d="M7 15h4M13 15h4M7 11h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "PAYPAL") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 7h9.5c2.2 0 3.5 1.4 3.2 3.5-.3 2.1-2 3.5-4.2 3.5H9.8L8.5 19H5.5L7 7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function Field({
  label,
  hint,
  error,
  children,
  required = false,
}) {
  return (
    <label className={`order-pay__field${error ? " order-pay__field--invalid" : ""}`}>
      <span className="order-pay__field-label">
        {label}
        {required ? <em aria-hidden="true"> *</em> : null}
      </span>
      {hint ? <span className="order-pay__field-hint">{hint}</span> : null}
      {children}
      {error ? <span className="order-pay__field-error">{error}</span> : null}
    </label>
  );
}

export default function OrderCheckoutFlow({
  form,
  onFormChange,
  fieldErrors = {},
  mode,
  onModeChange,
  items,
  totalPrice,
  deliveryFee = 0,
  orderTotal,
  paymentMethod,
  onPaymentMethodChange,
  onBack,
  onSubmit,
  loading = false,
  error = "",
  embedded = false,
  checkoutFocus = null,
  onClearCheckoutFocus,
  maxDeliveryKm = DEFAULT_MAX_DELIVERY_KM,
}) {
  const payableTotal = orderTotal ?? totalPrice + deliveryFee;
  const paymentOptions = useMemo(() => getPaymentMethodsForMode(mode), [mode]);
  const [showItems, setShowItems] = useState(false);
  const [zoneStatus, setZoneStatus] = useState({ state: "idle", message: "", distanceKm: null });
  const contactRef = useRef(null);
  const addressRef = useRef(null);
  const submitRef = useRef(null);

  const composedAddress = useMemo(() => composeDeliveryAddress(form), [form]);
  const showMap = mode === "LIVRAISON" && isValidDeliveryAddress(form);
  const postalZoneError = mode === "LIVRAISON" ? getPostalCodeZoneError(form.adresseCp) : null;

  useEffect(() => {
    if (mode !== "LIVRAISON" || !isValidDeliveryAddress(form)) {
      setZoneStatus({ state: "idle", message: "", distanceKm: null });
      return undefined;
    }

    if (postalZoneError) {
      setZoneStatus({ state: "error", message: postalZoneError, distanceKm: null });
      return undefined;
    }

    let cancelled = false;
    setZoneStatus({ state: "checking", message: "Vérification de la zone de livraison…", distanceKm: null });

    const timer = window.setTimeout(async () => {
      const result = await validateDeliveryZone(composedAddress, form, maxDeliveryKm);
      if (cancelled) return;

      if (!result.ok) {
        setZoneStatus({ state: "error", message: result.message, distanceKm: result.estimate?.distanceKm ?? null });
        return;
      }

      const distanceKm = result.estimate?.distanceKm;
      setZoneStatus({
        state: "ok",
        message:
          distanceKm != null
            ? `Adresse dans la zone de livraison (${distanceKm} km du restaurant).`
            : "Adresse dans la zone de livraison.",
        distanceKm,
      });
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mode, form, composedAddress, postalZoneError, maxDeliveryKm]);

  useEffect(() => {
    if (!checkoutFocus) return;
    const target =
      checkoutFocus === "contact"
        ? contactRef.current
        : checkoutFocus === "address"
          ? addressRef.current
          : submitRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    onClearCheckoutFocus?.();
  }, [checkoutFocus, onClearCheckoutFocus]);

  useEffect(() => {
    if (error && submitRef.current) {
      submitRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [error]);

  return (
    <div className={`order-pay${embedded ? " order-pay--embedded" : ""}`}>
      <header className="order-pay__header">
        <button type="button" className="order-pay__back" onClick={onBack} aria-label="Retour au panier">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="order-pay__header-text">
          <p className="order-pay__step">Étape 2 · Détails</p>
          <h1>Détails de la commande</h1>
        </div>
        <span aria-hidden="true" />
      </header>

      <div className="order-pay__scroll">
        <div className="order-pay__block order-pay__block--mode">
          <OrderModeToggle
            mode={mode}
            onModeChange={onModeChange}
            className="order-mode-toggle--checkout"
          />
        </div>

        <section ref={contactRef} className="order-pay__section order-pay__section--details">
          <div className="order-pay__section-head">
            <h2>Vos coordonnées</h2>
          </div>
          <div className="order-pay__form-grid">
            <Field label="Nom complet" error={fieldErrors.nom} required>
              <input
                value={form.nom ?? ""}
                onChange={(e) => onFormChange("nom", e.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.nom)}
              />
            </Field>
            <Field label="E-mail" error={fieldErrors.email} required>
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => onFormChange("email", e.target.value)}
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
              />
            </Field>
            <Field label="Téléphone mobile" error={fieldErrors.telephone} required>
              <input
                type="tel"
                inputMode="tel"
                value={form.telephone ?? ""}
                onChange={(e) => onFormChange("telephone", e.target.value)}
                autoComplete="tel"
                aria-invalid={Boolean(fieldErrors.telephone)}
              />
            </Field>
          </div>
        </section>

        {mode === "LIVRAISON" ? (
          <section ref={addressRef} className="order-pay__section order-pay__section--address">
            <div className="order-pay__section-head">
              <h2>Adresse de livraison</h2>
            </div>
            <div className="order-pay__form-grid order-pay__form-grid--address">
              <Field label="Rue" error={fieldErrors.adresseRue} required>
                <input
                  value={form.adresseRue ?? ""}
                  onChange={(e) => onFormChange("adresseRue", e.target.value)}
                  placeholder="Rue de la Paix"
                  autoComplete="address-line1"
                  aria-invalid={Boolean(fieldErrors.adresseRue)}
                />
              </Field>
              <Field label="Numéro" error={fieldErrors.adresseNumero} required>
                <input
                  value={form.adresseNumero ?? ""}
                  onChange={(e) => onFormChange("adresseNumero", e.target.value)}
                  placeholder="12"
                  autoComplete="address-line2"
                  aria-invalid={Boolean(fieldErrors.adresseNumero)}
                />
              </Field>
              <Field label="Code postal" error={fieldErrors.adresseCp} required>
                <input
                  value={form.adresseCp ?? ""}
                  onChange={(e) => onFormChange("adresseCp", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="7000"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  aria-invalid={Boolean(fieldErrors.adresseCp || postalZoneError)}
                />
              </Field>
              <Field label="Commune" error={fieldErrors.adresseVille} required>
                <input
                  value={form.adresseVille ?? ""}
                  onChange={(e) => onFormChange("adresseVille", e.target.value)}
                  placeholder="Mons"
                  autoComplete="address-level2"
                  aria-invalid={Boolean(fieldErrors.adresseVille)}
                />
              </Field>
            </div>
            {zoneStatus.state === "error" && !postalZoneError ? (
              <p className="order-pay__zone-notice order-pay__zone-notice--error" role="alert">
                {zoneStatus.message}
              </p>
            ) : null}
            {!postalZoneError && zoneStatus.state === "checking" ? (
              <p className="order-pay__zone-notice order-pay__zone-notice--checking">{zoneStatus.message}</p>
            ) : null}
            {!postalZoneError && zoneStatus.state === "ok" ? (
              <p className="order-pay__zone-notice order-pay__zone-notice--ok">{zoneStatus.message}</p>
            ) : null}
            {showMap ? (
              <div className="order-pay__map-wrap">
                <p className="order-pay__map-label">Aperçu de l&apos;adresse</p>
                <div className="order-pay__map" aria-hidden="true">
                  <iframe
                    title="Carte de livraison"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(composedAddress)}&z=15&output=embed`}
                  />
                  <span className="order-pay__map-pin" />
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="order-pay__section order-pay__section--timing">
          <div className="order-pay__section-head">
            <h2>Quand souhaitez-vous recevoir la commande ?</h2>
          </div>
          <div className="order-pay__timing-cards">
            <label className="order-pay__timing-card is-active">
              <input type="radio" name="order-timing" defaultChecked readOnly />
              <strong>Dès que possible</strong>
              <span>
                {mode === "LIVRAISON"
                  ? "Livraison estimée sous 25 à 45 minutes"
                  : "Prête à emporter sous 15 minutes"}
              </span>
            </label>
            <label className="order-pay__timing-card is-disabled" title="Bientôt disponible">
              <input type="radio" name="order-timing" disabled />
              <strong>Plus tard</strong>
              <span>Planification à venir</span>
            </label>
          </div>
        </section>

        <section className="order-pay__section order-pay__section--notes">
          <div className="order-pay__section-head">
            <h2>Notes pour le livreur</h2>
          </div>
          <Field label="Instructions (facultatif)" error={fieldErrors.commentaire}>
            <textarea
              rows={3}
              maxLength={200}
              value={form.commentaire ?? ""}
              onChange={(e) => onFormChange("commentaire", e.target.value)}
              placeholder="Ex. sonnette en panne, merci d'appeler à l'arrivée…"
            />
          </Field>
        </section>

        <section className="order-pay__section order-pay__section--summary">
          <div className="order-pay__section-head">
            <h2>Résumé commande</h2>
          </div>
          <button type="button" className="order-pay__row" onClick={() => setShowItems((v) => !v)}>
            <span className="order-pay__brand-mark" aria-hidden="true">
              LMO
            </span>
            <span className="order-pay__row-text">
              <strong>{restaurantInfo.name}</strong>
              <em>
                {items.length} article{items.length > 1 ? "s" : ""}
              </em>
            </span>
          </button>
          {showItems ? (
            <ul className="order-pay__items">
              {items.map((item) => (
                <li key={item.platId}>
                  <span>
                    {item.quantite}× {item.nom}
                  </span>
                  <strong>{formatPrice(item.prix * item.quantite)}</strong>
                </li>
              ))}
            </ul>
          ) : null}
          <dl className="order-pay__totals">
            <div>
              <dt>Sous-total</dt>
              <dd>{formatPrice(totalPrice)}</dd>
            </div>
            {mode === "LIVRAISON" ? (
              <div>
                <dt>Frais de livraison</dt>
                <dd>{formatPrice(deliveryFee)}</dd>
              </div>
            ) : null}
            <div className="order-pay__totals-total">
              <dt>Montant total</dt>
              <dd>{formatPrice(payableTotal)}</dd>
            </div>
          </dl>
        </section>

        <section className="order-pay__section order-pay__section--payment">
          <div className="order-pay__section-head">
            <h2>Mode de paiement</h2>
          </div>
          <div className="order-pay__payment-list" role="radiogroup" aria-label="Mode de paiement">
            {paymentOptions.map((method) => {
              const active = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`order-pay__payment${active ? " is-active" : ""}`}
                  onClick={() => onPaymentMethodChange?.(method.id)}
                >
                  <span className="order-pay__row-icon">
                    <PaymentIcon type={method.id} />
                  </span>
                  <span className="order-pay__row-text">
                    <strong>{method.label}</strong>
                    <em>{method.description}</em>
                  </span>
                  <span className="order-pay__payment-check" aria-hidden="true">
                    {active ? "●" : "○"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <form ref={submitRef} className="order-pay__submit-wrap" onSubmit={onSubmit}>
        {error ? (
          <p className="order-pay__error order-pay__error--submit" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="order-pay__submit"
          disabled={loading || (mode === "LIVRAISON" && (Boolean(postalZoneError) || zoneStatus.state === "error" || zoneStatus.state === "checking"))}
        >
          {loading ? "Envoi en cours…" : `Confirmer la commande · ${formatPrice(payableTotal)}`}
        </button>
        <p className="order-pay__legal">
          En confirmant, vous acceptez les conditions de commande de {restaurantInfo.name}.
        </p>
      </form>
    </div>
  );
}
