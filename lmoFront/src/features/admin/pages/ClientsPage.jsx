import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../../common/auth/AuthContext";
import staffOpsApi from "../api/staffOpsApi";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";
import { openOrderReceiptPreview } from "../../order/utils/printOrderReceipt";

const STATUT_LABEL = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  REFUSEE: "Refusée",
  ANNULEE: "Annulée",
  ARRIVEE: "Arrivée",
  NO_SHOW: "No-show",
  NOUVELLE: "Nouvelle",
  TRAITEE: "Traitée",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête",
  REMIS: "Remise",
  LIVREE: "Livrée",
};

const MODE_LABEL = {
  EMPORTER: "À emporter",
  SUR_PLACE: "Sur place",
  LIVRAISON: "Livraison",
};

function formatWhen(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHeure(heure) {
  const v = String(heure || "").slice(0, 5);
  return v ? v.replace(":", "h") : "—";
}

function formatEuro(val) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(val) || 0);
}

function ClientsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function SortArrow({ direction }) {
  if (!direction) return <span className="ops-sort-arrow ops-sort-arrow--muted">⇕</span>;
  return <span className="ops-sort-arrow">{direction === "asc" ? "▲" : "▼"}</span>;
}

function DetailModal({ client, token, logout, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("reservations");
  const closeRef = useRef(null);

  async function openFacture(commandeId) {
    try {
      const cmd = await staffOpsApi.getCommande(token, commandeId);
      const receiptData = {
        reference: cmd.reference,
        nomClient: cmd.nomClient,
        createdAt: cmd.createdAt,
        mode: cmd.mode,
        statut: cmd.statut,
        adresseLivraison: cmd.adresseLivraison,
        commentaire: cmd.commentaire,
        modePaiement: cmd.modePaiement,
        total: cmd.total,
        lignes: (cmd.lignes || []).map((l) => ({
          nom: l.nom,
          prixUnitaire: l.prixUnitaire,
          quantite: l.quantite,
          sousTotal: Number(l.prixUnitaire) * l.quantite,
        })),
      };
      openOrderReceiptPreview(receiptData);
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      alert(err.message || "Impossible d'ouvrir la facture.");
    }
  }

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setActiveTab("reservations");
    setDetail(null);
    staffOpsApi
      .getClientDetail(token, { email: client.email, telephone: client.telephone, nom: client.nom })
      .then((data) => { if (!cancelled) setDetail(data); })
      .catch((err) => {
        if (err.status === 401 || err.status === 403) { logout(); return; }
        if (!cancelled) setError(err.message || "Impossible de charger la fiche.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [client, token, logout]);

  useEffect(() => {
    if (!client) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 30);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [client, onClose]);

  if (!client) return null;

  const reservations = detail?.reservations || [];
  const commandes = detail?.commandes || [];
  const messages = detail?.messages || [];

  return createPortal(
    <div className="ops-detail-overlay" onClick={onClose}>
      <div className="ops-detail-modal" role="dialog" aria-modal="true" aria-labelledby="client-detail-title" onClick={(e) => e.stopPropagation()}>
        <header className="ops-detail-modal__head">
          <div>
            <p className="ops-detail-modal__kicker">Fiche client</p>
            <h2 id="client-detail-title">{detail?.nom || client.nom || "Client"}</h2>
          </div>
          <button ref={closeRef} type="button" className="ops-detail-modal__close" aria-label="Fermer" onClick={onClose}>×</button>
        </header>

        <div className="ops-detail-modal__body">
          <div className="ops-detail-modal__summary">
            <div className="ops-detail-modal__summary-info">
              <dl className="ops-detail-modal__grid">
                <div>
                  <dt>Nom</dt>
                  <dd>{detail?.nom || client.nom || "—"}</dd>
                </div>
                <div>
                  <dt>E-mail</dt>
                  <dd>{detail?.email || client.email || "—"}</dd>
                </div>
                <div>
                  <dt>Téléphone</dt>
                  <dd>{detail?.telephone || client.telephone || "—"}</dd>
                </div>
                <div>
                  <dt>Adresse livraison</dt>
                  <dd>{client.adresseLivraison || "—"}</dd>
                </div>
                <div>
                  <dt>Première activité</dt>
                  <dd>{formatWhen(client.datePremiereActivite)}</dd>
                </div>
                <div>
                  <dt>Dernière activité</dt>
                  <dd>{formatWhen(client.derniereActivite)}</dd>
                </div>
              </dl>
            </div>
            <div className="ops-detail-modal__stat-chips">
              <span className="ops-detail-modal__chip ops-detail-modal__chip--burgundy">
                {client.nbReservations} résa.
              </span>
              <span className="ops-detail-modal__chip ops-detail-modal__chip--olive">
                {client.nbCommandes} cmd.
              </span>
              <span
                className="ops-detail-modal__chip"
                style={{ background: "rgba(226, 176, 74, 0.14)", color: "#8a6820" }}
              >
                {client.nbMessages} msg.
              </span>
            </div>
          </div>

          <div className="ops-detail-modal__tabs">
            <button
              type="button"
              className={`ops-detail-modal__tab${activeTab === "reservations" ? " is-active" : ""}`}
              onClick={() => setActiveTab("reservations")}
            >
              Réservations
              <span className="ops-detail-modal__tab-count">{reservations.length}</span>
            </button>
            <button
              type="button"
              className={`ops-detail-modal__tab${activeTab === "commandes" ? " is-active" : ""}`}
              onClick={() => setActiveTab("commandes")}
            >
              Commandes
              <span className="ops-detail-modal__tab-count">{commandes.length}</span>
            </button>
            <button
              type="button"
              className={`ops-detail-modal__tab${activeTab === "messages" ? " is-active" : ""}`}
              onClick={() => setActiveTab("messages")}
            >
              Messages
              <span className="ops-detail-modal__tab-count">{messages.length}</span>
            </button>
          </div>

          {loading ? (
            <div className="ops-loading">
              <span className="ops-loading__spinner" />
              Chargement…
            </div>
          ) : error ? (
            <div className="ops-error" role="alert">{error}</div>
          ) : activeTab === "reservations" ? (
            reservations.length === 0 ? (
              <p className="ops-empty__hint">Aucune réservation pour ce client.</p>
            ) : (
              <div className="ops-table-card" style={{ border: "none", boxShadow: "none" }}>
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Couverts</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={`resa-${r.id}`}>
                        <td>{formatWhen(r.dateReservation)}</td>
                        <td>{formatHeure(r.heureReservation)}</td>
                        <td>{r.nbPersonnes} couverts</td>
                        <td>
                          <span className={`ops-badge ops-badge--${(r.statut || "").toLowerCase()}`}>
                            <span className="ops-badge__dot" />
                            {STATUT_LABEL[r.statut] || r.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "commandes" ? (
            commandes.length === 0 ? (
              <p className="ops-empty__hint">Aucune commande pour ce client.</p>
            ) : (
              <div className="ops-table-card" style={{ border: "none", boxShadow: "none" }}>
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Réf.</th>
                      <th>Mode</th>
                      <th>Total</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th className="ops-table__action-col">Facture</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commandes.map((c) => (
                      <tr key={`cmd-${c.id}`}>
                        <td><strong>{c.reference || "—"}</strong></td>
                        <td>{MODE_LABEL[c.mode] || c.mode || "—"}</td>
                        <td><strong>{formatEuro(c.total)}</strong></td>
                        <td>
                          <span className={`ops-badge ops-badge--${(c.statut || "").toLowerCase()}`}>
                            <span className="ops-badge__dot" />
                            {STATUT_LABEL[c.statut] || c.statut}
                          </span>
                        </td>
                        <td>{formatDateTime(c.createdAt)}</td>
                        <td className="ops-table__action-col">
                          <button
                            type="button"
                            className="ops-btn ops-btn--ghost ops-btn--xs"
                            onClick={() => openFacture(c.id)}
                          >
                            Voir facture
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            messages.length === 0 ? (
              <p className="ops-empty__hint">Aucun message pour ce client.</p>
            ) : (
              <div className="ops-table-card" style={{ border: "none", boxShadow: "none" }}>
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Sujet</th>
                      <th>Message</th>
                      <th>Statut</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((m) => (
                      <tr key={`msg-${m.id}`}>
                        <td><strong>{m.sujet || "—"}</strong></td>
                        <td className="ops-table__msg-cell">{m.message}</td>
                        <td>
                          <span className={`ops-badge ops-badge--${(m.statut || "").toLowerCase()}`}>
                            <span className="ops-badge__dot" />
                            {STATUT_LABEL[m.statut] || m.statut}
                          </span>
                        </td>
                        <td>{formatDateTime(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

const COLUMNS = [
  { key: "nom", label: "Nom", sortable: true },
  { key: "email", label: "E-mail", sortable: true },
  { key: "telephone", label: "Téléphone", sortable: true },
  { key: "adresseLivraison", label: "Adresse", sortable: true },
  { key: "datePremiereActivite", label: "Inscrit le", sortable: true },
];

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => (acc != null ? acc[part] : undefined), obj);
}

function ClientsPage() {
  const { token, logout } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailClient, setDetailClient] = useState(null);
  const [sortKey, setSortKey] = useState("datePremiereActivite");
  const [sortDir, setSortDir] = useState("desc");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffOpsApi.listClients(token);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Impossible de charger la liste des clients.");
    } finally { setLoading(false); }
  }, [token, logout]);

  useEffect(() => { load(); }, [load]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const visible = useMemo(() => {
    let result = [...rows];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((row) =>
        [row.nom, row.email, row.telephone, row.adresseLivraison]
          .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      const aVal = getNestedValue(a, sortKey);
      const bVal = getNestedValue(b, sortKey);
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal, "fr") : bVal.localeCompare(aVal, "fr");
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [rows, query, sortKey, sortDir]);

  const totalReservations = rows.reduce((a, r) => a + (r.nbReservations || 0), 0);
  const totalCommandes = rows.reduce((a, r) => a + (r.nbCommandes || 0), 0);
  const totalMessages = rows.reduce((a, r) => a + (r.nbMessages || 0), 0);

  return (
    <AdminShell active="clients" title="Clients">
      <AdminPageShell
        pageClass="admin-ops-shell"
        title="Liste des clients"
        lead={`${rows.length} client${rows.length > 1 ? "s" : ""} enregistré${rows.length > 1 ? "s" : ""}`}
        icon={ClientsIcon}
      >
        <div className="ops-stat-bar">
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--burgundy" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{rows.length}</span>
              <span className="ops-stat-bar__label">Clients</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--olive" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{totalReservations}</span>
              <span className="ops-stat-bar__label">Réservations</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--gold" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{totalCommandes}</span>
              <span className="ops-stat-bar__label">Commandes</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--teal" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{totalMessages}</span>
              <span className="ops-stat-bar__label">Messages</span>
            </div>
          </div>
        </div>

        {error ? <div className="ops-error" role="alert">{error}</div> : null}

        <div className="ops-toolbar">
          <div className="ops-toolbar__left">
            <div className="ops-search">
              <svg className="ops-search__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="search"
                placeholder="Rechercher par nom, email, téléphone…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="ops-toolbar__right">
            <button type="button" className="ops-btn ops-btn--ghost" onClick={load} disabled={loading}>
              Actualiser
            </button>
          </div>
        </div>

        {loading ? (
          <div className="ops-loading">
            <span className="ops-loading__spinner" />
            Chargement…
          </div>
        ) : visible.length === 0 ? (
          <div className="ops-empty">
            <div className="ops-empty__icon">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
            </div>
            <p className="ops-empty__text">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="ops-table-card">
            <table className="ops-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key}>
                      {col.sortable ? (
                        <button
                          type="button"
                          className="ops-th-sort"
                          onClick={() => handleSort(col.key)}
                        >
                          {col.label}
                          <SortArrow direction={sortKey === col.key ? sortDir : null} />
                        </button>
                      ) : col.label}
                    </th>
                  ))}
                  <th className="ops-table__action-col">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={`${row.email || ""}-${row.telephone || ""}-${row.nom}`}>
                    <td>
                      <strong>{row.nom || "—"}</strong>
                      {row.nbReservations > 0 ? (
                        <span className="ops-count-badge ops-count-badge--burgundy" style={{ marginLeft: "0.4rem" }}>
                          {row.nbReservations} résa.
                        </span>
                      ) : null}
                    </td>
                    <td>{row.email || "—"}</td>
                    <td>{row.telephone || "—"}</td>
                    <td>{row.adresseLivraison || "—"}</td>
                    <td>{formatWhen(row.datePremiereActivite)}</td>
                    <td className="ops-table__action-col">
                      <button
                        type="button"
                        className="ops-btn ops-btn--primary"
                        onClick={() => setDetailClient(row)}
                      >
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

      <DetailModal
        client={detailClient}
        token={token}
        logout={logout}
        onClose={() => setDetailClient(null)}
      />
    </AdminShell>
  );
}

export default ClientsPage;
