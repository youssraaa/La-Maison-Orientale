import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import horairesApi from "../api/horairesApi";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";
import AdminConfirmModal from "../components/AdminConfirmModal";
import OpsTimePicker from "../components/OpsTimePicker";

const EMPTY_FERMETURE = { dateFermeture: "", motif: "" };

function formatDateFr(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
    </svg>
  );
}

const JOUR_LETTER = { 1: "Lu", 2: "Ma", 3: "Me", 4: "Je", 5: "Ve", 6: "Sa", 7: "Di" };

function HorairesPage() {
  const { token, logout } = useAuth();
  const [horaires, setHoraires] = useState([]);
  const [fermetures, setFermetures] = useState([]);
  const [form, setForm] = useState(EMPTY_FERMETURE);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [h, f] = await Promise.all([
        horairesApi.listHoraires(token),
        horairesApi.listFermetures(token),
      ]);
      setHoraires(Array.isArray(h) ? h : []);
      setFermetures(Array.isArray(f) ? f : []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Impossible de charger les horaires.");
    } finally { setLoading(false); }
  }, [token, logout]);

  useEffect(() => { load(); }, [load]);

  async function saveHoraire(row) {
    setSavingId(row.id || row.jourSemaine);
    setError(""); setSuccess("");
    try {
      await horairesApi.upsertHoraire(token, {
        jourSemaine: row.jourSemaine,
        heureOuverture: row.heureOuverture?.slice(0, 5) || row.heureOuverture,
        heureFermeture: row.heureFermeture?.slice(0, 5) || row.heureFermeture,
        actif: row.actif,
      });
      setSuccess("Horaires du " + row.jourSemaine + " enregistr\u00e9s.");
      await load();
    } catch (err) {
      setError(err.message || "Enregistrement impossible.");
    } finally { setSavingId(null); }
  }

  function updateHoraire(jourSemaine, patch) {
    setHoraires((prev) =>
      prev.map((h) => (h.jourSemaine === jourSemaine ? { ...h, ...patch } : h))
    );
  }

  async function addFermeture(event) {
    event.preventDefault();
    setError(""); setSuccess("");
    if (!form.dateFermeture) { setError("Date requise."); return; }
    try {
      await horairesApi.createFermeture(token, form);
      setForm(EMPTY_FERMETURE);
      setSuccess("Fermeture exceptionnelle ajoutée.");
      await load();
    } catch (err) {
      setError(err.message || "Ajout impossible.");
    }
  }

  async function confirmDeleteFermeture() {
    if (!deleteTarget) return;
    try {
      await horairesApi.deleteFermeture(token, deleteTarget.id);
      setSuccess("Fermeture supprimée.");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err.message || "Suppression impossible.");
    }
  }

  const sorted = [...horaires].sort((a, b) => a.jourSemaine - b.jourSemaine);
  const openDays = horaires.filter((h) => h.actif).length;
  const closedDays = 7 - openDays;

  return (
    <AdminShell active="horaires" title="Horaires & fermetures">
      <AdminPageShell
        pageClass="admin-ops-shell"
        title="Horaires & fermetures"
        lead="Définissez les jours et plages d'ouverture, et bloquez les dates fermées."
        icon={CalendarIcon}
        statusChip={
          loading ? null
            : closedDays > 0
              ? { label: closedDays + " jour fermé", tone: "alert" }
              : { label: "Ouvert tous les jours", tone: "ok" }
        }
      >
        <div className="ops-stat-bar">
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--olive" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{openDays}</span>
              <span className="ops-stat-bar__label">Jours ouverts</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--burgundy" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{closedDays}</span>
              <span className="ops-stat-bar__label">Jours fermés</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--teal" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{fermetures.length}</span>
              <span className="ops-stat-bar__label">Fermetures excep.</span>
            </div>
          </div>
        </div>

        {error ? <div className="ops-error" role="alert">{error}</div> : null}
        {success ? <div className="ops-toast" role="status">{success}</div> : null}

        {/* Horaires hebdomadaires */}
        <div className="horaire-section">
          <div className="horaire-section__head">
            <div className="horaire-section__head-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
            </div>
            <div>
              <h2 className="horaire-section__title">Horaires hebdomadaires</h2>
              <p className="horaire-section__sub">Plages d'ouverture pour les réservations et le service</p>
            </div>
          </div>

          {loading ? (
            <div className="ops-loading"><span className="ops-loading__spinner" /> Chargement…</div>
          ) : (
            <div className="horaire-table-wrap">
              <table className="horaire-table">
                <thead>
                  <tr>
                    <th className="horaire-table__th--day">Jour</th>
                    <th className="horaire-table__th--time">Ouverture</th>
                    <th className="horaire-table__th--separator" />
                    <th className="horaire-table__th--time">Fermeture</th>
                    <th className="horaire-table__th--toggle">Statut</th>
                    <th className="horaire-table__th--action" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => {
                    const letter = JOUR_LETTER[row.jourSemaine] || "?";
                    return (
                      <tr key={row.jourSemaine} className="horaire-table__row">
                        <td className="horaire-table__td--day">
                          <span className="horaire-day-badge">{letter}</span>
                          <span className="horaire-day-name">{row.jourLabel}</span>
                        </td>
                        <td className="horaire-table__td--time">
                          <OpsTimePicker
                            value={(row.heureOuverture || "").slice(0, 5)}
                            disabled={!row.actif}
                            onChange={(v) => updateHoraire(row.jourSemaine, { heureOuverture: v })}
                          />
                        </td>
                        <td className="horaire-table__td--separator">
                          <span className="horaire-separator">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                          </span>
                        </td>
                        <td className="horaire-table__td--time">
                          <OpsTimePicker
                            value={(row.heureFermeture || "").slice(0, 5)}
                            disabled={!row.actif}
                            onChange={(v) => updateHoraire(row.jourSemaine, { heureFermeture: v })}
                          />
                        </td>
                        <td className="horaire-table__td--toggle">
                          <label className="horaire-toggle">
                            <input
                              type="checkbox"
                              checked={!!row.actif}
                              onChange={(e) => updateHoraire(row.jourSemaine, { actif: e.target.checked })}
                            />
                            <span className="horaire-toggle__track" />
                            <span className="horaire-toggle__text">{row.actif ? "Ouvert" : "Fermé"}</span>
                          </label>
                        </td>
                        <td className="horaire-table__td--action">
                          <button
                            type="button"
                            className="horaire-save-btn"
                            disabled={savingId === (row.id || row.jourSemaine)}
                            onClick={() => saveHoraire(row)}
                          >
                            {savingId === (row.id || row.jourSemaine) ? (
                              <span className="horaire-save-btn__spinner" />
                            ) : (
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg>
                            )}
                            {savingId === (row.id || row.jourSemaine) ? "" : "Enregistrer"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fermetures exceptionnelles */}
        <div className="horaire-section" style={{ marginTop: "1rem" }}>
          <div className="horaire-section__head">
            <div className="horaire-section__head-icon horaire-section__head-icon--alert">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
            </div>
            <div>
              <h2 className="horaire-section__title">Fermetures exceptionnelles</h2>
              <p className="horaire-section__sub">Dates bloquées — aucune réservation ne sera acceptée</p>
            </div>
          </div>

          <form className="horaire-ferm-form" onSubmit={addFermeture}>
            <label className="horaire-ferm-field">
              <span className="horaire-ferm-field__label">Date</span>
              <input type="date" className="horaire-ferm-field__input" value={form.dateFermeture}
                onChange={(e) => setForm((f) => ({ ...f, dateFermeture: e.target.value }))} required />
            </label>
            <label className="horaire-ferm-field">
              <span className="horaire-ferm-field__label">Motif</span>
              <input type="text" className="horaire-ferm-field__input" value={form.motif}
                placeholder="Ex. congés annuels, fête nationale…"
                onChange={(e) => setForm((f) => ({ ...f, motif: e.target.value }))} />
            </label>
            <button type="submit" className="horaire-ferm-add-btn">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
              Ajouter
            </button>
          </form>

          {fermetures.length === 0 ? (
            <div className="ops-empty">
              <div className="ops-empty__icon">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V6h14v14z" /></svg>
              </div>
              <p className="ops-empty__text">Aucune fermeture planifiée</p>
              <p className="ops-empty__hint">Ajoutez des dates pour bloquer les réservations</p>
            </div>
          ) : (
            <ul className="horaire-ferm-list">
              {fermetures.map((f) => (
                <li key={f.id} className="horaire-ferm-item">
                  <div className="horaire-ferm-item__left">
                    <span className="horaire-ferm-item__icon">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" /></svg>
                    </span>
                    <div className="horaire-ferm-item__text">
                      <span className="horaire-ferm-item__date">{formatDateFr(f.dateFermeture)}</span>
                      {f.motif ? <span className="horaire-ferm-item__motif">{f.motif}</span> : null}
                    </div>
                  </div>
                  <button type="button" className="horaire-ferm-del-btn" onClick={() => setDeleteTarget(f)}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminPageShell>

      <AdminConfirmModal
        open={!!deleteTarget}
        title="Supprimer la fermeture"
        message={"Retirer la fermeture du " + (deleteTarget?.dateFermeture || "") + " ?"}
        confirmLabel="Supprimer"
        danger
        onConfirm={confirmDeleteFermeture}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}

export default HorairesPage;
