import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import horairesApi from "../api/horairesApi";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";
import OpsTimePicker from "../components/OpsTimePicker";

const EMPTY = {
  capaciteMaxCreneau: 50,
  capaciteSalle: 34,
  capaciteTerrasse: 16,
  dureeCreneauMinutes: 30,
  dureeTableMinutes: 90,
  dureeTableClientMinutes: 120,
  delaiModificationHeures: 2,
  seuilAnnulationEnLignePersonnes: 10,
  horizonReservationJours: 60,
  heureOuvertureDefaut: "12:00",
  heureFermetureDefaut: "22:30",
  emailNotifRestaurant: "",
  fraisLivraison: 2.5,
  montantMinimumLivraison: 25,
};

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z" />
    </svg>
  );
}

function SectionHead({ icon, iconClass, title, sub }) {
  return (
    <div className="horaire-section__head">
      <div className={`horaire-section__head-icon ${iconClass || ""}`}>
        {icon}
      </div>
      <div>
        <h2 className="horaire-section__title">{title}</h2>
        <p className="horaire-section__sub">{sub}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="sett-field">
      <span className="sett-field__label">{label}</span>
      {children}
      {hint ? <span className="sett-field__hint">{hint}</span> : null}
    </label>
  );
}

function NumberInput({ value, onChange, min, max, step, required }) {
  return (
    <input type="number" min={min} max={max} step={step}
      className="sett-field__input sett-field__input--number"
      value={value} onChange={onChange} required={required} />
  );
}

function RestaurantSettingsPage() {
  const { token, logout } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const recommendedTotal = Number(form.capaciteSalle || 0) + Number(form.capaciteTerrasse || 0);
  const totalCapacity = Number(form.capaciteSalle || 0) + Number(form.capaciteTerrasse || 0);
  const sallePct = totalCapacity > 0 ? (Number(form.capaciteSalle || 0) / totalCapacity) * 100 : 50;
  const terrassePct = 100 - sallePct;

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await horairesApi.getSettings(token);
      setForm({ ...EMPTY, ...data });
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Impossible de charger les paramètres.");
    } finally { setLoading(false); }
  }, [token, logout]);

  useEffect(() => { load(); }, [load]);

  function onChange(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const saved = await horairesApi.updateSettings(token, {
        capaciteMaxCreneau: Number(form.capaciteMaxCreneau),
        capaciteSalle: Number(form.capaciteSalle),
        capaciteTerrasse: Number(form.capaciteTerrasse),
        dureeCreneauMinutes: Number(form.dureeCreneauMinutes),
        dureeTableMinutes: Number(form.dureeTableMinutes),
        dureeTableClientMinutes: Number(form.dureeTableClientMinutes),
        delaiModificationHeures: Number(form.delaiModificationHeures),
        seuilAnnulationEnLignePersonnes: Number(form.seuilAnnulationEnLignePersonnes),
        horizonReservationJours: Number(form.horizonReservationJours),
        heureOuvertureDefaut: form.heureOuvertureDefaut,
        heureFermetureDefaut: form.heureFermetureDefaut,
        emailNotifRestaurant: form.emailNotifRestaurant,
        fraisLivraison: Number(form.fraisLivraison),
        montantMinimumLivraison: Number(form.montantMinimumLivraison),
      });
      setForm({ ...EMPTY, ...saved });
      setSuccess("Paramètres enregistrés — le site client est mis à jour automatiquement.");
    } catch (err) {
      setError(err.message || "Enregistrement impossible.");
    } finally { setSaving(false); }
  }

  return (
    <AdminShell active="restaurant" title="Paramètres restaurant">
      <AdminPageShell
        pageClass="admin-ops-shell"
        title="Paramètres restaurant"
        lead="Capacité, règles, créneaux et commandes — modifiables à tout moment."
        icon={SettingsIcon}
      >
        {error ? <div className="ops-error" role="alert">{error}</div> : null}
        {success ? <div className="ops-toast" role="status">{success}</div> : null}

        {loading ? (
          <div className="ops-loading"><span className="ops-loading__spinner" /> Chargement…</div>
        ) : (
          <form className="sett-form" onSubmit={onSubmit}>

            {/* Capacité */}
            <div className="horaire-section">
              <SectionHead
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>}
                title="Capacité du restaurant"
                sub="Places en salle, en terrasse et par créneau"
              />
              <div className="sett-body">
                <div className="sett-grid sett-grid--3">
                  <Field label="Places en salle">
                    <NumberInput value={form.capaciteSalle} min={1} max={200} required
                      onChange={(e) => onChange("capaciteSalle", e.target.value)} />
                  </Field>
                  <Field label="Places en terrasse">
                    <NumberInput value={form.capaciteTerrasse} min={0} max={200} required
                      onChange={(e) => onChange("capaciteTerrasse", e.target.value)} />
                  </Field>
                  <Field label="Couverts max. par créneau"
                    hint={Number(form.capaciteMaxCreneau) !== recommendedTotal
                      ? "Total recommandé : " + recommendedTotal
                      : "Conforme au total (" + recommendedTotal + ")"}>
                    <NumberInput value={form.capaciteMaxCreneau} min={1} max={200} required
                      onChange={(e) => onChange("capaciteMaxCreneau", e.target.value)} />
                    {Number(form.capaciteMaxCreneau) !== recommendedTotal ? (
                      <button type="button" className="sett-field__link"
                        onClick={() => onChange("capaciteMaxCreneau", String(recommendedTotal))}>
                        Appliquer {recommendedTotal}
                      </button>
                    ) : null}
                  </Field>
                </div>
                <div className="sett-capacity-bar">
                  <div className="sett-capacity-bar__track">
                    <div className="sett-capacity-bar__salle" style={{ width: sallePct + "%" }} />
                    <div className="sett-capacity-bar__terrasse" style={{ width: terrassePct + "%" }} />
                  </div>
                  <div className="sett-capacity-bar__legend">
                    <span className="sett-capacity-bar__item">
                      <span className="sett-capacity-bar__dot sett-capacity-bar__dot--salle" />
                      Salle ({form.capaciteSalle})
                    </span>
                    <span className="sett-capacity-bar__item">
                      <span className="sett-capacity-bar__dot sett-capacity-bar__dot--terrasse" />
                      Terrasse ({form.capaciteTerrasse})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Règles client */}
            <div className="horaire-section" style={{ marginTop: "1rem" }}>
              <SectionHead
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>}
                iconClass="horaire-section__head-icon--alert"
                title="Règles client"
                sub="Limites et durées visibles sur le site de réservation"
              />
              <div className="sett-body">
                <div className="sett-grid sett-grid--2">
                  <Field label="Max. personnes en ligne" hint="Limite de réservation en ligne">
                    <NumberInput value={form.seuilAnnulationEnLignePersonnes} min={1} max={50} required
                      onChange={(e) => onChange("seuilAnnulationEnLignePersonnes", e.target.value)} />
                  </Field>
                  <Field label="Délai modification" hint="Ex. 2 = plus de modification moins de 2h avant">
                    <div className="sett-field__inline">
                      <NumberInput value={form.delaiModificationHeures} min={1} max={72} required
                        onChange={(e) => onChange("delaiModificationHeures", e.target.value)} />
                      <span className="sett-field__unit">heures</span>
                    </div>
                  </Field>
                  <Field label="Durée table — calcul interne" hint="Utilisé pour la disponibilité">
                    <div className="sett-field__inline">
                      <NumberInput value={form.dureeTableMinutes} min={30} max={240} step={15} required
                        onChange={(e) => onChange("dureeTableMinutes", e.target.value)} />
                      <span className="sett-field__unit">min</span>
                    </div>
                  </Field>
                  <Field label="Durée table — affichée au client" hint="Texte sur le site (ex. 120 = 2h max)">
                    <div className="sett-field__inline">
                      <NumberInput value={form.dureeTableClientMinutes} min={30} max={240} step={15} required
                        onChange={(e) => onChange("dureeTableClientMinutes", e.target.value)} />
                      <span className="sett-field__unit">min</span>
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            {/* Créneaux */}
            <div className="horaire-section" style={{ marginTop: "1rem" }}>
              <SectionHead
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>}
                title="Créneaux & horizon"
                sub="Durées et fenêtres de réservation"
              />
              <div className="sett-body">
                <div className="sett-grid sett-grid--2">
                  <Field label="Durée d'un créneau">
                    <div className="sett-field__inline">
                      <NumberInput value={form.dureeCreneauMinutes} min={15} max={120} step={15} required
                        onChange={(e) => onChange("dureeCreneauMinutes", e.target.value)} />
                      <span className="sett-field__unit">min</span>
                    </div>
                  </Field>
                  <Field label="Horizon de réservation">
                    <div className="sett-field__inline">
                      <NumberInput value={form.horizonReservationJours} min={7} max={365} required
                        onChange={(e) => onChange("horizonReservationJours", e.target.value)} />
                      <span className="sett-field__unit">jours</span>
                    </div>
                  </Field>
                  <Field label="Heure d'ouverture par défaut">
                    <OpsTimePicker
                      value={form.heureOuvertureDefaut}
                      onChange={(v) => onChange("heureOuvertureDefaut", v)}
                    />
                  </Field>
                  <Field label="Heure de fermeture par défaut">
                    <OpsTimePicker
                      value={form.heureFermetureDefaut}
                      onChange={(v) => onChange("heureFermetureDefaut", v)}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Commandes en ligne */}
            <div className="horaire-section" style={{ marginTop: "1rem" }}>
              <SectionHead
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0020.42 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>}
                title="Commandes en ligne"
                sub="Frais et minimum pour la livraison"
              />
              <div className="sett-body">
                <div className="sett-grid sett-grid--2">
                  <Field label="Frais de livraison" hint="Montant ajouté au total. 0 = aucun frais.">
                    <div className="sett-field__inline">
                      <NumberInput value={form.fraisLivraison} min={0} max={50} step={0.5} required
                        onChange={(e) => onChange("fraisLivraison", e.target.value)} />
                      <span className="sett-field__unit">€</span>
                    </div>
                  </Field>
                  <Field label="Minimum livraison" hint="Montant minimum pour accepter une commande.">
                    <div className="sett-field__inline">
                      <NumberInput value={form.montantMinimumLivraison} min={0} max={200} step={0.5} required
                        onChange={(e) => onChange("montantMinimumLivraison", e.target.value)} />
                      <span className="sett-field__unit">€</span>
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="horaire-section" style={{ marginTop: "1rem" }}>
              <SectionHead
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>}
                title="Notifications"
                sub="E-mail de notification pour les nouvelles réservations"
              />
              <div className="sett-body">
                <div className="sett-grid sett-grid--1">
                  <Field label="E-mail de notification" hint="Optionnel — recevez un e-mail par nouvelle réservation">
                    <input type="email" className="sett-field__input"
                      value={form.emailNotifRestaurant} placeholder="contact@lamaisonorientale.be"
                      onChange={(e) => onChange("emailNotifRestaurant", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="sett-submit">
              <button type="submit" className="sett-submit-btn" disabled={saving}>
                {saving ? (
                  <><span className="sett-submit-btn__spinner" /> Enregistrement…</>
                ) : (
                  <><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg> Enregistrer les paramètres</>
                )}
              </button>
            </div>
          </form>
        )}
      </AdminPageShell>
    </AdminShell>
  );
}

export default RestaurantSettingsPage;
