import { validateEmail, validatePhoneLocal } from "./contactFieldValidation";

export function validateRequired(value, message) {
  if (!String(value ?? "").trim()) return message;
  return null;
}

export function validateFullName(value, { required = true, maxLength = 100 } = {}) {
  const name = String(value ?? "").trim();
  if (!name) {
    return required ? "Le nom est obligatoire." : null;
  }
  if (name.length > maxLength) {
    return `Le nom ne peut pas dépasser ${maxLength} caractères.`;
  }
  return null;
}

export function validatePersonName(value, label) {
  const name = String(value ?? "").trim();
  if (!name) return `${label} est obligatoire.`;
  if (name.length < 2) return `${label} doit contenir au moins 2 caractères.`;
  if (name.length > 100) return `${label} est trop long.`;
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
    return "Lettres, espaces, tirets et apostrophes uniquement.";
  }
  return null;
}

export function validatePassword(
  value,
  { required = true, minLength = 8, maxLength = 100, label = "Mot de passe" } = {}
) {
  const password = String(value ?? "");
  if (!password) {
    return required ? `${label} : obligatoire.` : null;
  }
  if (password.length < minLength) {
    return `${label} : ${minLength} caractères minimum.`;
  }
  if (password.length > maxLength) {
    return `${label} : trop long (${maxLength} caractères max).`;
  }
  return null;
}

export function validatePasswordConfirm(password, confirm) {
  const confirmError = validateRequired(confirm, "La confirmation est obligatoire.");
  if (confirmError) return confirmError;
  if (password !== confirm) return "Les mots de passe ne correspondent pas.";
  return null;
}

export function validateSignupForm(form) {
  const errors = {};
  const nomError = validateFullName(form.nom, { required: true });
  if (nomError) errors.nom = nomError;

  const emailError = validateEmail(form.email, { required: true });
  if (emailError) errors.email = emailError;

  const phoneError = validatePhoneLocal(form.telephone, { required: false });
  if (phoneError) errors.telephone = phoneError;

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  const confirmError = validatePasswordConfirm(form.password, form.confirm);
  if (confirmError) errors.confirm = confirmError;

  return errors;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email, { required: true });
  if (emailError) errors.email = emailError;

  const passwordError = validateRequired(password, "Le mot de passe est obligatoire.");
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function validatePasswordChangeForm(form) {
  const errors = {};
  const currentError = validateRequired(
    form.currentPassword,
    "Le mot de passe actuel est obligatoire."
  );
  if (currentError) errors.currentPassword = currentError;

  const newError = validatePassword(form.newPassword, { label: "Nouveau mot de passe" });
  if (newError) errors.newPassword = newError;

  const confirmError = validatePasswordConfirm(form.newPassword, form.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  return errors;
}

export function validateInvitePasswordForm(password, confirm) {
  const errors = {};
  const passwordError = validatePassword(password, { label: "Mot de passe" });
  if (passwordError) errors.password = passwordError;

  const confirmError = validatePasswordConfirm(password, confirm);
  if (confirmError) errors.confirm = confirmError;

  return errors;
}
