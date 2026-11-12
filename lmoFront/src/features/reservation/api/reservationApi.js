const RESERVATION_ENDPOINT = "/api/public/reservations";

const ERROR_MESSAGES = {
  network:
    "Impossible de joindre le serveur. Vérifiez votre connexion ou réessayez plus tard.",
  server: "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
  unknown: "Une erreur est survenue lors de l'envoi.",
};

async function parseError(response) {
  const data = await response.json().catch(() => ({}));
  const error = new Error(
    data.message ||
      (response.status >= 500 ? ERROR_MESSAGES.server : ERROR_MESSAGES.unknown)
  );
  error.status = response.status;
  error.fieldErrors = data.fieldErrors || {};
  error.code =
    response.status === 400
      ? "VALIDATION"
      : response.status >= 500
        ? "SERVER"
        : "UNKNOWN";
  return error;
}

export async function fetchAvailability(date, nbPersonnes = 2) {
  let response;
  try {
    const params = new URLSearchParams({
      date,
      nbPersonnes: String(nbPersonnes),
    });
    response = await fetch(`${RESERVATION_ENDPOINT}/availability?${params}`);
  } catch {
    const error = new Error(ERROR_MESSAGES.network);
    error.code = "NETWORK";
    throw error;
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json();
}

export async function submitReservation(payload, token) {
  let response;
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    response = await fetch(RESERVATION_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    const error = new Error(ERROR_MESSAGES.network);
    error.code = "NETWORK";
    throw error;
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json();
}
