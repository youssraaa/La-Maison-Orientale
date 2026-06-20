const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s().-]{6,30}$/;

export function validateContactForm(form) {
  const errors = {};
  const nom = form.nom?.trim() ?? "";
  const email = form.email?.trim() ?? "";
  const telephone = form.telephone?.trim() ?? "";
  const message = form.message?.trim() ?? "";

  if (!nom) {
    errors.nom = "Le nom est obligatoire.";
  } else if (nom.length > 100) {
    errors.nom = "Le nom ne peut pas dépasser 100 caractères.";
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "L'adresse e-mail n'est pas valide.";
  } else if (email.length > 255) {
    errors.email = "L'e-mail est trop long.";
  }

  if (telephone && !PHONE_PATTERN.test(telephone)) {
    errors.telephone = "Le numéro de téléphone n'est pas valide.";
  }

  if (!email && !telephone) {
    errors._form =
      "Indiquez au moins un e-mail ou un numéro de téléphone pour vous recontacter.";
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
