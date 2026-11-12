export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



/** Partie nationale sans indicatif (+32, +33…). */

export const PHONE_NATIONAL_PATTERN = /^\d[\d\s./-]{5,14}\d$/;



/** Numéro belge / international saisi en une seule fois (0498…, +32…). */

export const PHONE_LOCAL_PATTERN = /^(\+\d{1,3}\s?)?0?\d[\d\s./-]{6,16}\d$/;



export const PHONE_NATIONAL_MIN_DIGITS = 8;

export const PHONE_NATIONAL_MAX_DIGITS = 10;

export const PHONE_LOCAL_MIN_DIGITS = 9;

export const PHONE_LOCAL_MAX_DIGITS = 13;



export const EMAIL_FORMAT_EXAMPLE = "nom@email.com";

export const PHONE_NATIONAL_EXAMPLE = "498 67 22 62";

export const PHONE_LOCAL_EXAMPLE = "0498 67 22 62";



export const CONTACT_FIELD_MESSAGES = {

  emailRequired: "Veuillez indiquer votre adresse e-mail.",

  emailInvalid: `Format d'e-mail invalide. Exemple : ${EMAIL_FORMAT_EXAMPLE}`,

  emailTooLong: "L'e-mail est trop long.",

  phoneRequired: "Numéro de téléphone requis.",

  phoneNationalInvalid: `Numéro invalide. Exemple : ${PHONE_NATIONAL_EXAMPLE} (sans l'indicatif).`,

  phoneLocalInvalid: `Numéro invalide. Exemple : ${PHONE_LOCAL_EXAMPLE}`,

  phoneTooLong: `Le numéro est trop long (${PHONE_NATIONAL_MAX_DIGITS} chiffres max sans indicatif).`,

  phoneLocalTooLong: `Le numéro est trop long (${PHONE_LOCAL_MAX_DIGITS} chiffres max).`,

  phoneTooShort: "Le numéro est trop court.",

};



export function countPhoneDigits(value) {

  return String(value ?? "").replace(/\D/g, "").length;

}



export function sanitizePhoneNationalInput(value) {

  let digits = 0;

  let result = "";

  for (const ch of String(value ?? "")) {

    if (/\d/.test(ch)) {

      if (digits >= PHONE_NATIONAL_MAX_DIGITS) continue;

      digits += 1;

      result += ch;

    } else if (/[\s./-]/.test(ch)) {

      result += ch;

    }

  }

  return result;

}



export function sanitizePhoneLocalInput(value) {

  let digits = 0;

  let result = "";

  for (const ch of String(value ?? "")) {

    if (/\d/.test(ch)) {

      if (digits >= PHONE_LOCAL_MAX_DIGITS) continue;

      digits += 1;

      result += ch;

    } else if (/[\s./+()-]/.test(ch)) {

      result += ch;

    }

  }

  return result;

}



export function validateEmail(value, { required = true } = {}) {

  const email = String(value ?? "").trim();

  if (!email) {

    return required ? CONTACT_FIELD_MESSAGES.emailRequired : null;

  }

  if (!EMAIL_PATTERN.test(email)) {

    return CONTACT_FIELD_MESSAGES.emailInvalid;

  }

  if (email.length > 255) {

    return CONTACT_FIELD_MESSAGES.emailTooLong;

  }

  return null;

}



export function validatePhoneNational(value, { required = true } = {}) {

  const telephone = String(value ?? "").trim();

  if (!telephone) {

    return required ? CONTACT_FIELD_MESSAGES.phoneRequired : null;

  }



  const digits = countPhoneDigits(telephone);

  if (digits > PHONE_NATIONAL_MAX_DIGITS) {

    return CONTACT_FIELD_MESSAGES.phoneTooLong;

  }

  if (digits < PHONE_NATIONAL_MIN_DIGITS) {

    return CONTACT_FIELD_MESSAGES.phoneTooShort;

  }

  if (!PHONE_NATIONAL_PATTERN.test(telephone)) {

    return CONTACT_FIELD_MESSAGES.phoneNationalInvalid;

  }

  return null;

}



export function composeDeliveryAddress(fields) {
  const rue = String(fields.adresseRue ?? "").trim();
  const numero = String(fields.adresseNumero ?? "").trim();
  const cp = String(fields.adresseCp ?? "").trim();
  const ville = String(fields.adresseVille ?? "").trim();
  if (!rue && !numero && !cp && !ville) return "";
  return [[rue, numero].filter(Boolean).join(" "), cp, ville].filter(Boolean).join(", ");
}

export function validateBelgianAddress(fields, { required = true } = {}) {
  const rue = String(fields.adresseRue ?? "").trim();
  const numero = String(fields.adresseNumero ?? "").trim();
  const cp = String(fields.adresseCp ?? "").trim();
  const ville = String(fields.adresseVille ?? "").trim();
  const hasAny = rue || numero || cp || ville;

  if (!required && !hasAny) return {};

  const errors = {};
  if (rue.length < 2) {
    errors.adresseRue = "Indiquez le nom de la rue.";
  }
  if (!numero) {
    errors.adresseNumero = "Indiquez le numéro de maison.";
  }
  if (!/^\d{4}$/.test(cp)) {
    errors.adresseCp = "Code postal à 4 chiffres.";
  }
  if (ville.length < 2) {
    errors.adresseVille = "Indiquez la commune.";
  }
  return errors;
}

export function isValidDeliveryAddress(fields) {
  return Object.keys(validateBelgianAddress(fields)).length === 0;
}

export function validatePhoneLocal(value, { required = true } = {}) {

  const telephone = String(value ?? "").trim();

  if (!telephone) {

    return required ? CONTACT_FIELD_MESSAGES.phoneRequired : null;

  }



  const digits = countPhoneDigits(telephone);

  if (digits > PHONE_LOCAL_MAX_DIGITS) {

    return CONTACT_FIELD_MESSAGES.phoneLocalTooLong;

  }

  if (digits < PHONE_LOCAL_MIN_DIGITS) {

    return CONTACT_FIELD_MESSAGES.phoneTooShort;

  }

  if (!PHONE_LOCAL_PATTERN.test(telephone)) {

    return CONTACT_FIELD_MESSAGES.phoneLocalInvalid;

  }

  return null;

}


