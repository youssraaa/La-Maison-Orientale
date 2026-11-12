import {
  CONTACT_FIELD_MESSAGES,
  validateEmail,
} from "../../../common/utils/contactFieldValidation";

export function validateContactForm(form) {
  const errors = {};
  const nom = form.nom?.trim() ?? "";
  const sujet = form.sujet?.trim() ?? "";
  const message = form.message?.trim() ?? "";

  if (!nom) {
    errors.nom = "Le nom est obligatoire.";
  } else if (nom.length > 100) {
    errors.nom = "Le nom ne peut pas dépasser 100 caractères.";
  }

  const emailError = validateEmail(form.email, { required: true });
  if (emailError) errors.email = emailError;

  if (!sujet) {
    errors.sujet = "Le sujet est obligatoire.";
  } else if (sujet.length > 120) {
    errors.sujet = "Le sujet ne peut pas dépasser 120 caractères.";
  }

  if (!message) {
    errors.message = "Le message est obligatoire.";
  } else if (message.length < 10) {
    errors.message = "Le message doit contenir au moins 10 caractères.";
  } else if (message.length > 2000) {
    errors.message = "Le message ne peut pas dépasser 2000 caractères.";
  }

  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}

export { CONTACT_FIELD_MESSAGES };
