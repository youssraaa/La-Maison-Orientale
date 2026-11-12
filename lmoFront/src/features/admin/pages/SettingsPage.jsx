import { useEffect, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import profileApi from "../api/profileApi";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";
import { IconLock, IconMail, IconUser } from "../../client/components/ClientPortalIcons";
import ClientFlashMessage from "../../client/components/ClientFlashMessage";
import {
  EMAIL_FORMAT_EXAMPLE,
  validateEmail,
} from "../../../common/utils/contactFieldValidation";
import {
  getFormBannerMessage,
  mergeApiError,
} from "../../../common/utils/formErrors";
import {
  validateFullName,
  validatePasswordChangeForm,
} from "../../../common/utils/formValidation";
import {
  COMPACT_NAV_KEY,
  DASH_DAYS_KEY,
  NOTIF_MESSAGES_KEY,
  NOTIF_RESERVATIONS_KEY,
  getBoolPref,
  setBoolPref,
} from "../adminPrefs";

function SettingsPage() {
  const { token, user, role, login, updateUser, logout } = useAuth();
  const [profileForm, setProfileForm] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [dashDays, setDashDays] = useState(() =>
    localStorage.getItem(DASH_DAYS_KEY) === "30" ? "30" : "7"
  );
  const [notifReservations, setNotifReservations] = useState(() =>
    getBoolPref(NOTIF_RESERVATIONS_KEY, true)
  );
  const [notifMessages, setNotifMessages] = useState(() =>
    getBoolPref(NOTIF_MESSAGES_KEY, true)
  );
  const [compactNav, setCompactNav] = useState(() =>
    getBoolPref(COMPACT_NAV_KEY, false)
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [prefsMsg, setPrefsMsg] = useState({ type: "", text: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});

  const roleLabel = role === "AGENT" ? "Agent" : "Administrateur";
  const loginLabel = (profileForm.email || "").split("@")[0] || "—";
  const displayInitial = (profileForm.nom || loginLabel || "A").trim().charAt(0).toUpperCase();
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await profileApi.get(token);
        if (cancelled) return;
        setProfileForm({
          nom: data.nom || "",
          email: data.email || "",
        });
      } catch (err) {
        if (err.status === 401 || err.status === 403) logout();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  function onProfileChange(event) {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function onPasswordChange(event) {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordFieldErrors[name]) {
      setPasswordFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function onSaveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });
    setFieldErrors({});

    const errors = {};
    const nomError = validateFullName(profileForm.nom, { required: true });
    if (nomError) errors.nom = nomError;
    const emailError = validateEmail(profileForm.email, { required: true });
    if (emailError) errors.email = emailError;
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setProfileMsg({ type: "error", text: getFormBannerMessage(errors) });
      setSavingProfile(false);
      return;
    }

    try {
      const data = await profileApi.update(token, {
        nom: profileForm.nom.trim(),
        email: profileForm.email.trim(),
      });
      const nextUser = {
        id: data.userId,
        nom: data.nom,
        email: data.email,
        role: data.role,
      };
      if (data.token) {
        login({ token: data.token, user: nextUser });
      } else {
        updateUser(nextUser);
      }
      setProfileMsg({ type: "ok", text: "Modifications enregistrées." });
      setFlash({ tone: "success", message: "Modifications enregistrées." });
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      const mapped = mergeApiError(err);
      setFieldErrors(mapped);
      setProfileMsg({
        type: "error",
        text: getFormBannerMessage(mapped, err.message || "Mise à jour impossible."),
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSavePassword(event) {
    event.preventDefault();
    setPasswordMsg({ type: "", text: "" });
    setPasswordFieldErrors({});

    const clientErrors = validatePasswordChangeForm(passwordForm);
    if (Object.keys(clientErrors).length > 0) {
      setPasswordFieldErrors(clientErrors);
      setPasswordMsg({ type: "error", text: getFormBannerMessage(clientErrors) });
      return;
    }

    setSavingPassword(true);
    try {
      await profileApi.changePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMsg({ type: "ok", text: "Mot de passe modifié." });
      setFlash({ tone: "success", message: "Mot de passe modifié." });
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout();
        return;
      }
      const mapped = mergeApiError(err);
      setPasswordFieldErrors(mapped);
      setPasswordMsg({
        type: "error",
        text: getFormBannerMessage(mapped, err.message || "Changement de mot de passe impossible."),
      });
    } finally {
      setSavingPassword(false);
    }
  }

  function onSavePrefs(event) {
    event.preventDefault();
    localStorage.setItem(DASH_DAYS_KEY, dashDays);
    setBoolPref(NOTIF_RESERVATIONS_KEY, notifReservations);
    setBoolPref(NOTIF_MESSAGES_KEY, notifMessages);
    setBoolPref(COMPACT_NAV_KEY, compactNav);
    document.documentElement.classList.toggle("admin-compact-nav", compactNav);
    setPrefsMsg({
      type: "ok",
      text: "Préférences enregistrées.",
    });
    setFlash({ tone: "success", message: "Préférences enregistrées." });
  }

  return (
    <AdminShell active="compte" title="Mon profil" hideTopTitle>
      <AdminPageShell
          pageClass="admin-page--profil"
          title="Mon profil"
          lead={
            role === "AGENT"
              ? "Votre compte agent, mot de passe et préférences d'affichage."
              : "Vos informations, votre mot de passe et vos préférences."
          }
          icon={IconUser}
        >
          <ClientFlashMessage tone={flash?.tone || "success"} onDismiss={() => setFlash(null)}>
            {flash?.message ||
              (profileMsg.type === "error" ? profileMsg.text : "") ||
              (passwordMsg.type === "error" ? passwordMsg.text : "")}
          </ClientFlashMessage>

          <div className="client-profile-page">
            <form className="client-profile-card client-profile-card--main" onSubmit={onSaveProfile} noValidate>
              <h3 className="client-profile-card__title">Paramètres du profil</h3>

              <div className="client-profile-avatar-row">
                <div className="client-avatar client-avatar--lg" aria-hidden="true">
                  {displayInitial}
                </div>
                <div className="client-profile-avatar-meta">
                  <p className="client-profile-avatar-meta__name">{profileForm.nom || "Mon compte"}</p>
                  <p className="client-profile-avatar-meta__email">{profileForm.email}</p>
                </div>
              </div>

              <div className="client-profile-grid-3">
                <label className="client-profile-field">
                  <span>Nom</span>
                  <span className="client-profile-input">
                    <IconUser />
                    <input
                      name="nom"
                      value={profileForm.nom}
                      onChange={onProfileChange}
                      autoComplete="name"
                      required
                      aria-invalid={Boolean(fieldErrors.nom)}
                    />
                  </span>
                  {fieldErrors.nom ? <em>{fieldErrors.nom}</em> : null}
                </label>
                <label className="client-profile-field">
                  <span>Login</span>
                  <span className="client-profile-input">
                    <IconUser />
                    <input value={loginLabel} readOnly disabled />
                  </span>
                </label>
                <label className="client-profile-field">
                  <span>Adresse e-mail</span>
                  <span className="client-profile-input">
                    <IconMail />
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={onProfileChange}
                      autoComplete="email"
                      placeholder={EMAIL_FORMAT_EXAMPLE}
                      required
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                  </span>
                  {fieldErrors.email ? <em>{fieldErrors.email}</em> : null}
                </label>
                <label className="client-profile-field">
                  <span>Rôle</span>
                  <span className="client-profile-input">
                    <IconUser />
                    <input value={roleLabel} readOnly disabled />
                  </span>
                </label>
              </div>

              <div className="client-profile-card__actions">
                <button type="submit" className="client-btn client-btn--primary" disabled={savingProfile}>
                  {savingProfile ? "Enregistrement…" : "Enregistrer les modifications"}
                </button>
              </div>
            </form>

            <div className="client-profile-row-2">
              <form className="client-profile-card" onSubmit={onSavePassword} noValidate>
                <h3 className="client-profile-card__title">Modification du mot de passe</h3>
                <div className="client-profile-pwd-grid">
                  <label className="client-profile-field">
                    <span>Mot de passe actuel</span>
                    <span className="client-profile-input">
                      <IconLock />
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={onPasswordChange}
                        autoComplete="current-password"
                        required
                        aria-invalid={Boolean(passwordFieldErrors.currentPassword)}
                      />
                    </span>
                    {passwordFieldErrors.currentPassword ? (
                      <em>{passwordFieldErrors.currentPassword}</em>
                    ) : null}
                  </label>
                  <label className="client-profile-field">
                    <span>Nouveau mot de passe</span>
                    <span className="client-profile-input">
                      <IconLock />
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={onPasswordChange}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        aria-invalid={Boolean(passwordFieldErrors.newPassword)}
                      />
                    </span>
                    {passwordFieldErrors.newPassword ? <em>{passwordFieldErrors.newPassword}</em> : null}
                  </label>
                  <label className="client-profile-field client-profile-field--full">
                    <span>Retaper le nouveau mot de passe</span>
                    <span className="client-profile-input">
                      <IconLock />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={onPasswordChange}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        aria-invalid={Boolean(passwordFieldErrors.confirmPassword)}
                      />
                    </span>
                    {passwordFieldErrors.confirmPassword ? (
                      <em>{passwordFieldErrors.confirmPassword}</em>
                    ) : null}
                  </label>
                </div>
                <div className="client-profile-card__actions">
                  <button type="submit" className="client-btn client-btn--primary" disabled={savingPassword}>
                    {savingPassword ? "Enregistrement…" : "Modifier le mot de passe"}
                  </button>
                </div>
              </form>

              <form className="client-profile-card" onSubmit={onSavePrefs}>
                <h3 className="client-profile-card__title">Préférences</h3>
                <fieldset className="admin-account__radios">
                  <legend>Période du tableau de bord</legend>
                  <label>
                    <input
                      type="radio"
                      name="dashDays"
                      value="7"
                      checked={dashDays === "7"}
                      onChange={(e) => setDashDays(e.target.value)}
                    />
                    7 derniers jours
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="dashDays"
                      value="30"
                      checked={dashDays === "30"}
                      onChange={(e) => setDashDays(e.target.value)}
                    />
                    30 derniers jours
                  </label>
                </fieldset>

                <fieldset className="admin-account__radios">
                  <legend>Alertes in-app</legend>
                  <p className="admin-ops__muted">
                    Les notifications apparaissent dans Mes notifications.
                  </p>
                  <label>
                    <input
                      type="checkbox"
                      checked={notifReservations}
                      onChange={(e) => setNotifReservations(e.target.checked)}
                    />
                    Me signaler les nouvelles réservations
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={notifMessages}
                      onChange={(e) => setNotifMessages(e.target.checked)}
                    />
                    Me signaler les nouveaux messages
                  </label>
                </fieldset>

                <fieldset className="admin-account__radios">
                  <legend>Affichage</legend>
                  <label>
                    <input
                      type="checkbox"
                      checked={compactNav}
                      onChange={(e) => setCompactNav(e.target.checked)}
                    />
                    Navigation latérale plus compacte
                  </label>
                </fieldset>

                <div className="client-profile-card__actions">
                  <button type="submit" className="client-btn client-btn--primary">
                    Enregistrer les préférences
                  </button>
                </div>
              </form>
            </div>
          </div>
        </AdminPageShell>
    </AdminShell>
  );
}

export default SettingsPage;
export { DASH_DAYS_KEY };
