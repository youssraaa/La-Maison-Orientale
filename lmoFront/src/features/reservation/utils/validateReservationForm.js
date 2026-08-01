import {
  isClosedDay,
  isValidSlotTime,
  isoDateLocal,
} from "./reservationAvailability";
import { DEFAULT_PHONE_DIAL, findDialEntry } from "./phoneDialCodes";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Partie nationale (sans indicatif), chiffres avec séparateurs possibles. */
const PHONE_NATIONAL_PATTERN = /^\d[\d\s./-]{5,16}\d$/;

export function validateStepDateTime(form) {
  const errors = {};
  const date = form.date?.trim() ?? "";
  const heure = form.heure?.trim() ?? "";

  if (!date) {
    errors.date = "Choisissez une date.";
  } else if (isClosedDay(date)) {
    errors.date = "Le restaurant est fermé ce jour-là.";
  } else {
    const today = isoDateLocal();
    if (date < today) {
      errors.date = "La date ne peut pas être dans le passé.";
    }
  }

  const nbPersonnes = Number(form.nbPersonnes);
  if (!form.nbPersonnes) {
    errors.nbPersonnes = "Indiquez le nombre de personnes.";
  } else if (!Number.isInteger(nbPersonnes) || nbPersonnes < 1) {
    errors.nbPersonnes = "Indiquez au moins une personne.";
  } else if (nbPersonnes > 30) {
    errors.nbPersonnes =
      "Pour plus de 30 personnes, contactez-nous directement.";
  }

  if (!heure) {
    errors.heure = "Choisissez un créneau horaire.";
  } else if (!isValidSlotTime(heure)) {
    errors.heure = "Ce créneau n'est pas proposé.";
  }

  return errors;
}

export function validateStepContact(form) {
  const errors = {};
  const prenom = form.prenom?.trim() ?? "";
  const nomFamille = form.nomFamille?.trim() ?? "";
  const telephone = form.telephone?.trim() ?? "";
  const email = form.email?.trim() ?? "";
  const commentaire = form.commentaire?.trim() ?? "";

  if (!prenom) {
    errors.prenom = "Veuillez indiquer votre prénom.";
  } else if (prenom.length > 50) {
    errors.prenom = "Le prénom est trop long (50 caractères max).";
  }

  if (!nomFamille) {
    errors.nomFamille = "Veuillez indiquer votre nom.";
  } else if (nomFamille.length > 50) {
    errors.nomFamille = "Le nom est trop long (50 caractères max).";
  }

  if ((prenom + " " + nomFamille).trim().length > 100) {
    errors.nomFamille = "Prénom et nom sont trop longs.";
  }

  if (!telephone) {
    errors.telephone = "Veuillez indiquer votre numéro de téléphone.";
  } else if (!PHONE_NATIONAL_PATTERN.test(telephone)) {
    errors.telephone =
      "Numéro invalide. Exemple : 470 12 34 56 (sans l’indicatif).";
  }

  if (!email) {
    errors.email = "Veuillez indiquer votre adresse e-mail.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Format d’e-mail invalide. Exemple : nom@email.com";
  } else if (email.length > 255) {
    errors.email = "L’e-mail est trop long.";
  }

  if (commentaire.length > 2000) {
    errors.commentaire = "Le commentaire est trop long (2000 caractères max).";
  }

  return errors;
}

export function fullPhoneNumber(national, dialOrIso = DEFAULT_PHONE_DIAL) {
  const digits = String(national || "").replace(/\D/g, "");
  if (!digits) return "";
  const entry = findDialEntry(dialOrIso);
  const prefix = entry?.dial || DEFAULT_PHONE_DIAL;
  return `${prefix}${digits}`;
}

export function fullClientName(prenom, nomFamille) {
  return `${String(prenom || "").trim()} ${String(nomFamille || "").trim()}`.trim();
}

export function validateReservationForm(form) {
  return {
    ...validateStepDateTime(form),
    ...validateStepContact(form),
  };
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}

/** Ordre de focus / résumé d’erreurs sur l’étape coordonnées. */
export const CONTACT_FIELD_ORDER = [
  "prenom",
  "nomFamille",
  "telephone",
  "email",
  "commentaire",
];

export function firstContactErrorField(errors) {
  return CONTACT_FIELD_ORDER.find((key) => errors[key]);
}
