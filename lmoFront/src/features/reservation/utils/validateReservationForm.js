import {
  isClosedDay,
  isValidSlotTime,
  isoDateLocal,
} from "./reservationAvailability";
import { DEFAULT_PHONE_DIAL, DEFAULT_PHONE_ISO, findDialEntry, PHONE_DIAL_CODES } from "./phoneDialCodes";
import {
  validateEmail,
  validatePhoneNational,
} from "../../../common/utils/contactFieldValidation";

export function validateStepDateTime(form, maxOnlineCovers = 10) {
  const errors = {};
  const date = form.date?.trim() ?? "";
  const heure = form.heure?.trim() ?? "";
  const maxCovers = Number(maxOnlineCovers) || 10;

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
  } else if (nbPersonnes > maxCovers) {
    errors.nbPersonnes = `Pour plus de ${maxCovers} personnes, contactez-nous par téléphone.`;
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
    errors.telephone = validatePhoneNational("", { required: true });
  } else {
    const phoneError = validatePhoneNational(telephone, { required: true });
    if (phoneError) errors.telephone = phoneError;
  }

  if (!email) {
    errors.email = validateEmail("", { required: true });
  } else {
    const emailError = validateEmail(email, { required: true });
    if (emailError) errors.email = emailError;
  }

  if (commentaire.length > 2000) {
    errors.commentaire = "Le commentaire ne peut pas dépasser 2000 caractères.";
  }

  return errors;
}

/** Modification d'une réservation existante (page /gerer). */
export function validateModifyReservationForm(form, maxOnlineCovers = 10, maxNbPersonnes = null) {
  const errors = validateStepDateTime(form, maxOnlineCovers);
  const commentaire = form.commentaire?.trim() ?? "";

  if (commentaire.length > 2000) {
    errors.commentaire = "Le commentaire ne peut pas dépasser 2000 caractères.";
  }

  if (maxNbPersonnes != null) {
    const nb = Number(form.nbPersonnes);
    if (Number.isFinite(nb) && nb > maxNbPersonnes) {
      errors.nbPersonnes = `Maximum ${maxNbPersonnes} personnes pour cette réservation.`;
    }
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

/** Nom complet compte client → prénom + nom pour le formulaire réservation. */
export function splitFullName(nom) {
  const parts = String(nom || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { prenom: "", nomFamille: "" };
  if (parts.length === 1) return { prenom: "", nomFamille: parts[0] };
  return { prenom: parts[0], nomFamille: parts.slice(1).join(" ") };
}

/** Téléphone stocké (+32…) → indicatif ISO + partie nationale. */
export function parseStoredPhone(telephone) {
  const raw = String(telephone || "").trim();
  if (!raw) return { phoneIso: DEFAULT_PHONE_ISO, telephone: "" };

  const byLength = [...PHONE_DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const entry of byLength) {
    if (raw.startsWith(entry.dial)) {
      return {
        phoneIso: entry.iso,
        telephone: raw.slice(entry.dial.length).trim(),
      };
    }
  }

  return {
    phoneIso: DEFAULT_PHONE_ISO,
    telephone: raw.replace(/^\+\d+\s*/, ""),
  };
}

export function profileToContactFields(profile) {
  const { prenom, nomFamille } = splitFullName(profile?.nom);
  const phone = parseStoredPhone(profile?.telephone);
  return {
    prenom,
    nomFamille,
    email: profile?.email?.trim() || "",
    phoneIso: phone.phoneIso,
    telephone: phone.telephone,
  };
}

export function validateReservationForm(form) {
  return {
    ...validateStepDateTime(form),
    ...validateStepContact(form),
  };
}

export function hasValidationErrors(errors) {
  return Object.values(errors).some(
    (value) => value != null && String(value).trim() !== ""
  );
}

export function hasFieldErrors(errors, fields) {
  return fields.some((key) => Boolean(errors[key]));
}

export const DATETIME_FIELD_KEYS = ["date", "heure", "nbPersonnes"];

export function clearFieldErrors(errors, ...fields) {
  const next = { ...errors };
  fields.forEach((field) => {
    delete next[field];
  });
  delete next._form;
  return next;
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
