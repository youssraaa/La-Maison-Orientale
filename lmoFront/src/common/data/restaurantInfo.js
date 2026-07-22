/** Infos publiques — sources : enseigne + registre BCE (adresse) */
export const restaurantInfo = {
  name: "La Maison Orientale",
  /** Texte réel de l’enseigne */
  tagline: "Restaurant Snack BBQ & Shawarma au charbon",
  cuisine: "Cuisine syrienne",
  address: {
    street: "Rue Jules Destrée 219",
    city: "7390 Quaregnon",
    full: "Rue Jules Destrée 219, 7390 Quaregnon",
    country: "Belgique",
  },
  /** À confirmer avec le restaurant si besoin */
  phone: {
    display: "0498 67 22 62",
    href: "tel:+32498672262",
  },
  email: {
    display: "contact@lamaisonorientale.be",
    href: "mailto:contact@lamaisonorientale.be",
  },
  /** Horaires Google Maps (relevé actuel) */
  hours: {
    schedule: [
      { day: "Lundi", time: "Fermé" },
      { day: "Mardi", time: "12:00 – 00:00" },
      { day: "Mercredi", time: "12:00 – 00:00" },
      { day: "Jeudi", time: "12:00 – 00:00" },
      { day: "Vendredi", time: "12:00 – 00:00" },
      { day: "Samedi", time: "12:00 – 00:00" },
      { day: "Dimanche", time: "12:00 – 00:00" },
    ],
    summary: "Mar–Dim 12:00 – 00:00 · Lun fermé",
  },
  map: {
    lat: 50.4444,
    lng: 3.8642,
    googleEmbed:
      "https://www.google.com/maps?q=Rue+Jules+Destr%C3%A9e+219,+7390+Quaregnon,+Belgique&z=16&output=embed",
    googleDirections:
      "https://www.google.com/maps/dir/?api=1&destination=Rue+Jules+Destr%C3%A9e+219,+7390+Quaregnon,+Belgique",
  },
  /** Fiche Google Maps : maison orientale, Rue Jules Destrée 219, Quaregnon */
  googleReviewsUrl:
    "https://www.google.com/maps/place/maison+orientale/@50.4444201,3.8642042,17z/data=!4m6!3m5!1s0x47c25b004b656297:0x71954c2163c36c90!8m2!3d50.4444201!4d3.8642042!16s%2Fg%2F11ysp_byg4",
  googleRating: {
    score: "4,6",
    countLabel: "50 avis",
  },
  owners: ["Salah Karayem", "Zakaria Karayem"],
  /** Instagram vérifié. TikTok : lien provisoire à confirmer. */
  socials: [
    {
      id: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/la_maisonorientale/",
    },
    {
      id: "tiktok",
      label: "TikTok",
      href: "https://www.tiktok.com/@la_maisonorientale",
    },
  ],
};
