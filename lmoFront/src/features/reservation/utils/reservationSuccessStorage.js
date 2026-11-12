const STORAGE_KEY = "lmo_reservation_success";

export function saveReservationSuccess(payload) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota errors */
  }
}

export function loadReservationSuccess() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearReservationSuccess() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function patchReservationSuccess(patch) {
  const current = loadReservationSuccess();
  if (!current) return;
  const next = { ...current, ...patch };
  if (patch.form && current.form) {
    next.form = { ...current.form, ...patch.form };
  }
  saveReservationSuccess(next);
}
