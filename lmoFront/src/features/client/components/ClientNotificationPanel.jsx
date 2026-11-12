import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  fetchClientNotifications,
  markClientNotificationRead,
} from "../api/clientAccountApi";

const TYPE_LABEL = {
  RESERVATION_CONFIRMEE: "Réservation",
  RESERVATION_MODIFIEE: "Modification",
  RESERVATION_ANNULEE: "Annulation",
  COMMANDE_CONFIRMEE: "Commande",
  REPONSE_MESSAGE: "Réponse",
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

function resolveNotificationLink(notification) {
  const lien = String(notification?.lien || "").trim();
  if (lien.includes("onglet=messages")) return "/mon-compte/messages";
  if (lien.includes("onglet=notifications") || lien.includes("/messages?")) {
    return "/mon-compte/notifications";
  }
  if (lien.startsWith("/mon-compte")) return lien;
  if (lien) return lien;

  const type = String(notification?.type || "").toUpperCase();
  if (type.startsWith("RESERVATION")) return "/mon-compte/reservations";
  if (type.startsWith("COMMANDE")) return "/mon-compte/commandes";
  if (type === "REPONSE_MESSAGE") return "/mon-compte/messages";
  return "/mon-compte/notifications";
}

function notifyUpdated() {
  window.dispatchEvent(new Event("lmo-notifications-updated"));
}

export default function ClientNotificationPanel({ token, open, onClose, unreadCount, onUpdated }) {
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
      const data = await fetchClientNotifications(token);
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
        await markClientNotificationRead(token, notification.id);
        onUpdated?.();
        notifyUpdated();
      } catch {
        /* silencieux */
      }
    }
    onClose();
    navigate(resolveNotificationLink(notification));
  }

  const preview = rows.slice(0, PREVIEW_LIMIT);

  if (!open) return null;

  return (
    <div
      className="client-notif-panel"
      ref={panelRef}
      role="dialog"
      aria-label="Notifications récentes"
    >
      <header className="client-notif-panel__head">
        <strong>Notifications</strong>
        {unreadCount > 0 ? (
          <span className="client-notif-panel__count">
            {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
          </span>
        ) : null}
      </header>

      <div className="client-notif-panel__body">
        {loading ? (
          <p className="client-notif-panel__empty">Chargement…</p>
        ) : error ? (
          <p className="client-notif-panel__empty client-notif-panel__empty--error">{error}</p>
        ) : preview.length === 0 ? (
          <p className="client-notif-panel__empty">Aucune notification pour le moment.</p>
        ) : (
          <ul className="client-notif-panel__list">
            {preview.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`client-notif-panel__item${!item.lue ? " is-unread" : ""}`}
                  onClick={() => openNotification(item)}
                >
                  <span className="client-notif-panel__type">
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

      <footer className="client-notif-panel__foot">
        <Link to="/mon-compte/notifications" className="client-notif-panel__all" onClick={onClose}>
          Voir toutes les notifications
        </Link>
      </footer>
    </div>
  );
}
