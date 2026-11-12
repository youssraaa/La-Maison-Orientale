const DEFAULT_ORDER_POLICY = {
  fraisLivraison: 2.5,
  montantMinimumLivraison: 25,
};

let cachedOrderPolicy = null;

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function normalizeOrderPolicy(policy = DEFAULT_ORDER_POLICY) {
  return {
    fraisLivraison: roundMoney(policy.fraisLivraison ?? DEFAULT_ORDER_POLICY.fraisLivraison),
    montantMinimumLivraison: roundMoney(
      policy.montantMinimumLivraison ?? DEFAULT_ORDER_POLICY.montantMinimumLivraison
    ),
  };
}

export function invalidateOrderPolicyCache() {
  cachedOrderPolicy = null;
}

export async function fetchOrderPolicy() {
  const response = await fetch("/api/public/restaurant/order-policy");
  if (!response.ok) {
    throw new Error("Impossible de charger les frais de commande.");
  }
  const data = await response.json();
  return normalizeOrderPolicy({
    fraisLivraison: data.fraisLivraison,
    montantMinimumLivraison: data.montantMinimumLivraison,
  });
}

export async function loadOrderPolicy({ force = false } = {}) {
  if (!force && cachedOrderPolicy) return cachedOrderPolicy;
  try {
    cachedOrderPolicy = await fetchOrderPolicy();
  } catch {
    cachedOrderPolicy = normalizeOrderPolicy(DEFAULT_ORDER_POLICY);
  }
  return cachedOrderPolicy;
}

export function computeOrderTotals(subtotal, mode, fraisLivraison = 0) {
  const itemsTotal = Number(subtotal) || 0;
  const fee =
    mode === "LIVRAISON" && Number(fraisLivraison) > 0 ? Number(fraisLivraison) : 0;
  return {
    subtotal: itemsTotal,
    deliveryFee: fee,
    total: itemsTotal + fee,
  };
}

export function getMinimumOrderRemaining(subtotal, mode, policy = DEFAULT_ORDER_POLICY) {
  if (mode !== "LIVRAISON") return null;
  const normalized = normalizeOrderPolicy(policy);
  const min = normalized.montantMinimumLivraison;
  if (!min) return null;
  const itemsTotal = roundMoney(subtotal);
  if (itemsTotal >= min) return null;
  return roundMoney(min - itemsTotal);
}

export function getMinimumOrderMessage(subtotal, mode, policy = DEFAULT_ORDER_POLICY) {
  const banner = getMinimumOrderBanner(subtotal, mode, policy);
  if (!banner) return null;
  const formattedMin = new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(banner.minimum);
  const formattedRemaining = new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(banner.remaining);
  return `Minimum livraison ${formattedMin} de plats (hors frais) · il vous manque ${formattedRemaining}.`;
}

export function getMinimumOrderBanner(subtotal, mode, policy = DEFAULT_ORDER_POLICY) {
  const remaining = getMinimumOrderRemaining(subtotal, mode, policy);
  if (remaining == null) return null;
  const normalized = normalizeOrderPolicy(policy);
  return {
    minimum: normalized.montantMinimumLivraison,
    remaining,
    subtotal: roundMoney(subtotal),
  };
}

export { DEFAULT_ORDER_POLICY };
