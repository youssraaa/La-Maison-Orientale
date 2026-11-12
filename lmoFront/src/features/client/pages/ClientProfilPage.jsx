import { useEffect, useState } from "react";
import { useClientAuth } from "../../../common/auth/ClientAuthContext";
import { useClientPortal } from "../components/ClientPortalLayout";
import ClientFlashMessage from "../components/ClientFlashMessage";
import ClientPageShell from "../components/ClientPageShell";
import { IconLock, IconMail, IconMap, IconPhone, IconUser } from "../components/ClientPortalIcons";
import { changeClientPassword, updateClientProfile } from "../api/clientAccountApi";
import { clientInitials } from "../hooks/useClientAccountData";

const COUNTRIES = ["Belgique", "France", "Luxembourg", "Pays-Bas"];

function emptyProfileForm(profile) {
  return {
    nom: profile?.nom || "",
    prenom: profile?.prenom || "",
    email: profile?.email || "",
    telephone: profile?.telephone || "",
    pays: profile?.pays || "Belgique",
    adresse: profile?.adresse || "",
    ville: profile?.ville || "Mons",
    codePostal: profile?.codePostal || "",
    adresseLivraison: profile?.adresseLivraison || "",
    codePostalLivraison: profile?.codePostalLivraison || "",
    villeLivraison: profile?.villeLivraison || "",
  };
}

export default function ClientProfilPage() {
  const { token, login } = useClientAuth();
  const { profile, refresh } = useClientPortal();

  const [form, setForm] = useState(() => emptyProfileForm(profile));
  const [delivery, setDelivery] = useState(() => ({
    adresseLivraison: profile?.adresseLivraison || "",
    codePostalLivraison: profile?.codePostalLivraison || "",
    villeLivraison: profile?.villeLivraison || "",
  }));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [flash, setFlash] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => {
    setForm(emptyProfileForm(profile));
    setDelivery({
      adresseLivraison: profile?.adresseLivraison || "",
      codePostalLivraison: profile?.codePostalLivraison || "",
      villeLivraison: profile?.villeLivraison || "",
    });
  }, [profile]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileBusy(true);
    setFlash(null);
    try {
      const auth = await updateClientProfile(token, form);
      login({
        token: auth.token,
        user: { id: auth.userId, nom: auth.nom, email: auth.email, role: auth.role },
      });
      refresh?.();
      setFlash({ tone: "success", message: "Vos informations ont bien été enregistrées." });
    } catch (err) {
      setFlash({ tone: "error", message: err.message || "Enregistrement impossible." });
    } finally {
      setProfileBusy(false);
    }
  };

  const saveDelivery = async (event) => {
    event.preventDefault();
    setDeliveryBusy(true);
    setFlash(null);
    try {
      const auth = await updateClientProfile(token, { ...form, ...delivery });
      login({
        token: auth.token,
        user: { id: auth.userId, nom: auth.nom, email: auth.email, role: auth.role },
      });
      refresh?.();
      setFlash({ tone: "success", message: "Adresse de livraison enregistrée." });
    } catch (err) {
      setFlash({ tone: "error", message: err.message || "Enregistrement impossible." });
    } finally {
      setDeliveryBusy(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFlash({ tone: "error", message: "Les mots de passe ne correspondent pas." });
      return;
    }
    setPasswordBusy(true);
    setFlash(null);
    try {
      await changeClientPassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setFlash({ tone: "success", message: "Mot de passe modifié avec succès." });
    } catch (err) {
      setFlash({ tone: "error", message: err.message || "Modification impossible." });
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <ClientPageShell
      pageClass="client-page--profil"
      title="Mon profil"
      lead="Vos informations et votre mot de passe."
      icon={IconUser}
    >
      <ClientFlashMessage tone={flash?.tone || "success"} onDismiss={() => setFlash(null)}>
        {flash?.message}
      </ClientFlashMessage>

      <div className="client-profile-page">
        <form className="client-profile-card client-profile-card--main" onSubmit={saveProfile}>
          <h3 className="client-profile-card__title">Paramètres du profil</h3>

          <div className="client-profile-avatar-row">
            <div className="client-avatar client-avatar--lg" aria-hidden="true">
              {clientInitials(form.prenom, form.nom)}
            </div>
            <div className="client-profile-avatar-meta">
              <p className="client-profile-avatar-meta__name">
                {[form.prenom, form.nom].filter(Boolean).join(" ") || "Mon compte"}
              </p>
              <p className="client-profile-avatar-meta__email">{form.email}</p>
            </div>
          </div>

          <div className="client-profile-grid-3">
            <label className="client-profile-field">
              <span>Nom</span>
              <span className="client-profile-input">
                <IconUser />
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  required
                />
              </span>
            </label>
            <label className="client-profile-field">
              <span>Prénom</span>
              <span className="client-profile-input">
                <IconUser />
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                  required
                />
              </span>
            </label>
            <label className="client-profile-field">
              <span>Adresse e-mail</span>
              <span className="client-profile-input">
                <IconMail />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </span>
            </label>
            <label className="client-profile-field">
              <span>Téléphone</span>
              <span className="client-profile-input">
                <IconPhone />
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                  placeholder="+32 470 00 00 00"
                />
              </span>
            </label>
            <label className="client-profile-field">
              <span>Pays</span>
              <span className="client-profile-input">
                <IconMap />
                <select
                  value={form.pays}
                  onChange={(e) => setForm((f) => ({ ...f, pays: e.target.value }))}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="client-profile-field">
              <span>Adresse</span>
              <span className="client-profile-input">
                <IconMap />
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
                  placeholder="Rue et numéro"
                />
              </span>
            </label>
          </div>

          <div className="client-profile-card__actions">
            <button type="submit" className="client-btn client-btn--primary" disabled={profileBusy}>
              {profileBusy ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </div>
        </form>

        <div className="client-profile-row-2">
          <form className="client-profile-card" onSubmit={savePassword}>
            <h3 className="client-profile-card__title">Modification du mot de passe</h3>
            <div className="client-profile-pwd-grid">
              <label className="client-profile-field">
                <span>Mot de passe actuel</span>
                <span className="client-profile-input">
                  <IconLock />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                    }
                    required
                    autoComplete="current-password"
                  />
                </span>
              </label>
              <label className="client-profile-field">
                <span>Nouveau mot de passe</span>
                <span className="client-profile-input">
                  <IconLock />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </span>
              </label>
              <label className="client-profile-field client-profile-field--full">
                <span>Retaper le nouveau mot de passe</span>
                <span className="client-profile-input">
                  <IconLock />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </span>
              </label>
            </div>
            <div className="client-profile-card__actions">
              <button type="submit" className="client-btn client-btn--primary" disabled={passwordBusy}>
                {passwordBusy ? "Modification…" : "Modifier le mot de passe"}
              </button>
            </div>
          </form>

          <form className="client-profile-card" onSubmit={saveDelivery}>
            <h3 className="client-profile-card__title">Adresse de livraison</h3>
            <div className="client-profile-delivery-grid">
              <label className="client-profile-field client-profile-field--full">
                <span>Rue et numéro</span>
                <span className="client-profile-input">
                  <IconMap />
                  <input
                    type="text"
                    value={delivery.adresseLivraison}
                    onChange={(e) =>
                      setDelivery((f) => ({ ...f, adresseLivraison: e.target.value }))
                    }
                    placeholder="Ex. Rue de la Gare 12"
                  />
                </span>
              </label>
              <label className="client-profile-field">
                <span>Code postal</span>
                <span className="client-profile-input">
                  <IconMap />
                  <input
                    type="text"
                    value={delivery.codePostalLivraison}
                    onChange={(e) =>
                      setDelivery((f) => ({ ...f, codePostalLivraison: e.target.value }))
                    }
                    placeholder="7000"
                  />
                </span>
              </label>
              <label className="client-profile-field client-profile-field--span2">
                <span>Ville</span>
                <span className="client-profile-input">
                  <IconMap />
                  <input
                    type="text"
                    value={delivery.villeLivraison}
                    onChange={(e) =>
                      setDelivery((f) => ({ ...f, villeLivraison: e.target.value }))
                    }
                    placeholder="Mons"
                  />
                </span>
              </label>
            </div>
            <div className="client-profile-card__actions">
              <button type="submit" className="client-btn client-btn--primary" disabled={deliveryBusy}>
                {deliveryBusy ? "Enregistrement…" : "Sauvegarder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ClientPageShell>
  );
}
