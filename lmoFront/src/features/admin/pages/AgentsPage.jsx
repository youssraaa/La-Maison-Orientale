import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import agentsApi from "../api/agentsApi";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AgentFormDialog from "../components/AgentFormDialog";
import AdminPageShell from "../components/AdminPageShell";
import AdminShell from "../components/AdminShell";
import ClientFlashMessage from "../../client/components/ClientFlashMessage";
import ClientListPagination from "../../client/components/ClientListPagination";
import ClientListToolbar from "../../client/components/ClientListToolbar";
import { IconEdit, IconTrash, IconUsers } from "../../client/components/ClientPortalIcons";
import { useClientListControls } from "../../client/hooks/useClientListControls";
import { getFormBannerMessage, mergeApiError } from "../../../common/utils/formErrors";

const STATUS_FILTERS = [
  { id: "ALL", label: "Tous" },
  { id: "ACTIVE", label: "Actifs" },
  { id: "INVITE", label: "Invitations" },
  { id: "INACTIVE", label: "Inactifs" },
];

function formatAgentName(agent) {
  const parts = [agent?.prenom, agent?.nom].filter(Boolean);
  return parts.join(" ") || "—";
}

function agentInitials(agent) {
  const prenom = (agent?.prenom || "").trim();
  const nom = (agent?.nom || "").trim();
  if (prenom && nom) return `${prenom[0]}${nom[0]}`.toUpperCase();
  const full = formatAgentName(agent);
  if (!full || full === "—") return "?";
  const parts = full.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return full.slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function filterAgent(agent, query) {
  const haystack = [
    agent.prenom,
    agent.nom,
    agent.email,
    formatAgentName(agent),
    formatDate(agent.createdAt),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function AgentStatusBadge({ agent }) {
  if (agent.actif) {
    return <span className="client-badge client-badge--success">Actif</span>;
  }
  if (agent.invitationEnAttente) {
    return <span className="client-badge client-badge--pending">Invitation envoyée</span>;
  }
  return <span className="client-badge client-badge--neutral">Inactif</span>;
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function IconResend() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.9 5.9 0 0 1 6 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2A5.9 5.9 0 0 1 18 12c0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"
      />
    </svg>
  );
}

function IconKey() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm12.71 4.29-2.34-2.34a6.96 6.96 0 0 0 1.17-3.87 7 7 0 1 0-7 7c1.42 0 2.74-.42 3.87-1.17l2.34 2.34a1 1 0 0 0 1.41-1.41zM7 18a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
      />
    </svg>
  );
}

function AgentsPage() {
  const { token, logout } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [flash, setFlash] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await agentsApi.list(token);
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      setListError(err.message || "Impossible de charger les agents.");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const active = agents.filter((a) => a.actif).length;
    const invites = agents.filter((a) => a.invitationEnAttente && !a.actif).length;
    const inactive = agents.filter((a) => !a.actif && !a.invitationEnAttente).length;
    return { total: agents.length, active, invites, inactive };
  }, [agents]);

  const statusFiltered = useMemo(() => {
    if (statusFilter === "ACTIVE") return agents.filter((a) => a.actif);
    if (statusFilter === "INVITE") return agents.filter((a) => a.invitationEnAttente && !a.actif);
    if (statusFilter === "INACTIVE") return agents.filter((a) => !a.actif && !a.invitationEnAttente);
    return agents;
  }, [agents, statusFilter]);

  const list = useClientListControls(statusFiltered, {
    filterFn: filterAgent,
    defaultPageSize: 10,
  });

  useEffect(() => {
    list.setPage(1);
  }, [statusFilter]);

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setFieldErrors({});
    setFormError("");
  }

  function openCreate() {
    setEditingId(null);
    setFieldErrors({});
    setFormError("");
    setFlash(null);
    setModalOpen(true);
  }

  function openEdit(agent) {
    setEditingId(agent.id);
    setFieldErrors({});
    setFormError("");
    setFlash(null);
    setModalOpen(true);
  }

  async function onSubmit(data) {
    setSaving(true);
    setFormError("");
    setFlash(null);
    setFieldErrors({});

    try {
      if (editingId) {
        await agentsApi.update(token, editingId, {
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
        });
        setFlash({ tone: "success", message: "Agent mis à jour." });
      } else {
        await agentsApi.create(token, {
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
        });
        setFlash({ tone: "success", message: "Invitation envoyée par e-mail à l'agent." });
      }
      closeModal();
      await load();
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      const mapped = mergeApiError(err);
      setFieldErrors(mapped);
      setFormError(getFormBannerMessage(mapped, err.message || "Enregistrement impossible."));
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(agent) {
    setDeleteTarget(agent);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setListError("");
    setFlash(null);
    try {
      await agentsApi.remove(token, deleteTarget.id);
      if (editingId === deleteTarget.id) closeModal();
      setFlash({ tone: "success", message: "Agent supprimé." });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      setListError(err.message || "Suppression impossible.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function requestReset(agent) {
    setResetTarget(agent);
    setListError("");
  }

  async function confirmReset() {
    if (!resetTarget) return;
    setResetting(true);
    setListError("");
    try {
      await agentsApi.resetPassword(token, resetTarget.id);
      setFlash({
        tone: "success",
        message: `Un e-mail de réinitialisation a été envoyé à ${resetTarget.email}. L'agent choisira son nouveau mot de passe via le lien (valide 24 h).`,
      });
      setResetTarget(null);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      setListError(err.message || "Envoi impossible.");
    } finally {
      setResetting(false);
    }
  }

  async function resendInvite(agent) {
    setListError("");
    try {
      await agentsApi.resendInvite(token, agent.id);
      setFlash({ tone: "success", message: `Invitation renvoyée à ${agent.email}.` });
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      setListError(err.message || "Renvoi impossible.");
    }
  }

  const editingAgent = editingId
    ? agents.find((agent) => agent.id === editingId) || null
    : null;

  const agentHeroStats = (
    <div className="client-contact-stats client-page-hero__stats" aria-label="Synthèse agents">
      <div className="client-contact-stat">
        <strong>{stats.total}</strong>
        <span>Total</span>
      </div>
      <div className="client-contact-stat client-contact-stat--done">
        <strong>{stats.active}</strong>
        <span>Actifs</span>
      </div>
      <div className="client-contact-stat client-contact-stat--pending">
        <strong>{stats.invites}</strong>
        <span>Invitations</span>
      </div>
      <div className="client-contact-stat">
        <strong>{stats.inactive}</strong>
        <span>Inactifs</span>
      </div>
    </div>
  );

  return (
    <AdminShell active="agents" title="Gestion des agents" hideTopTitle>
      <AdminPageShell
        pageClass="admin-page--agents"
        title="Gestion des agents"
        lead="Créez, invitez et gérez les comptes de votre équipe opérationnelle."
        icon={IconUsers}
        heroStats={agentHeroStats}
      >
        <ClientFlashMessage tone={flash?.tone || "success"} onDismiss={() => setFlash(null)}>
          {flash?.message}
        </ClientFlashMessage>

        {listError ? (
          <p className="admin-dash__status admin-dash__status--error" role="alert">
            {listError}
          </p>
        ) : null}

        <section className="client-portal-block">
          <div className="client-portal-block__head">
            <h3>Liste des agents</h3>
            <div className="admin-agents-toolbar-actions">
              <button
                type="button"
                className="client-home__action client-home__action--ghost"
                onClick={load}
                disabled={loading}
              >
                Actualiser
              </button>
              <button
                type="button"
                className="client-home__action client-home__action--primary client-reservations__new-btn"
                onClick={openCreate}
              >
                <span className="client-reservations__new-icon" aria-hidden="true">
                  +
                </span>
                Ajouter un agent
              </button>
            </div>
          </div>

          <div className="client-agents-filters" role="group" aria-label="Filtrer par statut">
            {STATUS_FILTERS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={statusFilter === chip.id ? "is-active" : ""}
                onClick={() => setStatusFilter(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <ClientListToolbar
            query={list.query}
            onQueryChange={list.setQuery}
            placeholder="Rechercher par nom ou e-mail…"
            pageSize={list.pageSize}
            onPageSizeChange={list.setPageSize}
            totalCount={list.totalCount}
          />

          {loading ? (
            <div className="client-portal-empty">
              <p>Chargement des agents…</p>
            </div>
          ) : list.paginated.length === 0 ? (
            <div className="client-portal-empty client-portal-empty--action">
              <p>
                {agents.length === 0
                  ? "Aucun agent pour le moment. Créez un compte pour déléguer la gestion du restaurant."
                  : "Aucun résultat pour cette recherche ou ce filtre."}
              </p>
              {agents.length === 0 ? (
                <button
                  type="button"
                  className="client-home__action client-home__action--primary"
                  onClick={openCreate}
                >
                  Créer le premier agent
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="client-table-wrap">
                <table className="client-table client-table--listing">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Nom</th>
                      <th>E-mail</th>
                      <th>Statut</th>
                      <th>Créé le</th>
                      <th className="client-table__actions-head">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.paginated.map((agent, index) => (
                      <tr key={agent.id}>
                        <td data-label="N°">{(list.page - 1) * list.pageSize + index + 1}</td>
                        <td data-label="Nom">
                          <span className="client-table__name-cell">
                            <span
                              className={`client-table__avatar${agent.actif ? " is-active" : ""}`}
                              aria-hidden="true"
                            >
                              {agentInitials(agent)}
                            </span>
                            {formatAgentName(agent)}
                          </span>
                        </td>
                        <td data-label="E-mail">{agent.email}</td>
                        <td data-label="Statut">
                          <AgentStatusBadge agent={agent} />
                        </td>
                        <td data-label="Créé le">{formatDate(agent.createdAt)}</td>
                        <td data-label="Actions" className="client-table__actions">
                          <div
                            className="client-table__action-group client-table__action-group--labeled"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {agent.invitationEnAttente ? (
                              <button
                                type="button"
                                className="client-table__icon-btn client-table__icon-btn--resend client-table__icon-btn--labeled"
                                onClick={() => resendInvite(agent)}
                                title="Renvoyer l'invitation"
                                aria-label={`Renvoyer l'invitation à ${formatAgentName(agent)}`}
                              >
                                <IconResend />
                                <span>Renvoyer</span>
                              </button>
                            ) : null}
                            {agent.actif ? (
                              <button
                                type="button"
                                className="client-table__icon-btn client-table__icon-btn--password client-table__icon-btn--labeled"
                                onClick={() => requestReset(agent)}
                                title="Envoyer un lien de réinitialisation"
                                aria-label={`Réinitialiser le mot de passe de ${formatAgentName(agent)}`}
                              >
                                <IconKey />
                                <span>Mot de passe</span>
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="client-table__icon-btn client-table__icon-btn--edit client-table__icon-btn--labeled"
                              onClick={() => openEdit(agent)}
                              aria-label={`Modifier ${formatAgentName(agent)}`}
                              title="Modifier"
                            >
                              <IconEdit />
                              <span>Modifier</span>
                            </button>
                            <button
                              type="button"
                              className="client-table__icon-btn client-table__icon-btn--danger client-table__icon-btn--labeled"
                              onClick={() => requestDelete(agent)}
                              aria-label={`Supprimer ${formatAgentName(agent)}`}
                              title="Supprimer"
                            >
                              <IconTrash />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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

        <AgentFormDialog
          open={modalOpen}
          mode={editingId ? "edit" : "create"}
          initialValues={
            editingAgent
              ? {
                  prenom: editingAgent.prenom || "",
                  nom: editingAgent.nom || "",
                  email: editingAgent.email || "",
                }
              : undefined
          }
          pendingInvite={Boolean(editingAgent && !editingAgent.actif)}
          saving={saving}
          serverError={formError}
          serverFieldErrors={fieldErrors}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      </AdminPageShell>

      <AdminConfirmModal
        open={Boolean(resetTarget)}
        title="Réinitialiser le mot de passe"
        message={
          resetTarget
            ? `Un e-mail sera envoyé à « ${resetTarget.email} » avec un lien sécurisé (24 h). L'agent choisira lui-même son nouveau mot de passe.`
            : ""
        }
        confirmLabel="Envoyer le lien"
        cancelLabel="Annuler"
        busy={resetting}
        onConfirm={confirmReset}
        onCancel={() => {
          if (!resetting) setResetTarget(null);
        }}
      />

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Supprimer l’agent"
        message={
          deleteTarget
            ? `Le compte « ${formatAgentName(deleteTarget) || deleteTarget.email} » sera définitivement supprimé. Cette action est irréversible.`
            : ""
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </AdminShell>
  );
}

export default AgentsPage;
