import api from "../../../common/api/httpClient";

const adminApi = {
  getDashboard(token, days = 7) {
    return api.get(`/api/admin/dashboard?days=${days}`, { token });
  },
};

export default adminApi;
