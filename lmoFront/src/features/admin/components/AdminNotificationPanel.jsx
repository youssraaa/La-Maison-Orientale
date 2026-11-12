import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import notificationsApi from "../api/notificationsApi";

const TYPE_LABEL = {
  NOUVELLE_RESERVATION: "Réservation",
  NOUVEAU_MESSAGE: "Message contact",
  NOUVELLE_COMMANDE: "Commande",
  AGENT_INVITE: "Agent",
  SYSTEME: "Système",
};

const PREVIEW_LIMIT = 6;

function formatWhen(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (sameDay) {
    return date.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminNotificationPanel({ token, open, onClose, unreadCount, onUpdated }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await notificationsApi.list(token);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Impossible de charger les notifications.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    function onPointerDown(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose]);

  async function openNotification(notification) {
    if (!notification.lue) {
      try {
        await notificationsApi.markRead(token, notification.id);
        onUpdated?.();
      } catch {
        /* silencieux */
      }
    }
    onClose();
    if (notification.lien) {
      navigate(notification.lien);
    } else {
      navigate("/admin/notifications");
    }
  }

  const preview = rows.slice(0, PREVIEW_LIMIT);

  if (!open) return null;

  return (
    <div className="admin-notif-panel" ref={panelRef} role="dialog" aria-label="Notifications récentes">
      <header className="admin-notif-panel__head">
        <strong>Notifications</strong>
        {unreadCount > 0 ? (
          <span className="admin-notif-panel__count">
            {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
          </span>
        ) : null}
      </header>

      <div className="admin-notif-panel__body">
        {loading ? (
          <p className="admin-notif-panel__empty">Chargement…</p>
        ) : error ? (
          <p className="admin-notif-panel__empty admin-notif-panel__empty--error">{error}</p>
        ) : preview.length === 0 ? (
          <p className="admin-notif-panel__empty">Aucune notification pour le moment.</p>
        ) : (
          <ul className="admin-notif-panel__list">
            {preview.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`admin-notif-panel__item${!item.lue ? " is-unread" : ""}`}
                  onClick={() => openNotification(item)}
                >
                  <span className="admin-notif-panel__type">
                    {TYPE_LABEL[item.type] || item.type}
                  </span>
                  <strong>{item.titre}</strong>
                  {item.message ? <p>{item.message}</p> : null}
                  <time>{formatWhen(item.createdAt)}</time>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="admin-notif-panel__foot">
        <Link to="/admin/notifications" className="admin-notif-panel__all" onClick={onClose}>
          Voir tout
        </Link>
      </footer>
    </div>
  );
}

export default AdminNotificationPanel;
