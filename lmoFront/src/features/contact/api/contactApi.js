const CONTACT_ENDPOINT = "/api/public/contact";

const ERROR_MESSAGES = {
  network:
    "Impossible de joindre le serveur. Vérifiez votre connexion ou réessayez plus tard.",
  server: "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
  unknown: "Une erreur est survenue lors de l'envoi.",
};

export async function submitContactForm(payload) {
  let response;

  try {
    response = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    const error = new Error(ERROR_MESSAGES.network);
    error.code = "NETWORK";
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || (response.status >= 500 ? ERROR_MESSAGES.server : ERROR_MESSAGES.unknown)
    );
    error.status = response.status;
    error.fieldErrors = data.fieldErrors || {};
    error.code =
      response.status === 400
        ? "VALIDATION"
        : response.status === 503
          ? "MAIL"
          : response.status >= 500
            ? "SERVER"
            : "UNKNOWN";
    throw error;
  }

  return data;
}
