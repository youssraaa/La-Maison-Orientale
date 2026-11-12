import { computeDeliveryEstimate } from "./orderDeliveryEstimate";

/** Rayon max autour du restaurant (Quaregnon). */
export const DEFAULT_MAX_DELIVERY_KM = 12;

/** Codes postaux desservis — Mons, Jemappes, Quaregnon et environs proches. */
export const DELIVERY_POSTAL_CODES = new Set([
  "7000",
  "7011",
  "7012",
  "7020",
  "7021",
  "7022",
  "7024",
  "7030",
  "7031",
  "7032",
  "7033",
  "7034",
  "7040",
  "7041",
  "7340",
  "7370",
  "7380",
  "7390",
]);

export const DELIVERY_ZONE_LABEL =
  "Mons, Jemappes, Quaregnon, Colfontaine, Dour et environs";

export function isAllowedDeliveryPostalCode(cp) {
  return DELIVERY_POSTAL_CODES.has(String(cp ?? "").trim());
}

export function getPostalCodeZoneError(cp) {
  const code = String(cp ?? "").trim();
  if (code.length !== 4) return null;
  if (isAllowedDeliveryPostalCode(code)) return null;
  return `Livraison indisponible pour le code postal ${code}. Zone desservie : ${DELIVERY_ZONE_LABEL}.`;
}

export function getDistanceZoneError(distanceKm, maxKm = DEFAULT_MAX_DELIVERY_KM) {
  if (distanceKm == null || distanceKm <= maxKm) return null;
  return `Adresse trop éloignée (${distanceKm} km). Livraison limitée à ${maxKm} km (${DELIVERY_ZONE_LABEL}).`;
}

export async function validateDeliveryZone(address, form, maxKm = DEFAULT_MAX_DELIVERY_KM) {
  const postalError = getPostalCodeZoneError(form?.adresseCp);
  if (postalError) {
    return { ok: false, reason: "postal", message: postalError };
  }

  const estimate = await computeDeliveryEstimate(address);
  const distanceError = getDistanceZoneError(estimate.distanceKm, maxKm);
  if (distanceError) {
    return { ok: false, reason: "distance", message: distanceError, estimate };
  }

  return { ok: true, estimate };
}
