const BASE = "/api/public/commandes";

async function parseError(response) {
  const data = await response.json().catch(() => ({}));
  const error = new Error(data.message || "Une erreur est survenue.");
  error.status = response.status;
  error.fieldErrors = data.fieldErrors || {};
  throw error;
}

export async function submitCommande(payload, token) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
}

export async function fetchCommandeByToken(token) {
  const response = await fetch(`${BASE}/manage/${encodeURIComponent(token)}`);
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
}

export async function cancelCommande(token) {
  const response = await fetch(`${BASE}/manage/${encodeURIComponent(token)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    await parseError(response);
  }
  return response.json();
}
