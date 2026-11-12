import { Link } from "react-router-dom";

const STATUT_LABEL = {
  NOUVELLE: "Nouvelle",
  TRAITEE: "Traitée",
};

function formatRelative(isoInstant) {
  if (!isoInstant) return "";
  const diffMin = Math.round((Date.now() - new Date(isoInstant).getTime()) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}

function formatWhen(isoInstant) {
  if (!isoInstant) return "";
  return new Date(isoInstant).toLocaleString("fr-BE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text, max = 120) {
  if (!text) return "";
  const clean = text.trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export default function DashboardRecentMessages({ messages, messagesLink, newCount = 0 }) {
  return (
    <aside className="admin-dash__messages-panel client-portal-block">
      <header className="admin-dash__messages-head">
        <div>
          <p className="admin-dash__messages-kicker">À traiter</p>
          <h3>Messages récents</h3>
        </div>
        {newCount > 0 ? (
          <span className="admin-dash__messages-badge">{newCount} nouveau{newCount > 1 ? "x" : ""}</span>
        ) : null}
      </header>

      {messages.length === 0 ? (
        <p className="admin-dash__empty admin-dash__empty--compact">Aucun message récent.</p>
      ) : (
        <ul className="admin-dash__inbox admin-dash__inbox--panel">
          {messages.map((msg) => (
            <li key={msg.id} className="admin-dash__msg">
              <div className="admin-dash__msg-top">
                <strong>{msg.nom}</strong>
                <span className={`admin-dash__pill admin-dash__pill--${msg.statut.toLowerCase()}`}>
                  {STATUT_LABEL[msg.statut] || msg.statut}
                </span>
              </div>
              <p className="admin-dash__msg-subject">{msg.sujet || "Sans sujet"}</p>
              <p className="admin-dash__msg-preview">{truncate(msg.message, 120)}</p>
              <div className="admin-dash__msg-footer">
                <span className="admin-dash__msg-contact">{msg.email || "—"}</span>
                <span className="admin-dash__msg-when">{formatRelative(msg.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="admin-dash__messages-foot">
        <Link to={messagesLink} className="client-home__action client-home__action--ghost">
          Voir tous les messages →
        </Link>
      </footer>
    </aside>
  );
}
