import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import staffOpsApi from "../api/staffOpsApi";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";
import { getFormBannerMessage, mergeApiError } from "../../../common/utils/formErrors";
import { validateRequired } from "../../../common/utils/formValidation";

const STATUT_LABEL = {
  NOUVELLE: "Nouvelle",
  TRAITEE: "Traitée",
};

const FILTERS = [
  { id: "ALL", label: "Tous" },
  { id: "NOUVELLE", label: "Nouveaux" },
  { id: "TRAITEE", label: "Traités" },
];

function formatWhen(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-BE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessagesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function MessagesManagePage() {
  const { token, logout } = useAuth();
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffOpsApi.listMessages(token);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      setError(err.message || "Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setReplyText("");
  }, [selected?.id]);

  const visible = useMemo(() => {
    if (filter === "ALL") return rows;
    return rows.filter((r) => r.statut === filter);
  }, [rows, filter]);

  const newCount = rows.filter((r) => r.statut === "NOUVELLE").length;
  const treatedCount = rows.filter((r) => r.statut === "TRAITEE").length;

  const filterCounts = {
    ALL: rows.length,
    NOUVELLE: newCount,
    TRAITEE: treatedCount,
  };

  async function setStatut(id, statut) {
    setBusyId(id);
    setError("");
    try {
      const updated = await staffOpsApi.updateMessageStatut(token, id, statut);
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setSelected((prev) => (prev?.id === id ? updated : prev));
      window.dispatchEvent(new Event("lmo-messages-updated"));
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusyId(null);
    }
  }

  function validateReplyText(text) {
    const required = validateRequired(text, "Le texte ne peut pas être vide.");
    if (required) return required;
    if (text.length > 4000) return "Le texte ne peut pas dépasser 4000 caractères.";
    return null;
  }

  async function sendReply() {
    if (!selected) return;
    setError("");
    const text = replyText.trim();
    const validationError = validateReplyText(text);
    if (validationError) {
      setError(validationError);
      return;
    }
    setReplyBusy(true);
    try {
      const updated = await staffOpsApi.replyMessage(token, selected.id, text);
      setRows((prev) => prev.map((r) => (r.id === selected.id ? updated : r)));
      setSelected(updated);
      setReplyText("");
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      setError(getFormBannerMessage(mergeApiError(err), err.message || "Impossible d'envoyer la réponse."));
    } finally {
      setReplyBusy(false);
    }
  }

  async function sendNote() {
    if (!selected) return;
    setError("");
    const text = replyText.trim();
    const validationError = validateReplyText(text);
    if (validationError) {
      setError(validationError);
      return;
    }
    setReplyBusy(true);
    try {
      const updated = await staffOpsApi.addMessageNote(token, selected.id, text);
      setRows((prev) => prev.map((r) => (r.id === selected.id ? updated : r)));
      setSelected(updated);
      setReplyText("");
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      setError(getFormBannerMessage(mergeApiError(err), err.message || "Impossible d'enregistrer la note."));
    } finally {
      setReplyBusy(false);
    }
  }

  return (
    <AdminShell active="messages" title="Messages">
      <AdminPageShell
        pageClass="admin-ops-shell"
        title="Demandes via le formulaire"
        lead={`${rows.length} message${rows.length > 1 ? "s" : ""} reçu${rows.length > 1 ? "s" : ""}`}
        icon={MessagesIcon}
        statusChip={
          newCount > 0
            ? { label: `${newCount} non traité${newCount > 1 ? "s" : ""}`, tone: "alert" }
            : { label: "Boîte à jour", tone: "ok" }
        }
      >
        <div className="ops-stat-bar">
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--burgundy" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{rows.length}</span>
              <span className="ops-stat-bar__label">Total</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--teal" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{newCount}</span>
              <span className="ops-stat-bar__label">Nouveaux</span>
            </div>
          </div>
          <div className="ops-stat-bar__item">
            <span className="ops-stat-bar__dot ops-stat-bar__dot--olive" />
            <div className="ops-stat-bar__text">
              <span className="ops-stat-bar__value">{treatedCount}</span>
              <span className="ops-stat-bar__label">Traités</span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="ops-error" role="alert">{error}</div>
        ) : null}

        <div className="ops-toolbar">
          <div className="ops-toolbar__left">
            <div className="ops-filters" style={{ padding: 0, border: "none", background: "transparent" }}>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`ops-chip${filter === f.id ? " is-active" : ""}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                  <span className="ops-chip__count">{filterCounts[f.id] || 0}</span>
                </button>
              ))}
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
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>
            </div>
            <p className="ops-empty__text">Aucun message pour ce filtre</p>
          </div>
        ) : (
          <div className="ops-split">
            <div className="ops-split__list">
              {visible.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className={`ops-list-item${selected?.id === row.id ? " is-active" : ""}`}
                  onClick={() => setSelected(row)}
                >
                  <span className="ops-list-item__name">{row.nom || "—"}</span>
                  <span className="ops-list-item__sub">{row.sujet || "Sans sujet"}</span>
                  <span className="ops-list-item__meta">
                    <span className={`ops-badge ops-badge--${row.statut.toLowerCase()}`} style={{ fontSize: "0.62rem", padding: "0.12rem 0.4rem" }}>
                      {STATUT_LABEL[row.statut] || row.statut}
                    </span>
                    {formatWhen(row.createdAt)}
                  </span>
                </button>
              ))}
            </div>

            <div className="ops-split__detail">
              {!selected ? (
                <div className="ops-empty">
                  <div className="ops-empty__icon">
                    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>
                  </div>
                  <p className="ops-empty__text">Sélectionnez un message</p>
                  <p className="ops-empty__hint">pour le lire et y répondre</p>
                </div>
              ) : (
                <>
                  <div className="ops-detail-head">
                    <div>
                      <h2>{selected.sujet || "Message"}</h2>
                      <p>
                        {selected.nom} · {selected.email || "—"} · {selected.telephone || "—"}
                      </p>
                    </div>
                    <span className={`ops-badge ops-badge--${selected.statut.toLowerCase()}`}>
                      <span className="ops-badge__dot" />
                      {STATUT_LABEL[selected.statut] || selected.statut}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 1rem", fontSize: "0.88rem", fontWeight: 600, color: "#2a1810", lineHeight: 1.6 }}>
                    {selected.message}
                  </p>

                  {selected.reponseClient ? (
                    <div className="ops-note-box ops-note-box--reply">
                      <strong>Réponse envoyée au client · {formatWhen(selected.reponseAt)}</strong>
                      <p>{selected.reponseClient}</p>
                    </div>
                  ) : null}

                  {selected.reponseInterne ? (
                    <div className="ops-note-box">
                      <strong>Note interne · {formatWhen(selected.reponseAt)}</strong>
                      <p>{selected.reponseInterne}</p>
                    </div>
                  ) : null}

                  <div className="ops-reply">
                    <p className="ops-reply__label">
                      {selected.email ? "Répondre par e-mail" : "Note interne (sans e-mail client)"}
                    </p>
                    <textarea
                      rows={5}
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder={
                        selected.email
                          ? "Votre réponse au client…"
                          : "Ex. Client rappelé par téléphone, demande traitée…"
                      }
                    />
                    <div className="ops-actions" style={{ justifyContent: "flex-end" }}>
                      {selected.email ? (
                        <button
                          type="button"
                          className="ops-btn ops-btn--ok"
                          disabled={replyBusy || !replyText.trim()}
                          onClick={sendReply}
                        >
                          {replyBusy ? "Envoi…" : "Envoyer la réponse"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ops-btn ops-btn--ok"
                          disabled={replyBusy || !replyText.trim()}
                          onClick={sendNote}
                        >
                          {replyBusy ? "Enregistrement…" : "Enregistrer la note"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="ops-actions" style={{ marginTop: "0.75rem" }}>
                    {selected.statut === "NOUVELLE" ? (
                      <button
                        type="button"
                        className="ops-btn ops-btn--ok"
                        disabled={busyId === selected.id}
                        onClick={() => setStatut(selected.id, "TRAITEE")}
                      >
                        ✓ Marquer comme traité
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="ops-btn ops-btn--ghost"
                        disabled={busyId === selected.id}
                        onClick={() => setStatut(selected.id, "NOUVELLE")}
                      >
                        Remettre en nouveau
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </AdminPageShell>
    </AdminShell>
  );
}

export default MessagesManagePage;
