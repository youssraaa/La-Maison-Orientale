import api from "../../../common/api/httpClient";

const horairesApi = {
  listHoraires(token) {
    return api.get("/api/admin/horaires", { token });
  },
  upsertHoraire(token, body) {
    return api.put("/api/admin/horaires", body, { token });
  },
  listFermetures(token) {
    return api.get("/api/admin/fermetures", { token });
  },
  createFermeture(token, body) {
    return api.post("/api/admin/fermetures", body, { token });
  },
  deleteFermeture(token, id) {
    return api.delete(`/api/admin/fermetures/${id}`, { token });
  },
  getSettings(token) {
    return api.get("/api/admin/restaurant/settings", { token });
  },
  updateSettings(token, body) {
    return api.put("/api/admin/restaurant/settings", body, { token });
  },
  getInfo(token) {
    return api.get("/api/admin/restaurant/info", { token });
  },
  updateInfo(token, body) {
    return api.put("/api/admin/restaurant/info", body, { token });
  },
};

export default horairesApi;
