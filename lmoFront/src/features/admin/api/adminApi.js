import api from "../../../common/api/httpClient";

const adminApi = {
  getDashboard(token) {
    return api.get("/api/admin/dashboard", { token });
  },
};

export default adminApi;
