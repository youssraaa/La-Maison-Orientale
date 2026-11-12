import api from "../../../common/api/httpClient";

const staffOpsApi = {
  listReservations(token, { statut, date } = {}) {
    const params = new URLSearchParams();
    if (statut) params.set("statut", statut);
    if (date) params.set("date", date);
    const q = params.toString() ? `?${params.toString()}` : "";
    return api.get(`/api/admin/reservations${q}`, { token });
  },
  updateReservationStatut(token, id, statut) {
    return api.put(`/api/admin/reservations/${id}/statut`, { statut }, { token });
  },
  listMessages(token, statut) {
    const q = statut ? `?statut=${encodeURIComponent(statut)}` : "";
    return api.get(`/api/admin/messages${q}`, { token });
  },
  updateMessageStatut(token, id, statut) {
    return api.put(`/api/admin/messages/${id}/statut`, { statut }, { token });
  },
  replyMessage(token, id, reponse) {
    return api.post(`/api/admin/messages/${id}/reply`, { reponse }, { token });
  },
  listClients(token) {
    return api.get("/api/admin/clients", { token });
  },
  getClientDetail(token, { email, telephone, nom }) {
    const params = new URLSearchParams();
    if (email) params.set("email", email);
    if (telephone) params.set("telephone", telephone);
    if (nom) params.set("nom", nom);
    return api.get(`/api/admin/clients/detail?${params.toString()}`, { token });
  },
  addMessageNote(token, id, note) {
    return api.post(`/api/admin/messages/${id}/note`, { note }, { token });
  },
  async uploadImage(token, file) {
    const formData = new FormData();
    formData.append("file", file);
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch("/api/admin/upload/image", {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.message || "Upload impossible.");
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  listCategories(token) {
    return api.get("/api/admin/menu/categories", { token });
  },
  createCategory(token, body) {
    return api.post("/api/admin/menu/categories", body, { token });
  },
  updateCategory(token, id, body) {
    return api.put(`/api/admin/menu/categories/${id}`, body, { token });
  },
  deleteCategory(token, id) {
    return api.delete(`/api/admin/menu/categories/${id}`, { token });
  },
  listPlats(token, categorieId) {
    const q = categorieId != null ? `?categorieId=${categorieId}` : "";
    return api.get(`/api/admin/menu/plats${q}`, { token });
  },
  createPlat(token, body) {
    return api.post("/api/admin/menu/plats", body, { token });
  },
  updatePlat(token, id, body) {
    return api.put(`/api/admin/menu/plats/${id}`, body, { token });
  },
  deletePlat(token, id) {
    return api.delete(`/api/admin/menu/plats/${id}`, { token });
  },

  listCommandes(token, { date } = {}) {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    const q = params.toString() ? `?${params.toString()}` : "";
    return api.get(`/api/admin/commandes${q}`, { token });
  },
  updateCommandeStatut(token, id, statut) {
    return api.patch(`/api/admin/commandes/${id}/statut`, { statut }, { token });
  },
  getCommande(token, id) {
    return api.get(`/api/admin/commandes/${id}`, { token });
  },

  listGalerie(token) {
    return api.get("/api/admin/galerie", { token });
  },
  createGaleriePhoto(token, body) {
    return api.post("/api/admin/galerie", body, { token });
  },
  updateGaleriePhoto(token, id, body) {
    return api.put(`/api/admin/galerie/${id}`, body, { token });
  },
  deleteGaleriePhoto(token, id) {
    return api.delete(`/api/admin/galerie/${id}`, { token });
  },
};

export default staffOpsApi;
