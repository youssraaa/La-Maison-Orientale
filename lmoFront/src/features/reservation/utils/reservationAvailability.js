/**
 * Règles de disponibilité réservation — basées sur les horaires du restaurant.
 * Soft capacity : somme des couverts EN_ATTENTE + CONFIRMEE par créneau.
 */

/** Lundi = 1 … Dimanche = 7 (ISO) */
export const CLOSED_WEEKDAYS = [1]; // lundi fermé

export const OPEN_TIME = "12:00";
/** Dernier créneau réservable (service jusqu'à 00:00) */
export const LAST_SLOT_TIME = "22:30";
export const SLOT_INTERVAL_MINUTES = 30;

/** Couverts max par créneau (aligné avec le backend). */
export const MAX_COVERS_PER_SLOT = 20;

/** Fenêtre de réservation (calendrier 2 mois). */
export const DATE_HORIZON_DAYS = 60;

export function parseTimeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function isoDateLocal(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function getIsoWeekday(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`);
  const js = d.getDay(); // 0 dimanche
  return js === 0 ? 7 : js;
}

export function isClosedDay(isoDate) {
  return CLOSED_WEEKDAYS.includes(getIsoWeekday(isoDate));
}

export function buildDateOptions(fromDate = new Date(), horizon = DATE_HORIZON_DAYS) {
  const options = [];
  const start = new Date(fromDate);
  start.setHours(12, 0, 0, 0);

  for (let i = 0; i < horizon; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = isoDateLocal(d);
    const closed = isClosedDay(iso);
    const chip = formatDayChip(d, i);
    options.push({
      iso,
      closed,
      weekday: chip.weekday,
      dayNum: chip.dayNum,
      labelFull: formatDayFull(d),
    });
  }
  return options;
}

function formatDayChip(date, offset) {
  if (offset === 0) {
    return { weekday: "Auj.", dayNum: String(date.getDate()) };
  }
  if (offset === 1) {
    return { weekday: "Demain", dayNum: String(date.getDate()) };
  }
  const day = date
    .toLocaleDateString("fr-BE", { weekday: "short" })
    .replace(".", "");
  const weekday = day.charAt(0).toUpperCase() + day.slice(1);
  return { weekday, dayNum: String(date.getDate()) };
}

function formatDayFull(date) {
  return date.toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildTimeSlots(isoDate, now = new Date()) {
  if (isClosedDay(isoDate)) return [];

  const start = parseTimeToMinutes(OPEN_TIME);
  const end = parseTimeToMinutes(LAST_SLOT_TIME);
  const today = isoDateLocal(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (let t = start; t <= end; t += SLOT_INTERVAL_MINUTES) {
    const time = minutesToTime(t);
    const past = isoDate === today && t <= nowMinutes + 30;
    slots.push({
      time,
      available: !past,
      label: past ? "Passé" : "Disponible",
    });
  }
  return slots;
}

export function isValidSlotTime(time) {
  const minutes = parseTimeToMinutes(time);
  const start = parseTimeToMinutes(OPEN_TIME);
  const end = parseTimeToMinutes(LAST_SLOT_TIME);
  if (minutes < start || minutes > end) return false;
  return (minutes - start) % SLOT_INTERVAL_MINUTES === 0;
}
