const DASH_DAYS_KEY = "lmo_admin_dashboard_days";
const NOTIF_RESERVATIONS_KEY = "lmo_admin_notif_reservations";
const NOTIF_MESSAGES_KEY = "lmo_admin_notif_messages";
const COMPACT_NAV_KEY = "lmo_admin_compact_nav";

function avatarKey(userId) {
  return `lmo_admin_avatar_${userId || "anon"}`;
}

function getDashDays() {
  return localStorage.getItem(DASH_DAYS_KEY) === "30" ? 30 : 7;
}

function getAvatar(userId) {
  try {
    return localStorage.getItem(avatarKey(userId)) || "";
  } catch {
    return "";
  }
}

function setAvatar(userId, dataUrl) {
  if (!dataUrl) {
    localStorage.removeItem(avatarKey(userId));
    return;
  }
  localStorage.setItem(avatarKey(userId), dataUrl);
}

function getBoolPref(key, fallback = true) {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "1" || raw === "true";
}

function setBoolPref(key, value) {
  localStorage.setItem(key, value ? "1" : "0");
}

export {
  DASH_DAYS_KEY,
  NOTIF_RESERVATIONS_KEY,
  NOTIF_MESSAGES_KEY,
  COMPACT_NAV_KEY,
  avatarKey,
  getDashDays,
  getAvatar,
  setAvatar,
  getBoolPref,
  setBoolPref,
};
