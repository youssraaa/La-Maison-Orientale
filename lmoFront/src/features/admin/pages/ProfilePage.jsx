import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../common/auth/AuthContext";
import profileApi from "../api/profileApi";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function ProfileRow({ label, children }) {
  return (
    <div className="admin-profile__row">
      <span className="admin-profile__label">{label}</span>
      <span className="admin-profile__sep" aria-hidden="true">:</span>
      <span className="admin-profile__value">{children}</span>
    </div>
  );
}

function ProfilePage() {
  const { token, user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await profileApi.get(token);
      setProfile(data);
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logout(); return; }
      setError(err.message || "Impossible de charger le profil.");
      setProfile({ nom: user?.nom, email: user?.email, role: user?.role, actif: true });
    } finally { setLoading(false); }
  }, [token, logout, user]);

  useEffect(() => { load(); }, [load]);

  const displayName = profile?.nom?.trim() || user?.nom || "—";
  const email = profile?.email || user?.email || "—";
  const roleLabel = profile?.role === "AGENT" || user?.role === "AGENT" ? "Agent" : "Administrateur";
  const login = email !== "—" ? email.split("@")[0] : "—";

  return (
    <AdminShell active="profil" title="Mon profil">
      <AdminPageShell
        pageClass="admin-ops-shell"
        title="Mon profil"
        lead={`${roleLabel} · ${email}`}
        icon={ProfileIcon}
      >
        {error ? <div className="ops-error" role="alert">{error}</div> : null}

        {loading ? (
          <div className="ops-loading"><span className="ops-loading__spinner" /> Chargement…</div>
        ) : (
          <div className="ops-table-card" style={{ maxWidth: 560 }}>
            <div className="admin-profile__list">
              <ProfileRow label="Nom">{displayName}</ProfileRow>
              <ProfileRow label="Adresse e-mail">{email}</ProfileRow>
              <ProfileRow label="Login">{login}</ProfileRow>
              <ProfileRow label="Rôle">{roleLabel}</ProfileRow>
              <ProfileRow label="Statut">{profile?.actif === false ? "Inactif" : "Actif"}</ProfileRow>
              <ProfileRow label="Date de création">{formatDate(profile?.createdAt)}</ProfileRow>
            </div>
            <div className="ops-settings-submit">
              <Link to="/admin/parametres" className="ops-btn ops-btn--primary">Modifier le profil</Link>
            </div>
          </div>
        )}
      </AdminPageShell>
    </AdminShell>
  );
}

export default ProfilePage;
