import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import horairesApi from "../api/horairesApi";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";

const EMPTY = {
  nom: "", tagline: "", cuisine: "", servicesText: "",
  adresseRue: "", adresseVille: "", telephone: "", emailContact: "",
  instagramUrl: "", tiktokUrl: "",
  googleRatingScore: "", googleRatingCount: "", googleReviewsUrl: "",
};

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
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

function TextInput({ value, onChange, placeholder, type, required }) {
  return (
    <input type={type || "text"} className="sett-field__input"
      value={value} onChange={onChange} placeholder={placeholder} required={required} />
  );
}

function RestaurantInfoPage() {
  const { token, logout } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await horairesApi.getInfo(token);
      setForm({
        nom: data.nom || "", tagline: data.tagline || "", cuisine: data.cuisine || "",
        servicesText: Array.isArray(data.services) ? data.services.join("\n") : "",
        adresseRue: data.adresseRue || "", adresseVille: data.adresseVille || "",
        telephone: data.telephone || "", emailContact: data.emailContact || "",
        instagramUrl: data.instagramUrl || "", tiktokUrl: data.tiktokUrl || "",
        googleRatingScore: data.googleRatingScore || "", googleRatingCount: data.googleRatingCount || "",
        googleReviewsUrl: data.googleReviewsUrl || "",
      });
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Impossible de charger les informations.");
    } finally { setLoading(false); }
  }, [token, logout]);

  useEffect(() => { load(); }, [load]);

  function onChange(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function onSubmit(event) {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const services = form.servicesText.split("\n").map((l) => l.trim()).filter(Boolean);
      const saved = await horairesApi.updateInfo(token, {
        nom: form.nom, tagline: form.tagline, cuisine: form.cuisine, services,
        adresseRue: form.adresseRue, adresseVille: form.adresseVille,
        telephone: form.telephone, emailContact: form.emailContact,
        instagramUrl: form.instagramUrl, tiktokUrl: form.tiktokUrl,
        googleRatingScore: form.googleRatingScore, googleRatingCount: form.googleRatingCount,
        googleReviewsUrl: form.googleReviewsUrl,
      });
      setForm({
        nom: saved.nom || "", tagline: saved.tagline || "", cuisine: saved.cuisine || "",
        servicesText: Array.isArray(saved.services) ? saved.services.join("\n") : "",
        adresseRue: saved.adresseRue || "", adresseVille: saved.adresseVille || "",
        telephone: saved.telephone || "", emailContact: saved.emailContact || "",
        instagramUrl: saved.instagramUrl || "", tiktokUrl: saved.tiktokUrl || "",
        googleRatingScore: saved.googleRatingScore || "", googleRatingCount: saved.googleRatingCount || "",
        googleReviewsUrl: saved.googleReviewsUrl || "",
      });
      setSuccess("Informations enregistrées.");
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Enregistrement impossible.");
    } finally { setSaving(false); }
  }

  return (
    <AdminShell active="infos" title="Infos & services">
      <AdminPageShell
        pageClass="admin-ops-shell"
        title="Informations générales"
        lead="Coordonnées, présentation et services proposés affichés sur le site."
        icon={InfoIcon}
      >
        {error ? <div className="ops-error" role="alert">{error}</div> : null}
        {success ? <div className="ops-toast" role="status">{success}</div> : null}

        {loading ? (
          <div className="ops-loading"><span className="ops-loading__spinner" /> Chargement…</div>
        ) : (
          <form className="sett-form" onSubmit={onSubmit}>

            {/* Identification */}
            <div className="horaire-section">
              <SectionHead
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>}
                title="Identification"
                sub="Nom, slogan et type de cuisine"
              />
              <div className="sett-body">
                <div className="sett-grid sett-grid--3">
                  <Field label="Nom du restaurant" hint="Nom public affiché sur le site">
                    <TextInput value={form.nom} required
                      onChange={(e) => onChange("nom", e.target.value)} />
                  </Field>
                  <Field label="Slogan / accroche" hint="Phrase d'accroche sous le nom">
                    <TextInput value={form.tagline}
                      onChange={(e) => onChange("tagline", e.target.value)} />
                  </Field>
                  <Field label="Type de cuisine" hint="Ex. Libanais, Moyen-oriental…">
                    <TextInput value={form.cuisine}
                      onChange={(e) => onChange("cuisine", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="horaire-section" style={{ marginTop: "1rem" }}>
              <SectionHead
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 9V7h-2V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2H2v2h2v2c0 1.1.9 2 2 2h1v2H7v2h2v-2h6v2h2v-2h1c1.1 0 2-.9 2-2v-2h2V9h-2zM6 5h12v2H6V5zm12 14H6v-4h12v4z" /></svg>}
                iconClass="horaire-section__head-icon--alert"
                title="Services proposés"
                sub="Un service par ligne — affichés sur la page d'accueil"
              />
              <div className="sett-body">
                <div className="sett-grid sett-grid--1">
                  <Field label="Services (un par ligne)" hint="Ex. Sur place, À emporter, Livraison">
                    <textarea className="sett-field__input" rows={3}
                      value={form.servicesText}
                      onChange={(e) => onChange("servicesText", e.target.value)}
                      placeholder={"Sur place\nÀ emporter\nLivraison"}
                      style={{ resize: "vertical", lineHeight: 1.6 }} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="horaire-section" style={{ marginTop: "1rem" }}>
              <SectionHead
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>}
                title="Coordonnées"
                sub="Adresse, téléphone et e-mail de contact"
              />
              <div className="sett-body">
                <div className="sett-grid sett-grid--2">
                  <Field label="Adresse (rue)" hint="Rue et numéro">
                    <TextInput value={form.adresseRue}
                      onChange={(e) => onChange("adresseRue", e.target.value)} />
                  </Field>
                  <Field label="Ville / code postal" hint="Ex. 1000 Bruxelles">
                    <TextInput value={form.adresseVille}
                      onChange={(e) => onChange("adresseVille", e.target.value)} />
                  </Field>
                  <Field label="Téléphone" hint="Numéro public du restaurant">
                    <TextInput value={form.telephone}
                      onChange={(e) => onChange("telephone", e.target.value)} />
                  </Field>
                  <Field label="E-mail de contact" hint="Adresse affichée sur le site">
                    <TextInput type="email" value={form.emailContact}
                      onChange={(e) => onChange("emailContact", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Réseaux & avis */}
            <div className="horaire-section" style={{ marginTop: "1rem" }}>
              <SectionHead
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>}
                title="Réseaux & avis Google"
                sub="Liens sociaux et note affichée sur le site"
              />
              <div className="sett-body">
                <div className="sett-grid sett-grid--3">
                  <Field label="Instagram" hint="Lien ou nom d'utilisateur">
                    <TextInput value={form.instagramUrl} placeholder="https://instagram.com/…"
                      onChange={(e) => onChange("instagramUrl", e.target.value)} />
                  </Field>
                  <Field label="TikTok" hint="Lien ou nom d'utilisateur">
                    <TextInput value={form.tiktokUrl} placeholder="https://tiktok.com/@…"
                      onChange={(e) => onChange("tiktokUrl", e.target.value)} />
                  </Field>
                  <Field label="Lien avis Google" hint="Lien direct vers les avis">
                    <TextInput value={form.googleReviewsUrl} placeholder="https://g.page/…"
                      onChange={(e) => onChange("googleReviewsUrl", e.target.value)} />
                  </Field>
                  <Field label="Note Google" hint="Score affiché (ex. 4,6)">
                    <TextInput value={form.googleRatingScore} placeholder="4,6"
                      onChange={(e) => onChange("googleRatingScore", e.target.value)} />
                  </Field>
                  <Field label="Nombre d'avis" hint="Ex. 50 avis">
                    <TextInput value={form.googleRatingCount} placeholder="50 avis"
                      onChange={(e) => onChange("googleRatingCount", e.target.value)} />
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
                  <><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg> Enregistrer les informations</>
                )}
              </button>
            </div>
          </form>
        )}
      </AdminPageShell>
    </AdminShell>
  );
}

export default RestaurantInfoPage;
