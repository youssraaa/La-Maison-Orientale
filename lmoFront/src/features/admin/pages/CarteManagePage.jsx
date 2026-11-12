import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import staffOpsApi from "../api/staffOpsApi";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AdminImageUpload from "../components/AdminImageUpload";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";

const EMPTY_CAT = { nom: "", slug: "", imageUrl: "", note: "", ordreAffichage: 0, active: true };
const EMPTY_PLAT = { nom: "", description: "", prix: "", disponibleEmporter: true, disponibleLivraison: true, imageUrl: "", ordreAffichage: 0, sousSection: "", featured: false };

function formatPrice(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(2).replace(".", ",")} \u20ac`;
}

function CarteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7L5.66 5h12.69l-1.78 2H7.43z" />
    </svg>
  );
}

function CarteManagePage() {
  const { token, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [plats, setPlats] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [catModal, setCatModal] = useState(null);
  const [platModal, setPlatModal] = useState(null);
  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [platForm, setPlatForm] = useState(EMPTY_PLAT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [cats, allPlats] = await Promise.all([
        staffOpsApi.listCategories(token),
        staffOpsApi.listPlats(token),
      ]);
      const catList = Array.isArray(cats) ? cats : [];
      setCategories(catList);
      setPlats(Array.isArray(allPlats) ? allPlats : []);
      setSelectedId((prev) => {
        if (prev && catList.some((c) => c.id === prev)) return prev;
        return catList[0]?.id ?? null;
      });
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Impossible de charger la carte.");
    } finally { setLoading(false); }
  }, [token, logout]);

  useEffect(() => { load(); }, [load]);

  const selected = useMemo(() => categories.find((c) => c.id === selectedId) || null, [categories, selectedId]);

  const selectedPlats = useMemo(
    () => plats.filter((p) => p.categorieId === selectedId).slice().sort((a, b) => (a.ordreAffichage ?? 0) - (b.ordreAffichage ?? 0)),
    [plats, selectedId]
  );

  const totalPlats = plats.length;
  const dispoBothCount = plats.filter((p) => p.disponibleEmporter !== false && p.disponibleLivraison !== false).length;
  const partialDispoCount = plats.filter((p) => (p.disponibleEmporter !== false) !== (p.disponibleLivraison !== false)).length;
  const indispoCount = plats.filter((p) => p.disponibleEmporter === false && p.disponibleLivraison === false).length;

  function openCreateCat() { setCatForm({ ...EMPTY_CAT, ordreAffichage: categories.length }); setCatModal({ mode: "create" }); setFormError(""); }
  function openEditCat(cat) {
    setCatForm({ nom: cat.nom || "", slug: cat.slug || "", imageUrl: cat.imageUrl || "", note: cat.note || "", ordreAffichage: cat.ordreAffichage ?? 0, active: cat.active !== false });
    setCatModal({ mode: "edit", id: cat.id }); setFormError("");
  }
  function openCreatePlat() {
    if (!selectedId) return;
    setPlatForm({ ...EMPTY_PLAT, ordreAffichage: selectedPlats.length });
    setPlatModal({ mode: "create" }); setFormError("");
  }
  function openEditPlat(plat) {
    setPlatForm({ nom: plat.nom || "", description: plat.description || "", prix: plat.prix != null ? String(plat.prix) : "", disponibleEmporter: plat.disponibleEmporter !== false, disponibleLivraison: plat.disponibleLivraison !== false, imageUrl: plat.imageUrl || "", ordreAffichage: plat.ordreAffichage ?? 0, sousSection: plat.sousSection || "", featured: Boolean(plat.featured) });
    setPlatModal({ mode: "edit", id: plat.id }); setFormError("");
  }

  async function saveCategory(event) {
    event.preventDefault(); setFormError("");
    if (!catForm.nom.trim()) { setFormError("Le nom est obligatoire."); return; }
    setSaving(true);
    const body = { nom: catForm.nom.trim(), slug: catForm.slug.trim() || null, imageUrl: catForm.imageUrl.trim() || null, note: catForm.note.trim() || null, ordreAffichage: Number(catForm.ordreAffichage) || 0, active: Boolean(catForm.active) };
    try {
      if (catModal?.mode === "edit") { await staffOpsApi.updateCategory(token, catModal.id, body); setSuccess("Section mise à jour."); }
      else { await staffOpsApi.createCategory(token, body); setSuccess("Section créée."); }
      setCatModal(null); await load();
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setFormError(err.message || "Enregistrement impossible.");
    } finally { setSaving(false); }
  }

  async function savePlat(event) {
    event.preventDefault(); setFormError("");
    if (!platForm.nom.trim()) { setFormError("Le nom est obligatoire."); return; }
    const prix = Number(String(platForm.prix).replace(",", "."));
    if (Number.isNaN(prix) || prix < 0) { setFormError("Prix invalide."); return; }
    setSaving(true);
    const body = { categorieId: selectedId, nom: platForm.nom.trim(), description: platForm.description.trim() || null, prix, disponibleEmporter: Boolean(platForm.disponibleEmporter), disponibleLivraison: Boolean(platForm.disponibleLivraison), imageUrl: platForm.imageUrl.trim() || null, ordreAffichage: Number(platForm.ordreAffichage) || 0, sousSection: platForm.sousSection.trim() || null, featured: Boolean(platForm.featured) };
    try {
      if (platModal?.mode === "edit") { await staffOpsApi.updatePlat(token, platModal.id, body); setSuccess("Plat mis à jour."); }
      else { await staffOpsApi.createPlat(token, body); setSuccess("Plat ajouté."); }
      setPlatModal(null); await load();
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setFormError(err.message || "Enregistrement impossible.");
    } finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return; setDeleting(true);
    try {
      if (deleteTarget.type === "cat") { await staffOpsApi.deleteCategory(token, deleteTarget.id); setSuccess("Section supprimée."); }
      else { await staffOpsApi.deletePlat(token, deleteTarget.id); setSuccess("Plat supprimé."); }
      setDeleteTarget(null); await load();
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Suppression impossible."); setDeleteTarget(null);
    } finally { setDeleting(false); }
  }

  async function togglePlatMode(plat, mode) {
    const key = mode === "EMPORTER" ? "disponibleEmporter" : "disponibleLivraison";
    try {
      await staffOpsApi.updatePlat(token, plat.id, {
        categorieId: plat.categorieId, nom: plat.nom, description: plat.description, prix: plat.prix,
        disponibleEmporter: mode === "EMPORTER" ? !plat.disponibleEmporter : plat.disponibleEmporter,
        disponibleLivraison: mode === "LIVRAISON" ? !plat.disponibleLivraison : plat.disponibleLivraison,
        imageUrl: plat.imageUrl, ordreAffichage: plat.ordreAffichage, sousSection: plat.sousSection, featured: plat.featured,
      });
      await load();
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Mise à jour impossible.");
    }
  }

  return (
    <AdminShell active="carte" title="Carte & tarifs">
      <AdminPageShell
        pageClass="admin-ops-shell"
        title="Carte & tarifs"
        lead={`${categories.length} section${categories.length > 1 ? "s" : ""} · ${totalPlats} plat${totalPlats > 1 ? "s" : ""} — modifications visibles sur le site client.`}
        icon={CarteIcon}
        statusChip={indispoCount > 0 ? { label: `${indispoCount} totalement indispo.`, tone: "alert" } : partialDispoCount > 0 ? { label: `${partialDispoCount} dispo partielle`, tone: "warn" } : { label: "Tout disponible", tone: "ok" }}
      >
        <div className="ops-stat-bar">
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--burgundy" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{categories.length}</span>
              <span className="ops-stat-bar__label">Sections</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--teal" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{totalPlats}</span>
              <span className="ops-stat-bar__label">Plats total</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--olive" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{dispoBothCount}</span>
              <span className="ops-stat-bar__label">Dispo. tous modes</span>
            </div>
          </div>
          {partialDispoCount > 0 ? (
            <div className="ops-stat-bar__item">
              <span className="ops-stat-bar__dot ops-stat-bar__dot--saffron" />
              <div className="ops-stat-bar__text">
                <span className="ops-stat-bar__value">{partialDispoCount}</span>
                <span className="ops-stat-bar__label">Dispo. partielle</span>
              </div>
            </div>
          ) : null}
          {indispoCount > 0 ? (
            <div className="ops-stat-bar__item">
              <span className="ops-stat-bar__dot ops-stat-bar__dot--burgundy" />
              <div className="ops-stat-bar__text">
                <span className="ops-stat-bar__value">{indispoCount}</span>
                <span className="ops-stat-bar__label">Totalement indispo.</span>
              </div>
            </div>
          ) : null}
        </div>

        {error ? <div className="ops-error" role="alert">{error}</div> : null}
        {success ? <div className="ops-toast" role="status">{success}</div> : null}

        {loading ? (
          <div className="ops-loading"><span className="ops-loading__spinner" /> Chargement…</div>
        ) : categories.length === 0 ? (
          <div className="ops-empty">
            <div className="ops-empty__icon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9z" /></svg></div>
            <p className="ops-empty__text">Aucune section</p>
            <p className="ops-empty__hint">Créez la première section pour commencer.</p>
            <button type="button" className="ops-btn ops-btn--ok" onClick={openCreateCat}>+ Créer une section</button>
          </div>
        ) : (
          <div className="ops-split ops-split--carte">
            <div className="ops-split__list">
              <div className="ops-split__list-header">
                <h3>Sections ({categories.length})</h3>
                <button type="button" className="ops-btn ops-btn--ok ops-btn--sm" onClick={openCreateCat}>+ Ajouter</button>
              </div>
              {categories.map((cat) => (
                <button key={cat.id} type="button" className={`ops-list-item${cat.id === selectedId ? " is-active" : ""}`} onClick={() => setSelectedId(cat.id)}>
                  <span className="ops-list-item__name">
                    {cat.nom}
                    {!cat.active ? <span className="ops-badge ops-badge--annulee" style={{ marginLeft: "0.4rem", fontSize: "0.58rem", padding: "0.08rem 0.35rem" }}>Inactive</span> : null}
                  </span>
                  <span className="ops-list-item__sub">{plats.filter((p) => p.categorieId === cat.id).length} plats</span>
                </button>
              ))}
            </div>

            <div className="ops-split__detail">
              {selected ? (
                <>
                  <div className="ops-detail-head">
                    <div>
                      <h2>{selected.nom}</h2>
                      {selected.note ? <p>{selected.note}</p> : null}
                    </div>
                    <div className="ops-actions">
                      <button type="button" className="ops-btn" onClick={() => openEditCat(selected)}>Modifier</button>
                      <button type="button" className="ops-btn ops-btn--danger ops-btn--sm" onClick={() => setDeleteTarget({ type: "cat", id: selected.id, label: selected.nom })}>Supprimer</button>
                      <button type="button" className="ops-btn ops-btn--ok" onClick={openCreatePlat}>+ Plat</button>
                    </div>
                  </div>

                  {selectedPlats.length === 0 ? (
                    <div className="ops-empty">
                      <p className="ops-empty__text">Aucun plat</p>
                      <p className="ops-empty__hint">Ajoutez le premier plat de cette section.</p>
                    </div>
                  ) : (
                    <div className="ops-card-grid">
                      {selectedPlats.map((plat) => (
                        <article key={plat.id} className={`ops-plat-card${plat.disponibleEmporter === false && plat.disponibleLivraison === false ? " ops-plat-card--unavail" : ""}`}>
                          <div className="ops-plat-card__media">
                            {plat.imageUrl ? <img src={plat.imageUrl} alt={plat.nom} loading="lazy" /> : <div className="ops-plat-card__placeholder"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg></div>}
                            {plat.featured ? <span className="ops-plat-card__badge">★</span> : null}
                          </div>
                          <div className="ops-plat-card__body">
                            <div className="ops-plat-card__head">
                              <h3 className="ops-plat-card__name">{plat.nom}</h3>
                              <span className="ops-plat-card__price">{formatPrice(plat.prix)}</span>
                            </div>
                            {plat.description ? <p className="ops-plat-card__desc">{plat.description}</p> : null}
                          </div>
                          <div className="ops-plat-card__footer">
                            <div className="ops-plat-card__dispo-toggles">
                              <label className="ops-toggle ops-toggle--sm" title={plat.disponibleEmporter ? "Dispo. emporter" : "Indispo. emporter"}>
                                <input type="checkbox" checked={plat.disponibleEmporter !== false} onChange={() => togglePlatMode(plat, "EMPORTER")} />
                                <span className="ops-toggle__track" />
                                <span className="ops-toggle__label">📦 Emporter</span>
                              </label>
                              <label className="ops-toggle ops-toggle--sm" title={plat.disponibleLivraison ? "Dispo. livraison" : "Indispo. livraison"}>
                                <input type="checkbox" checked={plat.disponibleLivraison !== false} onChange={() => togglePlatMode(plat, "LIVRAISON")} />
                                <span className="ops-toggle__track" />
                                <span className="ops-toggle__label">🛵 Livraison</span>
                              </label>
                            </div>
                            <div className="ops-actions">
                              <button type="button" className="ops-btn ops-btn--sm" onClick={() => openEditPlat(plat)}>Éditer</button>
                              <button type="button" className="ops-btn ops-btn--danger ops-btn--sm" onClick={() => setDeleteTarget({ type: "plat", id: plat.id, label: plat.nom })}>Suppr.</button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
      </AdminPageShell>

      {catModal ? (
        <div className="ops-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && !saving) setCatModal(null); }}>
          <div className="ops-modal" role="dialog" aria-modal="true">
            <header className="ops-modal__head">
              <h2>{catModal.mode === "edit" ? "Modifier la section" : "Nouvelle section"}</h2>
              <button type="button" className="ops-modal__close" onClick={() => setCatModal(null)} aria-label="Fermer">&times;</button>
            </header>
            <form className="ops-modal__form" onSubmit={saveCategory}>
              <label className="ops-settings-field">
                <span className="ops-settings-field__label">Nom</span>
                <input className="ops-settings-field__input" value={catForm.nom} onChange={(e) => setCatForm((f) => ({ ...f, nom: e.target.value }))} required />
              </label>
              <label className="ops-settings-field">
                <span className="ops-settings-field__label">Slug (optionnel)</span>
                <input className="ops-settings-field__input" value={catForm.slug} onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))} placeholder="entrees-froides" />
              </label>
              <AdminImageUpload token={token} label="Image de la catégorie" value={catForm.imageUrl} onChange={(url) => setCatForm((f) => ({ ...f, imageUrl: url }))} />
              <label className="ops-settings-field">
                <span className="ops-settings-field__label">Note</span>
                <input className="ops-settings-field__input" value={catForm.note} onChange={(e) => setCatForm((f) => ({ ...f, note: e.target.value }))} />
              </label>
              <div className="ops-settings-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <label className="ops-settings-field">
                  <span className="ops-settings-field__label">Ordre</span>
                  <input className="ops-settings-field__input" type="number" value={catForm.ordreAffichage} onChange={(e) => setCatForm((f) => ({ ...f, ordreAffichage: e.target.value }))} />
                </label>
                <label className="ops-toggle" style={{ alignSelf: "end", paddingBottom: "0.4rem" }}>
                  <input type="checkbox" checked={catForm.active} onChange={(e) => setCatForm((f) => ({ ...f, active: e.target.checked }))} />
                  <span className="ops-toggle__track" />
                  <span className="ops-toggle__label">Active sur le site</span>
                </label>
              </div>
              {formError ? <div className="ops-error" role="alert">{formError}</div> : null}
              <div className="ops-modal__actions">
                <button type="button" className="ops-btn" onClick={() => setCatModal(null)} disabled={saving}>Annuler</button>
                <button type="submit" className="ops-btn ops-btn--primary" disabled={saving}>{saving ? "…" : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {platModal ? (
        <div className="ops-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && !saving) setPlatModal(null); }}>
          <div className="ops-modal ops-modal--lg" role="dialog" aria-modal="true">
            <header className="ops-modal__head">
              <h2>{platModal.mode === "edit" ? "Modifier le plat" : "Nouveau plat"}</h2>
              <button type="button" className="ops-modal__close" onClick={() => setPlatModal(null)} aria-label="Fermer">&times;</button>
            </header>
            <form className="ops-modal__form" onSubmit={savePlat}>
              <div className="ops-settings-grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
                <label className="ops-settings-field">
                  <span className="ops-settings-field__label">Nom</span>
                  <input className="ops-settings-field__input" value={platForm.nom} onChange={(e) => setPlatForm((f) => ({ ...f, nom: e.target.value }))} required />
                </label>
                <label className="ops-settings-field">
                  <span className="ops-settings-field__label">Prix (€)</span>
                  <input className="ops-settings-field__input" value={platForm.prix} onChange={(e) => setPlatForm((f) => ({ ...f, prix: e.target.value }))} inputMode="decimal" required />
                </label>
              </div>
              <label className="ops-settings-field">
                <span className="ops-settings-field__label">Description</span>
                <textarea className="ops-settings-field__input" rows={3} value={platForm.description} onChange={(e) => setPlatForm((f) => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
              </label>
              <AdminImageUpload token={token} label="Image du plat (optionnel)" value={platForm.imageUrl} onChange={(url) => setPlatForm((f) => ({ ...f, imageUrl: url }))} />
              <div className="ops-settings-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <label className="ops-settings-field">
                  <span className="ops-settings-field__label">Sous-section</span>
                  <input className="ops-settings-field__input" value={platForm.sousSection} onChange={(e) => setPlatForm((f) => ({ ...f, sousSection: e.target.value }))} placeholder="Ex. Café, Thé" />
                </label>
                <label className="ops-settings-field">
                  <span className="ops-settings-field__label">Ordre</span>
                  <input className="ops-settings-field__input" type="number" value={platForm.ordreAffichage} onChange={(e) => setPlatForm((f) => ({ ...f, ordreAffichage: e.target.value }))} />
                </label>
              </div>
              <div className="ops-settings-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <label className="ops-toggle">
                  <input type="checkbox" checked={platForm.disponibleEmporter} onChange={(e) => setPlatForm((f) => ({ ...f, disponibleEmporter: e.target.checked }))} />
                  <span className="ops-toggle__track" />
                  <span className="ops-toggle__label">Dispo. emporter</span>
                </label>
                <label className="ops-toggle">
                  <input type="checkbox" checked={platForm.disponibleLivraison} onChange={(e) => setPlatForm((f) => ({ ...f, disponibleLivraison: e.target.checked }))} />
                  <span className="ops-toggle__track" />
                  <span className="ops-toggle__label">Dispo. livraison</span>
                </label>
                <label className="ops-toggle">
                  <input type="checkbox" checked={platForm.featured} onChange={(e) => setPlatForm((f) => ({ ...f, featured: e.target.checked }))} />
                  <span className="ops-toggle__track" />
                  <span className="ops-toggle__label">Mis en avant</span>
                </label>
              </div>
              {formError ? <div className="ops-error" role="alert">{formError}</div> : null}
              <div className="ops-modal__actions">
                <button type="button" className="ops-btn" onClick={() => setPlatModal(null)} disabled={saving}>Annuler</button>
                <button type="submit" className="ops-btn ops-btn--primary" disabled={saving}>{saving ? "…" : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Confirmer la suppression"
        message={deleteTarget?.type === "cat" ? `Supprimer la section « ${deleteTarget.label} » et tous ses plats ?` : `Supprimer « ${deleteTarget?.label} » de la carte ?`}
        confirmLabel="Supprimer"
        danger busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}

export default CarteManagePage;
