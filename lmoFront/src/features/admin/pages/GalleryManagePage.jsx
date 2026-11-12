import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import staffOpsApi from "../api/staffOpsApi";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AdminImageUpload from "../components/AdminImageUpload";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";

const EMPTY_FORM = { imageUrl: "", alt: "", ordreAffichage: 0, active: true, afficherAccueil: false };

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  );
}

function GalleryManagePage() {
  const { token, logout } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await staffOpsApi.listGalerie(token);
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Impossible de charger la galerie.");
    } finally { setLoading(false); }
  }, [token, logout]);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm({ ...EMPTY_FORM, ordreAffichage: photos.length }); setModal({ mode: "create" }); setFormError(""); }
  function openEdit(photo) {
    setForm({ imageUrl: photo.imageUrl || "", alt: photo.alt || "", ordreAffichage: photo.ordreAffichage ?? 0, active: photo.active !== false, afficherAccueil: Boolean(photo.afficherAccueil) });
    setModal({ mode: "edit", id: photo.id }); setFormError("");
  }

  async function savePhoto(event) {
    event.preventDefault(); setFormError("");
    if (!form.imageUrl.trim()) { setFormError("Indiquez le chemin de l'image."); return; }
    setSaving(true);
    const body = { imageUrl: form.imageUrl.trim(), alt: form.alt.trim() || null, ordreAffichage: Number(form.ordreAffichage) || 0, active: Boolean(form.active), afficherAccueil: Boolean(form.afficherAccueil) };
    try {
      if (modal?.mode === "edit") { await staffOpsApi.updateGaleriePhoto(token, modal.id, body); setSuccess("Photo mise à jour."); }
      else { await staffOpsApi.createGaleriePhoto(token, body); setSuccess("Photo ajoutée."); }
      setModal(null); await load();
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setFormError(err.message || "Enregistrement impossible.");
    } finally { setSaving(false); }
  }

  async function toggleFlag(photo, field) {
    try {
      await staffOpsApi.updateGaleriePhoto(token, photo.id, {
        imageUrl: photo.imageUrl, alt: photo.alt, ordreAffichage: photo.ordreAffichage,
        active: field === "active" ? !photo.active : photo.active,
        afficherAccueil: field === "accueil" ? !photo.afficherAccueil : photo.afficherAccueil,
      });
      await load();
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Mise à jour impossible.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return; setDeleting(true);
    try {
      await staffOpsApi.deleteGaleriePhoto(token, deleteTarget.id);
      setSuccess("Photo retirée."); setDeleteTarget(null); await load();
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Suppression impossible."); setDeleteTarget(null);
    } finally { setDeleting(false); }
  }

  const activeCount = photos.filter((p) => p.active).length;
  const homeCount = photos.filter((p) => p.afficherAccueil && p.active).length;

  return (
    <AdminShell active="galerie" title="Galerie photos">
      <AdminPageShell
        pageClass="admin-ops-shell"
        title="Galerie photos"
        lead={`${activeCount} photo${activeCount > 1 ? "s" : ""} active${activeCount > 1 ? "s" : ""} · ${homeCount} en aperçu accueil`}
        icon={GalleryIcon}
        statusChip={homeCount > 0 ? { label: `${homeCount} accueil`, tone: "ok" } : null}
      >
        <div className="ops-stat-bar">
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--burgundy" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{photos.length}</span>
              <span className="ops-stat-bar__label">Total</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--teal" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{activeCount}</span>
              <span className="ops-stat-bar__label">Actives</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--olive" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{homeCount}</span>
              <span className="ops-stat-bar__label">Accueil</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <button type="button" className="ops-btn ops-btn--ok ops-btn--sm" onClick={openCreate}>+ Ajouter une photo</button>
          </div>
        </div>

        {error ? <div className="ops-error" role="alert">{error}</div> : null}
        {success ? <div className="ops-toast" role="status">{success}</div> : null}

        {loading ? (
          <div className="ops-loading"><span className="ops-loading__spinner" /> Chargement…</div>
        ) : photos.length === 0 ? (
          <div className="ops-empty">
            <div className="ops-empty__icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z" /></svg></div>
            <p className="ops-empty__text">Aucune photo</p>
            <p className="ops-empty__hint">Ajoutez la première photo de la galerie.</p>
          </div>
        ) : (
          <div className="ops-gallery-grid">
            {photos.map((photo) => (
              <article key={photo.id} className={`ops-photo-card${!photo.active ? " ops-photo-card--off" : ""}`}>
                <div className="ops-photo-card__media">
                  {photo.imageUrl ? <img src={photo.imageUrl} alt={photo.alt || ""} loading="lazy" /> : <div className="ops-photo-card__empty"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg></div>}
                  <div className="ops-photo-card__overlay">
                    <button type="button" className="ops-photo-card__edit-btn" onClick={() => openEdit(photo)} title="Modifier">✎</button>
                  </div>
                  {!photo.active ? <span className="ops-photo-card__status">Masquée</span> : null}
                </div>
                <div className="ops-photo-card__body">
                  <p className="ops-photo-card__alt">{photo.alt || "Sans légende"}</p>
                  <div className="ops-photo-card__actions">
                    <label className="ops-toggle" title="Visible sur le site">
                      <input type="checkbox" checked={photo.active} onChange={() => toggleFlag(photo, "active")} />
                      <span className="ops-toggle__track" />
                      <span className="ops-toggle__label">{photo.active ? "Visible" : "Masquée"}</span>
                    </label>
                    <label className="ops-toggle" title="Afficher en accueil">
                      <input type="checkbox" checked={photo.afficherAccueil} onChange={() => toggleFlag(photo, "accueil")} />
                      <span className="ops-toggle__track" />
                      <span className="ops-toggle__label">{photo.afficherAccueil ? "Accueil" : "Pas accueil"}</span>
                    </label>
                    <button type="button" className="ops-btn ops-btn--danger ops-btn--sm" onClick={() => setDeleteTarget(photo)}>Suppr.</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminPageShell>

      {modal ? (
        <div className="ops-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && !saving) setModal(null); }}>
          <div className="ops-modal" role="dialog" aria-modal="true">
            <header className="ops-modal__head">
              <h2>{modal.mode === "edit" ? "Modifier la photo" : "Ajouter une photo"}</h2>
              <button type="button" className="ops-modal__close" onClick={() => setModal(null)} aria-label="Fermer">&times;</button>
            </header>
            <form className="ops-modal__form" onSubmit={savePhoto}>
              <AdminImageUpload token={token} label="Image" value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
              <label className="ops-settings-field">
                <span className="ops-settings-field__label">Légende (alt)</span>
                <input className="ops-settings-field__input" value={form.alt} onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))} />
              </label>
              <label className="ops-settings-field">
                <span className="ops-settings-field__label">Ordre</span>
                <input className="ops-settings-field__input" type="number" value={form.ordreAffichage} onChange={(e) => setForm((f) => ({ ...f, ordreAffichage: e.target.value }))} />
              </label>
              <div className="ops-settings-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <label className="ops-toggle">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                  <span className="ops-toggle__track" />
                  <span className="ops-toggle__label">Visible sur le site</span>
                </label>
                <label className="ops-toggle">
                  <input type="checkbox" checked={form.afficherAccueil} onChange={(e) => setForm((f) => ({ ...f, afficherAccueil: e.target.checked }))} />
                  <span className="ops-toggle__track" />
                  <span className="ops-toggle__label">Aperçu accueil</span>
                </label>
              </div>
              {form.imageUrl ? (
                <div className="ops-photo-preview">
                  <img src={form.imageUrl} alt="" />
                </div>
              ) : null}
              {formError ? <div className="ops-error" role="alert">{formError}</div> : null}
              <div className="ops-modal__actions">
                <button type="button" className="ops-btn" onClick={() => setModal(null)} disabled={saving}>Annuler</button>
                <button type="submit" className="ops-btn ops-btn--primary" disabled={saving}>{saving ? "…" : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Retirer la photo"
        message={`Supprimer « ${deleteTarget?.alt || deleteTarget?.imageUrl} » de la galerie ?`}
        confirmLabel="Supprimer" danger busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}

export default GalleryManagePage;
