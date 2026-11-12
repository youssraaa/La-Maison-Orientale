import { useMemo, useState } from "react";

import { restaurantInfo } from "../../../common/data/restaurantInfo";

import ClientContactForm from "../components/ClientContactForm";
import ClientFlashMessage from "../components/ClientFlashMessage";
import ClientListPagination from "../components/ClientListPagination";
import ClientListToolbar from "../components/ClientListToolbar";
import ClientMessageExchangeModal from "../components/ClientMessageExchangeModal";
import ClientPageShell from "../components/ClientPageShell";
import ClientStatusBadge from "../components/ClientStatusBadge";
import { IconEye, IconMail } from "../components/ClientPortalIcons";
import { useClientPortal } from "../components/ClientPortalLayout";
import { useClientListControls } from "../hooks/useClientListControls";
import { formatDateTime } from "../hooks/useClientAccountData";

function truncate(text, max = 72) {
  const value = String(text || "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function filterMessage(message, query) {
  const haystack = [message.sujet, message.message, message.statut, formatDateTime(message.createdAt)]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function ClientMessagesPage() {
  const { profile, messages, refresh } = useClientPortal();
  const [flash, setFlash] = useState(null);
  const [exchangeTarget, setExchangeTarget] = useState(null);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [messages]
  );

  const list = useClientListControls(sorted, {
    filterFn: filterMessage,
    defaultPageSize: 8,
  });

  const pendingCount = useMemo(
    () => messages.filter((m) => String(m.statut || "").toUpperCase() === "NOUVELLE").length,
    [messages]
  );

  const answeredCount = useMemo(
    () =>
      messages.filter(
        (m) => m.reponse || m.reponseAt || String(m.statut || "").toUpperCase() === "TRAITEE"
      ).length,
    [messages]
  );

  function handleSendSuccess(message) {
    setFlash({ tone: "success", message });
    refresh?.();
  }

  return (
    <ClientPageShell
      pageClass="client-page--contact"
      title="Contacter le restaurant"
      lead="Écrivez au restaurant et suivez vos messages."
      icon={IconMail}
      statusChip={
        pendingCount > 0
          ? {
              label: `${pendingCount} en attente${pendingCount > 1 ? "s" : ""}`,
              tone: "alert",
              icon: IconMail,
            }
          : { label: "À jour", tone: "ok", icon: IconMail }
      }
    >
      <ClientFlashMessage tone={flash?.tone || "success"} onDismiss={() => setFlash(null)}>
        {flash?.message}
      </ClientFlashMessage>

      <div className="client-contact-grid">
        <div className="client-contact-compose-panel">
          <section className="client-contact-compose client-contact-card">
            <header className="client-contact-card__banner">
              <p className="client-contact-card__kicker">Nouvelle demande</p>
              <h3>
                <IconMail aria-hidden="true" />
                Écrire au restaurant
              </h3>
            </header>
            <div className="client-contact-card__body">
              <ClientContactForm profile={profile} onSuccess={handleSendSuccess} />
            </div>
          </section>

          <aside className="client-contact-tips client-contact-card client-contact-card--tips">
            <div className="client-contact-card__body">
              <h4>Besoin d&apos;une réponse rapide ?</h4>
              <p>Pour une modification urgente de réservation ou de commande, appelez-nous directement.</p>
              <a href={restaurantInfo.phone.href} className="client-contact-tips__phone">
                {restaurantInfo.phone.display}
              </a>
              <ul className="client-contact-tips__list">
                <li>Question sur une réservation ou une commande</li>
                <li>Demande liée à la carte ou aux allergènes</li>
                <li>Information pratique (horaires, accès…)</li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="client-contact-history client-contact-card">
          <header className="client-contact-card__banner client-contact-card__banner--history">
            <div className="client-contact-card__banner-main">
              <p className="client-contact-card__kicker">Vos échanges</p>
              <h3>Historique de vos messages</h3>
            </div>

            <div className="client-contact-stats" aria-label="Statistiques de contact">
              <div className="client-contact-stat">
                <strong>{messages.length}</strong>
                <span>Envoyées</span>
              </div>
              <div className="client-contact-stat client-contact-stat--pending">
                <strong>{pendingCount}</strong>
                <span>En attente</span>
              </div>
              <div className="client-contact-stat client-contact-stat--done">
                <strong>{answeredCount}</strong>
                <span>Répondues</span>
              </div>
            </div>
          </header>

          <div className="client-contact-card__body">
            <ClientListToolbar
              query={list.query}
              onQueryChange={list.setQuery}
              placeholder="Rechercher par sujet, contenu…"
              pageSize={list.pageSize}
              onPageSizeChange={list.setPageSize}
              totalCount={list.totalCount}
            />

            {list.paginated.length === 0 ? (
              <div className="client-portal-empty client-portal-empty--contact">
                <IconMail aria-hidden="true" />
                <p>
                  {messages.length === 0
                    ? "Vous n'avez pas encore envoyé de demande depuis ce compte."
                    : "Aucun résultat pour cette recherche."}
                </p>
              </div>
            ) : (
              <>
                <ul className="client-contact-thread">
                  {list.paginated.map((m) => (
                    <li key={m.id}>
                      <article className="client-contact-thread__item">
                        <div className="client-contact-thread__top">
                          <time dateTime={m.createdAt}>{formatDateTime(m.createdAt)}</time>
                          <ClientStatusBadge statut={m.statut} />
                        </div>

                        <h4>{m.sujet || "Sans sujet"}</h4>

                        <div className="client-contact-thread__excerpt">
                          <p className="client-contact-thread__excerpt-label">Votre demande</p>
                          <p>{truncate(m.message, 110)}</p>
                        </div>

                        {m.reponse ? (
                          <div className="client-contact-thread__reply-preview">
                            <p className="client-contact-thread__excerpt-label">Réponse du restaurant</p>
                            <p>{truncate(m.reponse, 110)}</p>
                          </div>
                        ) : null}

                        <div className="client-contact-thread__actions">
                          <button
                            type="button"
                            className="client-contact-thread__read"
                            onClick={() => setExchangeTarget(m)}
                          >
                            <IconEye />
                            <span>Voir l&apos;échange</span>
                          </button>
                          {m.reponse ? (
                            <time className="client-contact-thread__reply-time" dateTime={m.reponseAt}>
                              Répondu {m.reponseAt ? formatDateTime(m.reponseAt) : ""}
                            </time>
                          ) : null}
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>

                <ClientListPagination
                  page={list.page}
                  totalPages={list.totalPages}
                  rangeStart={list.rangeStart}
                  rangeEnd={list.rangeEnd}
                  totalCount={list.totalCount}
                  onPageChange={list.setPage}
                />
              </>
            )}
          </div>
        </section>
      </div>

      <ClientMessageExchangeModal
        open={Boolean(exchangeTarget)}
        message={exchangeTarget}
        onClose={() => setExchangeTarget(null)}
      />
    </ClientPageShell>
  );
}
