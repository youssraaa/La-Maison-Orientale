import api from "./httpClient";

const authApi = {
  async signIn(email, password) {
    const data = await api.post("/api/auth/signin", { email, password });
    return data;
  },

  async getMe(token) {
    return api.get("/api/admin/me", { token });
  },
};

export default authApi;
