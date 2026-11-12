/** Navigation de l'espace agent — groupée par métier. */

export const AGENT_NAV_SECTIONS = [
  {
    id: "accueil",
    title: "Accueil",
    items: [
      { id: "dashboard", label: "Tableau de bord", to: "/admin/dashboard", ready: true },
    ],
  },
  {
    id: "service",
    title: "Service",
    items: [
      { id: "reservations", label: "Réservations", to: "/admin/reservations", ready: true },
      { id: "commandes", label: "Commandes", to: "/admin/commandes", ready: true },
    ],
  },
  {
    id: "clients",
    title: "Clients",
    items: [
      { id: "messages", label: "Messagerie clients", to: "/admin/messages", ready: true },
      { id: "clients", label: "Gestion des clients", to: "/admin/clients", ready: true },
    ],
  },
  {
    id: "contenu",
    title: "Contenu du site",
    items: [
      { id: "infos", label: "Infos générales", to: "/admin/infos", ready: true },
      { id: "carte", label: "Carte & tarifs", to: "/admin/carte", ready: true },
      { id: "horaires", label: "Horaires & fermetures", to: "/admin/horaires", ready: true },
      { id: "galerie", label: "Galerie photos", to: "/admin/galerie", ready: true },
    ],
  },
  {
    id: "params",
    title: "Paramètres",
    items: [
      { id: "restaurant", label: "Capacité & fonctionnement", to: "/admin/restaurant", ready: true },
    ],
  },
  {
    id: "compte",
    title: "Mon espace",
    items: [
      { id: "profil", label: "Mon profil", to: "/admin/compte", ready: true },
      { id: "notifications", label: "Mes notifications", to: "/admin/notifications", ready: true },
    ],
  },
];

export const AGENT_QUICK_LINKS = [
  { to: "/admin/reservations", label: "Réservations" },
  { to: "/admin/commandes", label: "Commandes" },
  { to: "/admin/messages", label: "Messagerie" },
  { to: "/admin/carte", label: "Carte & tarifs" },
  { to: "/admin/horaires", label: "Horaires" },
];

export const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "Tableau de bord", to: "/admin/dashboard", ready: true },
  { id: "agents", label: "Gestion des agents", to: "/admin/agents", ready: true },
  { id: "notifications", label: "Mes notifications", to: "/admin/notifications", ready: true },
  { id: "compte", label: "Mon profil", to: "/admin/compte", ready: true },
];
