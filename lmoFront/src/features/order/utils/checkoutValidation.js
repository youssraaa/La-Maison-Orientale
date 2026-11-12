import {
  validateEmail,
  validatePhoneLocal,
  validateBelgianAddress,
} from "../../../common/utils/contactFieldValidation";
import { getPostalCodeZoneError } from "./deliveryZone";
import { getMinimumOrderMessage } from "./orderPolicy";

function shortEmailError(message) {
  if (!message) return message;
  if (message.includes("requis") || message.includes("indiquer")) return "E-mail requis.";
  return "E-mail invalide.";
}

function shortPhoneError(message) {
  if (!message) return message;
  if (message.includes("requis")) return "Téléphone requis.";
  return "Numéro invalide.";
}

export function validateCheckoutForm(form, mode, { subtotal, orderPolicy } = {}) {
  const errors = {};
  if (!form.nom?.trim()) {
    errors.nom = "Nom requis.";
  }
  const emailError = validateEmail(form.email, { required: true });
  if (emailError) errors.email = shortEmailError(emailError);

  const phoneError = validatePhoneLocal(form.telephone, { required: true });
  if (phoneError) errors.telephone = shortPhoneError(phoneError);

  if (mode === "LIVRAISON") {
    Object.assign(errors, validateBelgianAddress(form, { required: true }));
    const zoneError = getPostalCodeZoneError(form.adresseCp);
    if (zoneError) {
      errors.adresseCp = zoneError;
    }
  }

  return errors;
}

export function validateCheckoutOrder(subtotal, mode, orderPolicy) {
  const minimumMessage = getMinimumOrderMessage(subtotal, mode, orderPolicy);
  if (minimumMessage) return minimumMessage;
  return null;
}

export function getCheckoutErrorFocus(errors) {
  if (errors.nom || errors.email || errors.telephone) return "contact";
  if (errors.adresseRue || errors.adresseNumero || errors.adresseCp || errors.adresseVille) {
    return "address";
  }
  return null;
}
