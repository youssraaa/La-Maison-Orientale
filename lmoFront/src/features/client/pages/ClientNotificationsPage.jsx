import { useCallback, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import ClientFlashMessage from "../components/ClientFlashMessage";

import ClientPageHero from "../components/ClientPageHero";

import { useClientPortal } from "../components/ClientPortalLayout";

import { useClientAuth } from "../../../common/auth/ClientAuthContext";

import {

  markAllClientNotificationsRead,

  markClientNotificationRead,

} from "../api/clientAccountApi";



const TYPE_LABEL = {

  RESERVATION_CONFIRMEE: "Réservation",

  RESERVATION_MODIFIEE: "Modification",

  RESERVATION_ANNULEE: "Annulation",

  COMMANDE_CONFIRMEE: "Commande",

  REPONSE_MESSAGE: "Réponse",

};



const TYPE_STYLE = {

  RESERVATION_CONFIRMEE: {

    accent: "#7a1520",

    iconBg: "linear-gradient(135deg, rgba(180,35,46,0.14) 0%, rgba(122,21,32,0.1) 100%)",

    iconColor: "#7a1520",

  },

  RESERVATION_MODIFIEE: {

    accent: "#b8862e",

    iconBg: "linear-gradient(135deg, rgba(226,176,74,0.22) 0%, rgba(184,134,46,0.14) 100%)",

    iconColor: "#8a5a12",

  },

  RESERVATION_ANNULEE: {

    accent: "#9b2c2c",

    iconBg: "linear-gradient(135deg, rgba(180,35,46,0.12) 0%, rgba(155,44,44,0.08) 100%)",

    iconColor: "#9b2c2c",

  },

  COMMANDE_CONFIRMEE: {

    accent: "#b8862e",

    iconBg: "linear-gradient(135deg, rgba(226,176,74,0.22) 0%, rgba(184,134,46,0.14) 100%)",

    iconColor: "#8a5a12",

  },

  REPONSE_MESSAGE: {

    accent: "#2a6b5e",

    iconBg: "linear-gradient(135deg, rgba(74,144,128,0.18) 0%, rgba(42,107,94,0.12) 100%)",

    iconColor: "#2a6b5e",

  },

  SYSTEME: {

    accent: "#6b5c52",

    iconBg: "linear-gradient(135deg, rgba(107,92,82,0.12) 0%, rgba(40,20,16,0.06) 100%)",

    iconColor: "#6b5c52",

  },

};



const CLIENT_QUICK_LINKS = [

  { to: "/mon-compte/reservations", label: "Mes réservations" },

  { to: "/mon-compte/commandes", label: "Mes commandes" },

  { to: "/mon-compte/messages", label: "Contacter le restaurant" },

];



function formatWhen(iso) {

  if (!iso) return "—";

  return new Date(iso).toLocaleString("fr-BE", {

    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

  });

}



function formatRelative(iso) {

  if (!iso) return "";

  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);

  if (diffMin < 1) return "À l'instant";

  if (diffMin < 60) return `Il y a ${diffMin} min`;

  const hours = Math.floor(diffMin / 60);

  if (hours < 24) return `Il y a ${hours} h`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `Il y a ${days} j`;

  return "";

}



function cardBodyText(titre, message) {

  const body = (message || "").trim();

  if (!body) return "Aucun détail supplémentaire.";

  const title = (titre || "").trim();

  if (title && body.localeCompare(title, undefined, { sensitivity: "accent" }) === 0) {

    return "Aucun détail supplémentaire.";

  }

  return body;

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



function IconBellActive() {

  return (

    <svg viewBox="0 0 24 24" aria-hidden="true">

      <path

        fill="currentColor"

        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"

      />

    </svg>

  );

}



function IconInbox() {

  return (

    <svg viewBox="0 0 24 24" aria-hidden="true">

      <path

        fill="currentColor"

        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-3h3.56c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2H19v3zm0-5h-4.99c-.69 1.19-1.97 2-3.45 2s-2.76-.81-3.45-2H5V5h14v9z"

      />

    </svg>

  );

}



function IconEmpty() {

  return (

    <svg viewBox="0 0 24 24" aria-hidden="true">

      <path

        fill="currentColor"

        d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z"

      />

    </svg>

  );

}



function IconMarkRead() {

  return (

    <svg viewBox="0 0 24 24" aria-hidden="true">

      <path

        fill="currentColor"

        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"

      />

    </svg>

  );

}



function IconOpen() {

  return (

    <svg viewBox="0 0 24 24" aria-hidden="true">

      <path

        fill="currentColor"

        d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"

      />

    </svg>

  );

}



function TypeIcon({ type }) {

  const common = { viewBox: "0 0 24 24", "aria-hidden": true };

  const key = String(type || "").toUpperCase();



  if (key.startsWith("RESERVATION")) {

    return (

      <svg {...common}>

        <path

          fill="currentColor"

          d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"

        />

      </svg>

    );

  }



  if (key.startsWith("COMMANDE")) {

    return (

      <svg {...common}>

        <path

          fill="currentColor"

          d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"

        />

      </svg>

    );

  }



  if (key === "REPONSE_MESSAGE") {

    return (

      <svg {...common}>

        <path

          fill="currentColor"

          d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"

        />

      </svg>

    );

  }



  return (

    <svg {...common}>

      <path

        fill="currentColor"

        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"

      />

    </svg>

  );

}



export default function ClientNotificationsPage() {

  const { token } = useClientAuth();

  const { notifications, loading, refresh } = useClientPortal();

  const navigate = useNavigate();

  const [flash, setFlash] = useState(null);

  const [listFilter, setListFilter] = useState("all");

  const [busyId, setBusyId] = useState(null);

  const [markingAll, setMarkingAll] = useState(false);



  const rows = useMemo(() => (Array.isArray(notifications) ? notifications : []), [notifications]);



  const sorted = useMemo(

    () =>

      [...rows].sort(

        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()

      ),

    [rows]

  );



  const unreadCount = useMemo(() => rows.filter((n) => !n.lue).length, [rows]);

  const readCount = Math.max(0, rows.length - unreadCount);



  const recentStats = useMemo(() => {

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recent = rows.filter((n) => new Date(n.createdAt || 0).getTime() >= weekAgo);

    const recentUnread = recent.filter((n) => !n.lue).length;

    return { recent: recent.length, recentUnread };

  }, [rows]);



  const displayed = useMemo(() => {

    if (listFilter === "unread") return sorted.filter((n) => !n.lue);

    return sorted;

  }, [sorted, listFilter]);



  const handleRefresh = useCallback(async () => {

    await refresh?.();

  }, [refresh]);



  async function markRead(id) {

    if (!token) return;

    setBusyId(id);

    try {

      await markClientNotificationRead(token, id);

      await refresh?.();

      window.dispatchEvent(new Event("lmo-notifications-updated"));

    } catch {

      setFlash({ tone: "error", message: "Impossible de marquer la notification comme lue." });

    } finally {

      setBusyId(null);

    }

  }



  async function markAllRead() {

    if (!token || unreadCount === 0) return;

    setMarkingAll(true);

    try {

      await markAllClientNotificationsRead(token);

      await refresh?.();

      window.dispatchEvent(new Event("lmo-notifications-updated"));

    } catch {

      setFlash({ tone: "error", message: "Impossible de marquer les notifications comme lues." });

    } finally {

      setMarkingAll(false);

    }

  }



  async function openLinked(notification) {

    if (!notification.lue) {

      await markRead(notification.id);

    }

    navigate(resolveNotificationLink(notification));

  }



  return (

    <div className="client-page client-page--notifications client-page--notif-glop">

      <ClientFlashMessage tone={flash?.tone || "success"} onDismiss={() => setFlash(null)}>

        {flash?.message}

      </ClientFlashMessage>



      <main className="admin-notif-glop">

        <div className="admin-notif-glop__grid">

          <ClientPageHero
            icon={IconBellActive}
            title="Centre de notifications"
            lead="Confirmations et réponses du restaurant"
            statusChip={{
              icon: IconInbox,
              label:
                unreadCount > 0
                  ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                  : "À jour",
              tone: unreadCount > 0 ? "alert" : "ok",
            }}
          />



          <section className="admin-notif-glop__feed">

            <div className="admin-notif-glop__feed-toolbar">

              <h2>Fil des alertes</h2>

              <div className="admin-notif-glop__feed-actions">

                <div className="admin-notif-glop__toggle" role="group" aria-label="Filtrer">

                  <button

                    type="button"

                    className={listFilter === "all" ? "is-active" : ""}

                    onClick={() => setListFilter("all")}

                  >

                    Toutes

                  </button>

                  <button

                    type="button"

                    className={listFilter === "unread" ? "is-active" : ""}

                    onClick={() => setListFilter("unread")}

                  >

                    Non lues

                  </button>

                </div>

                <button

                  type="button"

                  className="admin-agents__ghost admin-notif-glop__refresh"

                  onClick={handleRefresh}

                  disabled={loading}

                >

                  Actualiser

                </button>

              </div>

            </div>



            {loading ? (

              <div className="admin-notif-glop__loading">

                <span className="admin-notif-glop__spinner" aria-hidden="true" />

                <p>Chargement des notifications…</p>

              </div>

            ) : displayed.length === 0 ? (

              <div className="admin-notif-glop__empty">

                <span className="admin-notif-glop__empty-icon" aria-hidden="true">

                  <IconEmpty />

                </span>

                <h3>

                  {listFilter === "unread" && sorted.length > 0

                    ? "Aucune alerte non lue"

                    : "Aucune notification"}

                </h3>

                <p>

                  {listFilter === "unread" && sorted.length > 0

                    ? "Toutes vos alertes ont été lues. Consultez l'onglet « Toutes »."

                    : "Les confirmations et réponses du restaurant apparaîtront ici."}

                </p>

              </div>

            ) : (

              <ul className="admin-notif-glop__cards">

                {displayed.map((n) => {

                  const style = TYPE_STYLE[n.type] || TYPE_STYLE.SYSTEME;

                  const rel = formatRelative(n.createdAt);

                  const label = TYPE_LABEL[n.type] || "Alerte";

                  return (

                    <li key={n.id}>

                      <article

                        className={`admin-notif-glop__card${!n.lue ? " is-unread" : ""}`}

                        style={{ "--notif-accent": style.accent }}

                      >

                        <span

                          className="admin-notif-glop__card-icon"

                          style={{ background: style.iconBg, color: style.iconColor }}

                          aria-hidden="true"

                        >

                          <TypeIcon type={n.type} />

                        </span>

                        <div className="admin-notif-glop__card-body">

                          <header className="admin-notif-glop__card-head">

                            <div className="admin-notif-glop__card-title-row">

                              <h3>{n.titre || "Notification"}</h3>

                              {!n.lue ? (

                                <span className="admin-notif-glop__new-chip">Nouveau</span>

                              ) : null}

                            </div>

                            <div className="admin-notif-glop__card-time">

                              <time dateTime={n.createdAt}>{formatWhen(n.createdAt)}</time>

                              {rel ? <small>{rel}</small> : null}

                            </div>

                          </header>

                          <p className="admin-notif-glop__card-message">

                            {cardBodyText(n.titre, n.message)}

                          </p>

                          <footer className="admin-notif-glop__card-foot">

                            <span className="admin-notif-glop__type-chip">{label}</span>

                            <div className="admin-notif-glop__card-actions">

                              <button

                                type="button"

                                className="admin-notif-glop__link-btn"

                                onClick={() => openLinked(n)}

                              >

                                <IconOpen />

                                Ouvrir

                              </button>

                              {!n.lue ? (

                                <button

                                  type="button"

                                  className="admin-notif-glop__read-btn"

                                  disabled={busyId === n.id}

                                  onClick={() => markRead(n.id)}

                                >

                                  <IconMarkRead />

                                  {busyId === n.id ? "…" : "Marquer comme lu"}

                                </button>

                              ) : null}

                            </div>

                          </footer>

                        </div>

                      </article>

                    </li>

                  );

                })}

              </ul>

            )}

          </section>



          <aside className="admin-notif-glop__sidebar">

            <article className="admin-notif-glop__synth">

              <p className="admin-notif-glop__synth-label">Synthèse</p>

              <div className="admin-notif-glop__synth-count">

                <strong>{unreadCount}</strong>

                <span>non lue{unreadCount > 1 ? "s" : ""}</span>

              </div>

              <p className="admin-notif-glop__synth-meta">

                <strong>{readCount}</strong> lue{readCount > 1 ? "s" : ""} sur{" "}

                <strong>{rows.length}</strong>

              </p>

              {unreadCount > 0 ? (

                <button

                  type="button"

                  className="admin-ops__btn admin-notif-glop__mark-all"

                  onClick={markAllRead}

                  disabled={markingAll}

                >

                  {markingAll ? "…" : "Tout marquer lu"}

                </button>

              ) : null}

            </article>



            <article className="admin-notif-glop__tip admin-notif-glop__tip--green">

              <h3>Cette semaine</h3>

              {rows.length === 0 ? (

                <p>Votre centre est vide pour l&apos;instant.</p>

              ) : (

                <>

                  <p className="admin-notif-glop__week-stat">

                    <strong>{recentStats.recent}</strong>{" "}

                    {recentStats.recent > 1 ? "alertes" : "alerte"} sur les 7 derniers jours

                  </p>

                  {recentStats.recentUnread > 0 ? (

                    <p className="admin-notif-glop__tip-note">

                      Dont <strong>{recentStats.recentUnread}</strong> encore à consulter.

                    </p>

                  ) : (

                    <p className="admin-notif-glop__tip-note">Tout est à jour cette semaine.</p>

                  )}

                </>

              )}

            </article>



            <article className="admin-notif-glop__tip admin-notif-glop__tip--teal">

              <h3>Aller plus loin</h3>

              <p>Consultez vos réservations, commandes ou vos demandes au restaurant :</p>

              <nav className="admin-notif-glop__quick-links" aria-label="Raccourcis">

                {CLIENT_QUICK_LINKS.map((link) => (

                  <Link key={link.to} to={link.to} className="admin-notif-glop__quick-link">

                    {link.label}

                  </Link>

                ))}

              </nav>

            </article>

          </aside>

        </div>

      </main>

    </div>

  );

}


