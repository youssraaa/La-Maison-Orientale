const DEFAULT_POLICY = {
  maxOnlineCovers: 10,
  modificationDeadlineHours: 2,
  tableDurationMinutes: 90,
  tableDurationClientMinutes: 120,
  maxCoversPerSlot: 50,
};

let cachedPolicy = null;

export function formatDurationFr(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return "";
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  if (hours > 0 && mins === 0) {
    return hours === 1 ? "1 heure" : `${hours} heures`;
  }
  if (hours > 0 && mins > 0) {
    return `${hours} h ${mins} min`;
  }
  return `${value} minutes`;
}

export function formatDeadlineFr(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value) || value <= 0) return "";
  return value === 1 ? "1 heure" : `${value} heures`;
}

export async function fetchReservationPolicy() {
  const response = await fetch("/api/public/restaurant/reservation-policy");
  if (!response.ok) {
    throw new Error("Impossible de charger la politique de réservation.");
  }
  const data = await response.json();
  return { ...DEFAULT_POLICY, ...data };
}

export function getCachedReservationPolicy() {
  return cachedPolicy || DEFAULT_POLICY;
}

export async function loadReservationPolicy() {
  if (cachedPolicy) return cachedPolicy;
  try {
    cachedPolicy = await fetchReservationPolicy();
  } catch {
    cachedPolicy = DEFAULT_POLICY;
  }
  return cachedPolicy;
}

export { DEFAULT_POLICY };
