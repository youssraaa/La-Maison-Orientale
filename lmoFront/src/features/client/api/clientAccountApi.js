import api from "../../../common/api/httpClient";

export function fetchClientProfile(token) {
  return api.get("/api/client/me", { token });
}

export function updateClientProfile(token, payload) {
  return api.put("/api/client/me", payload, { token });
}

export function changeClientPassword(token, payload) {
  return api.put("/api/client/me/password", payload, { token });
}

export function fetchClientReservations(token) {
  return api.get("/api/client/reservations", { token });
}

export function fetchClientCommandes(token) {
  return api.get("/api/client/commandes", { token });
}

export function fetchClientMessages(token) {
  return api.get("/api/client/messages", { token });
}

export function fetchClientNotifications(token) {
  return api.get("/api/client/notifications", { token });
}

export function fetchClientUnreadNotificationCount(token) {
  return api.get("/api/client/notifications/unread-count", { token });
}

export function markClientNotificationRead(token, id) {
  return api.patch(`/api/client/notifications/${id}/read`, undefined, { token });
}

export function markAllClientNotificationsRead(token) {
  return api.post("/api/client/notifications/read-all", undefined, { token });
}
