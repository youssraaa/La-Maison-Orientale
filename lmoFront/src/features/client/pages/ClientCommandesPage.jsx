import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useClientPortal } from "../components/ClientPortalLayout";
import ClientCommandeDetailModal from "../components/ClientCommandeDetailModal";
import ClientListPagination from "../components/ClientListPagination";
import ClientListToolbar from "../components/ClientListToolbar";
import ClientPageShell from "../components/ClientPageShell";
import ClientStatusBadge from "../components/ClientStatusBadge";
import { IconBag, IconEye, IconReceipt } from "../components/ClientPortalIcons";
import { getPaymentMethodLabel } from "../../order/utils/paymentMethods";
import { openOrderReceiptPreview } from "../../order/utils/printOrderReceipt";
import { useClientListControls } from "../hooks/useClientListControls";
import { formatMode } from "../hooks/useClientAccountData";

function formatEuro(amount) {
  return `${Number(amount || 0).toFixed(2).replace(".", ",")} €`;
}

function formatOrderDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatOrderTime(iso) {
  if (!iso) return "—";
  return new Date(iso)
    .toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })
    .replace(":", "h");
}

function filterCommande(commande, query) {
  const haystack = [
    commande.reference,
    String(commande.id),
    commande.statut,
    commande.mode,
    commande.modePaiement,
    formatMode(commande.mode),
    getPaymentMethodLabel(commande.modePaiement),
    formatOrderDate(commande.createdAt),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function CommandeRowActions({ commande, onDetail }) {
  const hasDetail = Boolean(commande.gestionToken || commande.id);
  const hasReceipt = Array.isArray(commande.lignes) && commande.lignes.length > 0;

  return (
    <div className="client-table__action-group client-table__action-group--labeled">
      {hasDetail ? (
        <button
          type="button"
          className="client-table__icon-btn client-table__icon-btn--view client-table__icon-btn--labeled"
          title="Voir les détails"
          aria-label="Voir les détails de la commande"
          onClick={() => onDetail(commande)}
        >
          <IconEye />
          <span>Détails</span>
        </button>
      ) : null}
      {hasReceipt ? (
        <button
          type="button"
          className="client-table__icon-btn client-table__icon-btn--receipt client-table__icon-btn--labeled"
          title="Consulter la facture"
          aria-label="Consulter la facture"
          onClick={() => openOrderReceiptPreview(commande)}
        >
          <IconReceipt />
          <span>Facture</span>
        </button>
      ) : null}
      {!hasDetail && !hasReceipt ? <span className="client-table__muted">—</span> : null}
    </div>
  );
}

export default function ClientCommandesPage() {
  const { commandes } = useClientPortal();
  const [detailTarget, setDetailTarget] = useState(null);

  const sorted = useMemo(
    () =>
      [...commandes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [commandes]
  );

  const list = useClientListControls(sorted, {
    filterFn: filterCommande,
    defaultPageSize: 10,
  });

  const newCommandeLink = (
    <Link
      to="/commander"
      className="client-home__action client-home__action--primary client-commandes__new-btn"
    >
      <span className="client-commandes__new-icon" aria-hidden="true">
        +
      </span>
      Nouvelle commande
    </Link>
  );

  return (
    <ClientPageShell
      pageClass="client-page--commandes"
      title="Mes commandes"
      lead="Consultez vos commandes et vos factures."
      icon={IconBag}
    >
      <section className="client-portal-block client-portal-block--flush">
        <div className="client-portal-block__head">
          <h3>Liste des commandes</h3>
          {newCommandeLink}
        </div>

        <ClientListToolbar
          query={list.query}
          onQueryChange={list.setQuery}
          placeholder="Rechercher par réf., mode, statut…"
          pageSize={list.pageSize}
          onPageSizeChange={list.setPageSize}
          totalCount={list.totalCount}
        />

        {list.paginated.length === 0 ? (
          <div className="client-portal-empty client-portal-empty--action">
            <p>
              {commandes.length === 0
                ? "Aucune commande enregistrée."
                : "Aucun résultat pour cette recherche."}
            </p>
            <Link to="/commander" className="client-home__action client-home__action--primary">
              Parcourir la carte
            </Link>
          </div>
        ) : (
          <>
            <div className="client-table-wrap client-table-wrap--commandes">
              <table className="client-table client-table--listing">
                <thead>
                  <tr>
                    <th>Réf.</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Mode</th>
                    <th>Paiement</th>
                    <th>Total</th>
                    <th>Statut</th>
                    <th className="client-table__actions-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.paginated.map((c) => (
                    <tr key={c.id}>
                      <td data-label="Réf.">
                        {c.gestionToken || c.id ? (
                          <button
                            type="button"
                            className="client-table__ref-btn"
                            onClick={() => setDetailTarget(c)}
                          >
                            {c.reference}
                          </button>
                        ) : (
                          <strong>{c.reference}</strong>
                        )}
                      </td>
                      <td data-label="Date">{formatOrderDate(c.createdAt)}</td>
                      <td data-label="Heure">{formatOrderTime(c.createdAt)}</td>
                      <td data-label="Mode">{formatMode(c.mode)}</td>
                      <td data-label="Paiement">{getPaymentMethodLabel(c.modePaiement)}</td>
                      <td data-label="Total" className="client-table__total">
                        {formatEuro(c.total)}
                      </td>
                      <td data-label="Statut">
                        <ClientStatusBadge statut={c.statut} />
                      </td>
                      <td data-label="Actions" className="client-table__actions">
                        <CommandeRowActions
                          commande={c}
                          onDetail={setDetailTarget}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="client-mobile-cards client-mobile-cards--commandes">
              {list.paginated.map((c) => (
                <li key={c.id}>
                  <article className="client-mobile-card client-mobile-card--commande">
                    <div className="client-mobile-card__head">
                      <div>
                        <span className="client-mobile-card__ref">{c.reference}</span>
                        <strong>
                          {formatOrderDate(c.createdAt)} · {formatOrderTime(c.createdAt)}
                        </strong>
                      </div>
                      <ClientStatusBadge statut={c.statut} />
                    </div>
                    <p>
                      {formatMode(c.mode)} · {formatEuro(c.total)}
                    </p>
                    <p className="client-mobile-card__sub">
                      Paiement : {getPaymentMethodLabel(c.modePaiement)}
                    </p>
                    <CommandeRowActions
                      commande={c}
                      onDetail={setDetailTarget}
                    />
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
      </section>

      <ClientCommandeDetailModal
        open={Boolean(detailTarget)}
        commande={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </ClientPageShell>
  );
}
