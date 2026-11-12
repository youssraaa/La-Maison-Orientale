import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import { getPaymentMethodLabel } from "../../order/utils/paymentMethods";
import staffOpsApi from "../api/staffOpsApi";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";

const STATUT_LABEL = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête",
  REMIS: "Remise",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

const STATUT_FLOW = {
  CONFIRMEE: { label: "Préparer", next: "EN_PREPARATION" },
  EN_PREPARATION: { label: "Marquer prête", next: "PRETE" },
  PRETE: { label: "Terminer", next: "LIVREE" },
  EN_ATTENTE: { label: "Prendre en charge", next: "CONFIRMEE" },
};

function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function formatElapsed(createdAt) {
  if (!createdAt) return "";
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff < 0) return "à l'instant";
  const m = Math.floor(diff / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${String(m % 60).padStart(2, "0")}`;
  return `${m}min`;
}

function urgencyLevel(createdAt, statut) {
  if (["LIVREE", "REMIS", "ANNULEE", "PRETE"].includes(statut)) return "none";
  if (!createdAt) return "none";
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff > 900) return "high";
  if (diff > 420) return "medium";
  return "none";
}

function todayStr() {
  return new Date().toLocaleDateString("sv-SE");
}

function todayLabel() {
  return new Date().toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHistoryDate(isoDate) {
  if (!isoDate) return "Date inconnue";
  return new Date(isoDate).toLocaleDateString("fr-BE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function modeLabel(mode) {
  return mode === "LIVRAISON" ? "Livraison" : "À emporter";
}

function nextCompletionAction(order) {
  if (order.statut !== "PRETE") return STATUT_FLOW[order.statut];
  return order.mode === "LIVRAISON"
    ? { label: "Marquer livrée", next: "LIVREE" }
    : { label: "Marquer remise", next: "REMIS" };
}

function CommandesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

function FactureBlock({ row }) {
  const lines = row.lignes || [];
  if (lines.length === 0) return null;

  return (
    <section className="order-detail-invoice">
      <div className="order-detail-section-title">Détail de la facture</div>
      <div className="order-detail-invoice__box">
        {lines.map((line, index) => (
          <div className="order-detail-invoice__line" key={`${line.nom}-${index}`}>
            <span><strong>{line.quantite}×</strong> {line.nom}</span>
            <span>{formatPrice((Number(line.prixUnitaire) || 0) * (line.quantite || 0))}</span>
          </div>
        ))}
        <div className="order-detail-invoice__total">
          <span>Total TTC</span>
          <span>{formatPrice(row.total)}</span>
        </div>
      </div>
    </section>
  );
}

function PreparationBlock({ row }) {
  const lines = row.lignes || [];
  return (
    <section className="order-preparation-block">
      <div className="order-detail-section-title">À préparer</div>
      {lines.length === 0 ? (
        <p className="order-preparation-block__empty">Aucun article détaillé pour cette commande.</p>
      ) : (
        <div className="order-preparation-block__list">
          {lines.map((line, index) => (
            <div className="order-preparation-block__item" key={`${line.nom}-${index}`}>
              <strong>{line.quantite}×</strong>
              <span>{line.nom}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DetailModal({ row, onClose, onAction, busyId }) {
  if (!row) return null;
  const nextAction = nextCompletionAction(row);
  const isActive = ["CONFIRMEE", "EN_PREPARATION", "PRETE"].includes(row.statut);

  function printReceipt() {
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Reçu ${row.reference}</title>
      <style>
        body{font-family:Georgia,serif;max-width:340px;margin:2rem auto;padding:0 1rem;color:#2a1810}
        h1{font-size:1.1rem;text-align:center;margin:0 0 0.3rem;color:#7a1520}
        .sub{text-align:center;font-size:0.75rem;color:#8a7364;margin-bottom:1rem}
        .sep{border:none;border-top:1px dashed #d4c8b8;margin:0.8rem 0}
        table{width:100%;font-size:0.85rem;border-collapse:collapse}
        td{padding:0.25rem 0}
        .tot{font-weight:700;font-size:1rem;border-top:2px solid #7a1520;padding-top:0.5rem}
        .foot{text-align:center;font-size:0.7rem;color:#8a7364;margin-top:1rem}
        .mode{text-align:center;font-size:0.8rem;font-weight:600;color:#7a1520;margin:0.5rem 0}
      </style></head><body>
      <h1>La Maison Orientale</h1>
      <div class="sub">${row.reference} · ${formatDate(row.createdAt)}</div>
      <div class="mode">${row.mode === "LIVRAISON" ? "🛵 Livraison" : "📦 Emporter"}</div>
      <hr class="sep"/>
      <div style="font-size:0.85rem;margin-bottom:0.5rem"><strong>${row.nomClient}</strong></div>
      ${row.adresseLivraison ? `<div style="font-size:0.8rem;color:#8a7364;margin-bottom:0.5rem">${row.adresseLivraison}</div>` : ""}
      <hr class="sep"/>
      <table>
        ${(row.lignes || []).map((l) => `<tr><td>${l.quantite}× ${l.nom}</td><td style="text-align:right">${formatPrice(l.prixUnitaire * l.quantite)}</td></tr>`).join("")}
        <tr><td class="tot">Total TTC</td><td class="tot" style="text-align:right">${formatPrice(row.total)}</td></tr>
      </table>
      ${row.commentaire ? `<div style="margin-top:0.75rem;font-size:0.8rem;color:#8a7364;font-style:italic">"${row.commentaire}"</div>` : ""}
      <hr class="sep"/>
      <div class="foot">Merci et à bientôt !</div>
    </body></html>`);
    w.document.close();
    w.print();
  }

  return (
    <div className="order-detail-overlay" onClick={onClose}>
      <div className="admin-confirm order-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-confirm__glow" />
        <div style={{ padding: "1.5rem" }}>
          <div className="order-detail-modal__header">
            <div>
              <p className="order-detail-modal__kicker">Détail de la commande</p>
              <h2>
                {row.reference}
              </h2>
              <p className="order-detail-modal__client">
                {row.nomClient || "Client sans nom"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="order-detail-modal__close"
            >
              ×
            </button>
          </div>

          <div className="order-detail-modal__summary">
            {[
              { label: "Statut", value: null, badge: true },
              row.telephoneClient ? { label: "Téléphone", value: row.telephoneClient } : null,
              row.emailClient ? { label: "E-mail", value: row.emailClient } : null,
              { label: "Paiement", value: getPaymentMethodLabel(row.modePaiement) },
              row.adresseLivraison ? { label: "Adresse", value: row.adresseLivraison, alignRight: true } : null,
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="order-detail-modal__info-row">
                <span>{item.label}</span>
                {item.badge ? (
                  <span className={`ops-badge ops-badge--${row.statut.toLowerCase()}`}>
                    <span className="ops-badge__dot" />
                    {STATUT_LABEL[row.statut] || row.statut}
                  </span>
                ) : (
                  <span className={item.alignRight ? "is-address" : ""}>{item.value}</span>
                )}
              </div>
            ))}
          </div>

          <div className="order-client-confirmation">
            <span>Confirmation client</span>
            <strong>{row.statut === "EN_ATTENTE" ? "À confirmer par le restaurant" : "Commande confirmée"}</strong>
            <small>Reçue {formatElapsed(row.createdAt) ? `il y a ${formatElapsed(row.createdAt)}` : "à l'instant"}</small>
          </div>

          <PreparationBlock row={row} />

          <FactureBlock row={row} />

          {row.commentaire ? (
              <div className="order-detail-modal__note">
              <span>Note client</span>
              <p>{row.commentaire}</p>
            </div>
          ) : null}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {nextAction && (
              <button
                type="button"
                className="ops-btn ops-btn--ok"
                disabled={busyId === row.id}
                onClick={() => { onAction(row.id, nextAction.next); onClose(); }}
              >
                {nextAction.label}
              </button>
            )}
            {isActive && (
              <button
                type="button"
                className="ops-btn ops-btn--danger"
                disabled={busyId === row.id}
                onClick={() => { onAction(row.id, "ANNULEE"); onClose(); }}
              >
                Annuler
              </button>
            )}
            {row.statut === "ANNULEE" && (
              <button
                type="button"
                className="ops-btn ops-btn--ghost"
                disabled={busyId === row.id}
                onClick={() => { onAction(row.id, "CONFIRMEE"); onClose(); }}
              >
                Réactiver
              </button>
            )}
            <button
              type="button"
              className="ops-btn ops-btn--ghost"
              onClick={printReceipt}
              style={{ marginLeft: "auto" }}
            >
              Imprimer reçu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ c, onOpen, onAction, busyId, isToday }) {
  const level = urgencyLevel(c.createdAt, c.statut);
  const nextAction = nextCompletionAction(c);
  const elapsed = formatElapsed(c.createdAt);
  const completed = ["LIVREE", "REMIS"].includes(c.statut);

  return (
    <div
      className={`ops-c-card ops-c-card--${level}`}
      onClick={() => onOpen(c)}
    >
      <div className="ops-c-card__urgency">
        {level === "high" && <span className="ops-c-card__pulse" />}
        {level === "medium" && <span className="ops-c-card__dot-warn" />}
      </div>

      <div className="ops-c-card__time">
        {completed ? (
          <span className="ops-c-card__completed">Terminé</span>
        ) : isToday && elapsed ? (
          <span className={`ops-c-card__elapsed${level === "high" ? " ops-c-card__elapsed--high" : level === "medium" ? " ops-c-card__elapsed--medium" : ""}`}>
            {elapsed}
          </span>
        ) : (
          <span className="ops-c-card__hour">{c.createdAt ? new Date(c.createdAt).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
        )}
      </div>

      <div className={`ops-c-card__body ops-c-card__body--${String(c.mode || "emporter").toLowerCase()}`}>
        <div className="ops-c-card__ref">{c.reference}</div>
        <div className="ops-c-card__meta">
          <span>{c.nomClient || "—"}</span>
          <span className="ops-c-card__mode">{c.mode === "LIVRAISON" ? "🛵" : "📦"} {modeLabel(c.mode)}</span>
          <span style={{ fontWeight: 700, color: "var(--admin-burgundy-deep)" }}>{formatPrice(c.total)}</span>
        </div>
        {c.mode === "LIVRAISON" && c.adresseLivraison ? (
          <div className="ops-c-card__address">Livraison : {c.adresseLivraison}</div>
        ) : null}
        {c.lignes && c.lignes.length > 0 && (
          <div className="ops-c-card__items">
            {c.lignes.slice(0, 3).map((l, i) => (
              <span key={i}>{l.quantite}× {l.nom}</span>
            ))}
            {c.lignes.length > 3 && <span>+{c.lignes.length - 3} autres</span>}
          </div>
        )}
      </div>

      <div className="ops-c-card__status">
        <span className={`ops-badge ops-badge--${c.statut.toLowerCase()}`}>
          <span className="ops-badge__dot" />
          {STATUT_LABEL[c.statut] || c.statut}
        </span>
      </div>

      {isToday && (
        <div className="ops-c-card__action" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="ops-c-card__details-btn"
            onClick={() => onOpen(c)}
          >
            Détails
          </button>
          {nextAction ? <button
            type="button"
            className="ops-c-card__progress-btn"
            disabled={busyId === c.id}
            onClick={() => onAction(c.id, nextAction.next)}
            title={nextAction.label}
          >
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
            <span>{nextAction.label}</span>
          </button> : null}
        </div>
      )}
    </div>
  );
}

function CommandesManagePage() {
  const { token, logout } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("today");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const refreshRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const dateParam = viewMode === "today" ? todayStr() : undefined;
      const data = await staffOpsApi.listCommandes(token, { date: dateParam });
      setCommandes(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Impossible de charger les commandes.");
    } finally { setLoading(false); }
  }, [token, logout, viewMode]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (viewMode !== "today") return;
    refreshRef.current = setInterval(() => {
      staffOpsApi.listCommandes(token, { date: todayStr() }).then((data) => {
        if (Array.isArray(data)) setCommandes(data);
      }).catch(() => {});
    }, 30000);
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [token, viewMode]);

  const visible = useMemo(() => {
    let list = commandes;
    if (filter !== "ALL") list = list.filter((c) => c.statut === filter);
    if (modeFilter !== "ALL") list = list.filter((c) => c.mode === modeFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) =>
        [c.reference, c.nomClient, c.telephoneClient, c.mode]
          .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
    }
      const activeStatuses = ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "PRETE"];
    const isActive = (c) => activeStatuses.includes(c.statut);
    list = [...list].sort((a, b) => {
      if (viewMode === "all") return (b.createdAt || "").localeCompare(a.createdAt || "");
      if (isActive(a) && !isActive(b)) return -1;
      if (!isActive(a) && isActive(b)) return 1;
      if (isActive(a) && isActive(b)) return (a.createdAt || "").localeCompare(b.createdAt || "");
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
    return list;
  }, [commandes, filter, modeFilter, query, viewMode]);

  const filterCounts = useMemo(() => {
    const counts = { ALL: commandes.length };
    ["CONFIRMEE", "EN_PREPARATION", "PRETE", "REMIS", "LIVREE", "ANNULEE"].forEach((s) => {
      counts[s] = commandes.filter((c) => c.statut === s).length;
    });
    return counts;
  }, [commandes]);

  const activeCount = commandes.filter((c) => ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "PRETE"].includes(c.statut)).length;
  const deliveryCount = commandes.filter((c) => c.mode === "LIVRAISON").length;
  const pickupCount = commandes.filter((c) => c.mode !== "LIVRAISON").length;

  async function changeStatut(id, statut) {
    setBusyId(id);
    setError("");
    try {
      await staffOpsApi.updateCommandeStatut(token, id, statut);
      setCommandes((prev) => prev.map((c) => (c.id === id ? { ...c, statut } : c)));
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Mise à jour impossible.");
    } finally { setBusyId(null); }
  }

  return (
    <AdminShell active="commandes" title="Commandes">
      <AdminPageShell
        pageClass="admin-ops-shell"
        title="Commandes"
        lead={viewMode === "today" ? "Commandes d'aujourd'hui" : "Historique des commandes"}
        icon={CommandesIcon}
        statusChip={
          viewMode === "today" && activeCount > 0
            ? { label: `${activeCount} en cours`, tone: "alert" }
            : viewMode === "today"
              ? { label: `${commandes.length} cmd aujourd'hui`, tone: "ok" }
              : { label: `${commandes.length} au total`, tone: "ok" }
        }
      >
        {viewMode === "today" ? (
          <section className="orders-today-heading" aria-labelledby="orders-today-title">
            <p>Service d'aujourd'hui</p>
            <h2 id="orders-today-title">{todayLabel()}</h2>
            <span>Commandes à traiter maintenant</span>
          </section>
        ) : null}
        {viewMode === "today" && (
          <div className="ops-stat-bar">
            <div className="ops-stat-bar__item">
              <span className="ops-stat-bar__dot ops-stat-bar__dot--copper" />
              <div className="ops-stat-bar__text">
                <span className="ops-stat-bar__value">{filterCounts.CONFIRMEE || 0}</span>
                <span className="ops-stat-bar__label">À préparer</span>
              </div>
            </div>
            <div className="ops-stat-bar__item">
              <span className="ops-stat-bar__dot ops-stat-bar__dot--teal" />
              <div className="ops-stat-bar__text">
                <span className="ops-stat-bar__value">{filterCounts.EN_PREPARATION || 0}</span>
                <span className="ops-stat-bar__label">En préparation</span>
              </div>
            </div>
            <div className="ops-stat-bar__item">
              <span className="ops-stat-bar__dot ops-stat-bar__dot--olive" />
              <div className="ops-stat-bar__text">
                <span className="ops-stat-bar__value">{filterCounts.PRETE || 0}</span>
                <span className="ops-stat-bar__label">Prêtes</span>
              </div>
            </div>
            <div className="ops-stat-bar__item">
              <span className="ops-stat-bar__dot ops-stat-bar__dot--burgundy" />
              <div className="ops-stat-bar__text">
                <span className="ops-stat-bar__value">{deliveryCount}</span>
                <span className="ops-stat-bar__label">Livraisons</span>
              </div>
            </div>
            <div className="ops-stat-bar__item">
              <span className="ops-stat-bar__dot ops-stat-bar__dot--teal" />
              <div className="ops-stat-bar__text">
                <span className="ops-stat-bar__value">{pickupCount}</span>
                <span className="ops-stat-bar__label">À emporter</span>
              </div>
            </div>
          </div>
        )}

        {error ? <div className="ops-error" role="alert">{error}</div> : null}

        <div className="ops-toolbar">
          <div className="ops-toolbar__left" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "inline-flex", padding: "0.15rem", borderRadius: "999px", border: "1px solid rgba(180,35,46,0.14)", background: "#fff" }}>
              <button
                type="button"
                className={`ops-chip${viewMode === "today" ? " is-active" : ""}`}
                onClick={() => { setViewMode("today"); setFilter("ALL"); }}
                style={{ borderRadius: "999px", border: "none" }}
              >
                Aujourd&apos;hui
              </button>
              <button
                type="button"
                className={`ops-chip${viewMode === "all" ? " is-active" : ""}`}
                onClick={() => { setViewMode("all"); setFilter("ALL"); }}
                style={{ borderRadius: "999px", border: "none" }}
              >
                Historique
              </button>
            </div>
            <div className="ops-search">
              <svg className="ops-search__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="search"
                placeholder="Rechercher référence, client…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="ops-filters ops-filters--inline">
              {[['ALL', 'Tous les modes'], ['LIVRAISON', 'Livraisons'], ['EMPORTER', 'À emporter']].map(([id, label]) => (
                <button key={id} type="button" className={`ops-chip${modeFilter === id ? " is-active" : ""}`} onClick={() => setModeFilter(id)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="ops-toolbar__right">
            <button type="button" className="ops-btn ops-btn--ghost" onClick={load} disabled={loading}>
              Actualiser
            </button>
          </div>
        </div>

        <div className="ops-filters">
          {[
            { id: "ALL", label: "Toutes" },
            { id: "CONFIRMEE", label: "À préparer" },
            { id: "EN_PREPARATION", label: "En préparation" },
            { id: "PRETE", label: "Prêtes" },
            { id: "REMIS", label: "Remises" },
            { id: "LIVREE", label: "Livrées" },
            ...(viewMode === "all" ? [{ id: "ANNULEE", label: "Annulées" }] : []),
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              className={`ops-chip${filter === s.id ? " is-active" : ""}`}
              onClick={() => setFilter(s.id)}
            >
              {s.label}
              <span className="ops-chip__count">{filterCounts[s.id] || 0}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ops-loading">
            <span className="ops-loading__spinner" />
            Chargement…
          </div>
        ) : visible.length === 0 ? (
          <div className="ops-empty">
            <div className="ops-empty__icon">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>
            </div>
            <p className="ops-empty__text">
              {viewMode === "today" ? "Aucune commande aujourd'hui" : "Aucune commande dans l'historique"}
            </p>
          </div>
        ) : viewMode === "today" ? (
          <div className="ops-c-list">
            {visible.map((c) => (
              <OrderCard
                key={c.id}
                c={c}
                onOpen={setDetailRow}
                onAction={changeStatut}
                busyId={busyId}
                isToday={true}
              />
            ))}
          </div>
        ) : (
          <div className="ops-table-card">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Client</th>
                  <th>Mode</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr
                    key={c.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setDetailRow(c)}
                  >
                    <td><strong>{c.reference}</strong><div className="ops-muted">{formatHistoryDate(c.createdAt)}</div></td>
                    <td>
                      <strong>{c.nomClient || "—"}</strong>
                      {c.telephoneClient ? <div className="ops-muted">{c.telephoneClient}</div> : null}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem" }}>
                        {modeLabel(c.mode)}
                      </span>
                    </td>
                    <td><strong>{formatPrice(c.total)}</strong></td>
                    <td>
                      <span className={`ops-badge ops-badge--${c.statut.toLowerCase()}`}>
                        <span className="ops-badge__dot" />
                        {STATUT_LABEL[c.statut] || c.statut}
                      </span>
                    </td>
                    <td className="ops-table__action-col">
                      <button type="button" className="ops-btn--details" onClick={(event) => { event.stopPropagation(); setDetailRow(c); }}>
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPageShell>

      <DetailModal row={detailRow} onClose={() => setDetailRow(null)} onAction={changeStatut} busyId={busyId} />
    </AdminShell>
  );
}

export default CommandesManagePage;
