const ERROR_MESSAGES = {
  network:
    "Impossible de joindre le serveur. Vérifiez votre connexion ou réessayez plus tard.",
  unauthorized: "E-mail ou mot de passe incorrect.",
  server: "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
  unknown: "Une erreur est survenue.",
};

async function parseError(response) {
  const data = await response.json().catch(() => ({}));
  const message =
    data.message ||
    (response.status === 401
      ? ERROR_MESSAGES.unauthorized
      : response.status >= 500
        ? ERROR_MESSAGES.server
        : ERROR_MESSAGES.unknown);
  const error = new Error(message);
  error.status = response.status;
  error.fieldErrors = data.fieldErrors || {};
  return error;
}

async function request(method, path, { body, token } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const error = new Error(ERROR_MESSAGES.network);
    error.code = "NETWORK";
    throw error;
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

const api = {
  get: (path, options) => request("GET", path, options),
  post: (path, body, options) => request("POST", path, { ...options, body }),
  put: (path, body, options) => request("PUT", path, { ...options, body }),
  patch: (path, body, options) => request("PATCH", path, { ...options, body }),
  delete: (path, options) => request("DELETE", path, options),
};

export default api;
