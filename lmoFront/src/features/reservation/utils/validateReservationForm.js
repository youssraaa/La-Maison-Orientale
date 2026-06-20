const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s().-]{6,30}$/;

export function validateReservationForm(form) {
  const errors = {};
  const nom = form.nom?.trim() ?? "";
  const telephone = form.telephone?.trim() ?? "";
  const email = form.email?.trim() ?? "";
  const date = form.date?.trim() ?? "";
  const heure = form.heure?.trim() ?? "";
  const commentaire = form.commentaire?.trim() ?? "";

  if (!nom) {
    errors.nom = "Le nom est obligatoire.";
  } else if (nom.length > 100) {
    errors.nom = "Le nom ne peut pas dépasser 100 caractères.";
  }

  if (!telephone) {
    errors.telephone = "Le téléphone est obligatoire.";
  } else if (!PHONE_PATTERN.test(telephone)) {
    errors.telephone = "Le numéro de téléphone n'est pas valide.";
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "L'adresse e-mail n'est pas valide.";
  } else if (email.length > 255) {
    errors.email = "L'e-mail est trop long.";
  }

  if (!date) {
    errors.date = "La date est obligatoire.";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(`${date}T00:00:00`);
    if (Number.isNaN(selected.getTime())) {
      errors.date = "La date n'est pas valide.";
    } else if (selected <= today) {
      errors.date = "La date doit être postérieure à aujourd'hui.";
    }
  }

  if (!heure) {
    errors.heure = "L'heure est obligatoire.";
  }

  const nbPersonnes = Number(form.nbPersonnes);
  if (!form.nbPersonnes) {
    errors.nbPersonnes = "Le nombre de personnes est obligatoire.";
  } else if (!Number.isInteger(nbPersonnes) || nbPersonnes < 1) {
    errors.nbPersonnes = "Indiquez au moins une personne.";
  } else if (nbPersonnes > 30) {
    errors.nbPersonnes = "Pour plus de 30 personnes, contactez-nous directement.";
  }

  if (commentaire.length > 2000) {
    errors.commentaire = "Le commentaire ne peut pas dépasser 2000 caractères.";
  }

  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
