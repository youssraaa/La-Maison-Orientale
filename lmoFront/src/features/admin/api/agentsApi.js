import api from "../../../common/api/httpClient";

const agentsApi = {
  list(token) {
    return api.get("/api/admin/agents", { token });
  },
  create(token, body) {
    return api.post("/api/admin/agents", body, { token });
  },
  update(token, id, body) {
    return api.put(`/api/admin/agents/${id}`, body, { token });
  },
  remove(token, id) {
    return api.delete(`/api/admin/agents/${id}`, { token });
  },
  resendInvite(token, id) {
    return api.post(`/api/admin/agents/${id}/resend-invite`, undefined, { token });
  },
  resetPassword(token, id) {
    return api.post(`/api/admin/agents/${id}/reset-password`, undefined, { token });
  },
};

export default agentsApi;
