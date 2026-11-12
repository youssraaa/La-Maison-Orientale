const BASE = "/api/public/reservations/manage";

async function parseError(response) {
  const data = await response.json().catch(() => ({}));
  const error = new Error(data.message || "Une erreur est survenue.");
  error.status = response.status;
  error.fieldErrors = data.fieldErrors || {};
  throw error;
}

export async function fetchReservationByToken(token) {
  const response = await fetch(`${BASE}/${encodeURIComponent(token)}`);
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
}

export async function fetchManageAvailability(token, date, nbPersonnes = 2) {
  const params = new URLSearchParams({
    date,
    nbPersonnes: String(nbPersonnes),
  });
  const response = await fetch(
    `${BASE}/${encodeURIComponent(token)}/availability?${params}`
  );
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
}

export async function modifyReservation(token, payload) {
  const response = await fetch(`${BASE}/${encodeURIComponent(token)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
}

export async function cancelReservation(token) {
  const response = await fetch(`${BASE}/${encodeURIComponent(token)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
}
