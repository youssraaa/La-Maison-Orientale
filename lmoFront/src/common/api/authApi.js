import api from "./httpClient";

const authApi = {
  async signIn(email, password) {
    return api.post("/api/auth/login", { email, password });
  },

  async getMe(token) {
    return api.get("/api/admin/me", { token });
  },

  async previewInvite(token) {
    return api.get(`/api/auth/invite/${encodeURIComponent(token)}`);
  },

  async acceptInvite(token, password) {
    return api.post("/api/auth/accept-invite", { token, password });
  },

  async previewReset(token) {
    return api.get(`/api/auth/reset/${encodeURIComponent(token)}`);
  },

  async acceptReset(token, password) {
    return api.post("/api/auth/accept-reset", { token, password });
  },
};

export default authApi;
