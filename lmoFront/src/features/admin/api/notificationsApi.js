import api from "../../../common/api/httpClient";

const notificationsApi = {
  list(token) {
    return api.get("/api/admin/notifications", { token });
  },
  unreadCount(token) {
    return api.get("/api/admin/notifications/unread-count", { token });
  },
  markRead(token, id) {
    return api.patch(`/api/admin/notifications/${id}/read`, undefined, { token });
  },
  markAllRead(token) {
    return api.post("/api/admin/notifications/read-all", undefined, { token });
  },
};

export default notificationsApi;
