const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(form) {
  const errors = {};
  const nom = form.nom?.trim() ?? "";
  const email = form.email?.trim() ?? "";
  const sujet = form.sujet?.trim() ?? "";
  const message = form.message?.trim() ?? "";

  if (!nom) {
    errors.nom = "Le nom est obligatoire.";
  } else if (nom.length > 100) {
    errors.nom = "Le nom ne peut pas dépasser 100 caractères.";
  }

  if (!email) {
    errors.email = "L'e-mail est obligatoire pour que nous puissions vous répondre.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "L'adresse e-mail n'est pas valide.";
  } else if (email.length > 255) {
    errors.email = "L'e-mail est trop long.";
  }

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
