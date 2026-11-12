import api from "../../../common/api/httpClient";

export async function fetchPublicMenu() {
  const data = await api.get("/api/public/menu");
  return Array.isArray(data?.categories) ? data.categories : [];
}

export async function fetchPublicGalerie(accueil = false) {
  const q = accueil ? "?accueil=true" : "";
  const data = await api.get(`/api/public/galerie${q}`);
  return Array.isArray(data) ? data : [];
}
