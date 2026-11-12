import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";

const LOGIN_COPY = {
  title: (
    <>
      Bienvenue <em>chez nous</em>
    </>
  ),
  lead: "Connectez-vous avec votre e-mail et mot de passe pour accéder à votre espace.",
  copy: "Retrouvez tout notre univers culinaire en quelques clics.",
  tags: ["Réservations", "Commandes", "Historique"],
  foot: "Accès sécurisé · Données protégées · Sécurité renforcée",
};

const SIGNUP_COPY = {
  title: (
    <>
      <span className="client-auth__brand-title-line">Rejoignez notre Maison</span>
      <em>en quelques clics</em>
    </>
  ),
  copy: "Complétez le formulaire pour profiter de vos réservations et commandes en toute simplicité.",
  tags: ["Réservations", "Commandes", "Historique"],
  foot: "Inscription gratuite · Accès immédiat · Données sécurisées",
};

const ACTIVATE_COPY = {
  title: (
    <>
      Activez votre <em>espace agent</em>
    </>
  ),
  lead: "Un administrateur vous a invité à rejoindre l'équipe du restaurant.",
  copy: "Choisissez un mot de passe sécurisé pour accéder à votre espace agent.",
  tags: ["Réservations", "Commandes", "Messages"],
  foot: "Lien sécurisé · Valable 72 heures · Espace agent",
};

const RESET_COPY = {
  title: (
    <>
      Réinitialisez votre <em>mot de passe agent</em>
    </>
  ),
  lead: "Définissez un nouveau mot de passe pour votre espace agent.",
  copy: "Utilisez un mot de passe unique d'au moins 8 caractères.",
  tags: ["Accès sécurisé", "Espace agent", "Équipe"],
  foot: "Lien à usage unique · Contactez l'administrateur si besoin",
};

const VARIANT_COPY = {
  login: LOGIN_COPY,
  signup: SIGNUP_COPY,
  activate: ACTIVATE_COPY,
  reset: RESET_COPY,
};

export default function ClientAuthBrandPanel({ variant = "login" }) {
  const { info } = useRestaurantInfo();
  const content = VARIANT_COPY[variant] || LOGIN_COPY;
  const brandClass =
    variant === "signup"
      ? "signup"
      : variant === "activate" || variant === "reset"
        ? variant
        : "login";

  return (
    <aside
      className={`client-auth__brand client-auth__brand--${brandClass}`}
      aria-label={info.name}
    >
      <div className="client-auth__brand-head">
        <img
          className="client-auth__logo"
          src="/images/logo-footer.png"
          width={72}
          height={72}
          alt=""
        />
        <p className="client-auth__brand-name">{info.name}</p>
      </div>

      <div className="client-auth__brand-content">
        <h2 className="client-auth__brand-title">{content.title}</h2>
        {content.lead ? (
          <p className="client-auth__brand-lead">{content.lead}</p>
        ) : null}
        {content.copy ? <p className="client-auth__brand-copy">{content.copy}</p> : null}
        <ul className="client-auth__tags">
          {content.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>

      <p className="client-auth__brand-foot">{content.foot}</p>
    </aside>
  );
}
