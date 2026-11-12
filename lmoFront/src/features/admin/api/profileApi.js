import api from "../../../common/api/httpClient";

const profileApi = {
  get(token) {
    return api.get("/api/admin/me", { token });
  },
  update(token, body) {
    return api.put("/api/admin/me", body, { token });
  },
  changePassword(token, body) {
    return api.put("/api/admin/me/password", body, { token });
  },
};

export default profileApi;
