/**
 * Normalise et remappe les erreurs API vers les clés des champs UI.
 * @param {Record<string, string>} fieldErrors
 * @param {Record<string, string>} fieldMap clé API → clé UI
 */
export function mapApiFieldErrors(fieldErrors = {}, fieldMap = {}) {
  const mapped = {};
  Object.entries(fieldErrors || {}).forEach(([key, message]) => {
    if (!message) return;
    if (key === "_form") {
      mapped._form = message;
      return;
    }
    const uiKey = fieldMap[key] ?? key;
    mapped[uiKey] = mapped[uiKey] ? `${mapped[uiKey]} ${message}` : message;
  });
  return mapped;
}

/** Erreurs réservation : le backend valide `nom`, l'UI utilise prénom + nom. */
export function mapReservationApiErrors(fieldErrors = {}) {
  const mapped = mapApiFieldErrors(fieldErrors);
  if (mapped.nom) {
    mapped.nomFamille = mapped.nomFamille || mapped.nom;
    delete mapped.nom;
  }
  return mapped;
}

/** Erreurs commande : le backend utilise `adresseLivraison`. */
export function mapCommandeApiErrors(fieldErrors = {}) {
  return mapApiFieldErrors(fieldErrors, { adresseLivraison: "adresseCp" });
}

/** Fusionne fieldErrors API + message générique. */
export function mergeApiError(error, fieldMap = {}) {
  const mapped = mapApiFieldErrors(error?.fieldErrors || {}, fieldMap);
  const formMessage = mapped._form || error?.message;
  if (formMessage && !mapped._form) {
    mapped._form = formMessage;
  }
  return mapped;
}

export function hasValidationErrors(errors) {
  return Object.entries(errors || {}).some(
    ([key, value]) => key !== "_form" && value != null && String(value).trim() !== ""
  );
}

export function countFieldErrors(errors) {
  return Object.keys(errors || {}).filter((key) => key !== "_form" && errors[key]).length;
}

/** Message bannière : _form, ou résumé si plusieurs champs, ou seule erreur champ. */
export function getFormBannerMessage(errors, fallback = "") {
  if (!errors) return fallback;
  if (errors._form) return errors._form;
  const keys = Object.keys(errors).filter((key) => key !== "_form" && errors[key]);
  if (keys.length > 1) return "Veuillez corriger les champs signalés.";
  if (keys.length === 1) return errors[keys[0]];
  return fallback;
}

export function clearFieldError(errors, field) {
  if (!errors?.[field]) return errors;
  const next = { ...errors };
  delete next[field];
  if (Object.keys(next).filter((k) => k !== "_form").length === 0) {
    delete next._form;
  }
  return next;
}
