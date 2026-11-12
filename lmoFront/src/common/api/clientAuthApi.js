import api from "./httpClient";

const clientAuthApi = {
  signUp(payload) {
    return api.post("/api/auth/client/signup", payload);
  },

  signIn(email, password) {
    return api.post("/api/auth/client/signin", { email, password });
  },
};

export default clientAuthApi;
