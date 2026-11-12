import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchClientCommandes,
  fetchClientMessages,
  fetchClientNotifications,
  fetchClientProfile,
  fetchClientReservations,
} from "../api/clientAccountApi";

export function useClientAccountData(token) {
  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    isInitialLoad.current = true;
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    const showLoading = isInitialLoad.current;
    if (showLoading) {
      setLoading(true);
      isInitialLoad.current = false;
    }
    setError("");

    Promise.all([
      fetchClientProfile(token),
      fetchClientReservations(token),
      fetchClientCommandes(token),
      fetchClientMessages(token),
      fetchClientNotifications(token),
    ])
      .then(([p, r, c, m, n]) => {
        if (cancelled) return;
        setProfile(p);
        setReservations(Array.isArray(r) ? r : []);
        setCommandes(Array.isArray(c) ? c : []);
        setMessages(Array.isArray(m) ? m : []);
        setNotifications(Array.isArray(n) ? n : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Impossible de charger votre compte.");
      })
      .finally(() => {
        if (!cancelled && showLoading) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, refreshKey]);

  return { profile, reservations, commandes, messages, notifications, error, loading, refresh };
}

export function isUpcomingReservation(reservation) {
  if (!reservation?.date) return false;
  const statut = String(reservation.statut || "").toUpperCase();
  if (statut === "ANNULEE" || statut === "ANNULE") return false;
  const time = String(reservation.heure || "00:00").slice(0, 5);
  const when = new Date(`${reservation.date}T${time}:00`);
  return when.getTime() >= Date.now();
}

export function formatReservationDate(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("fr-BE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatStatut(statut) {
  const key = String(statut || "").toUpperCase();
  const map = {
    CONFIRMEE: "Confirmée",
    CONFIRME: "Confirmée",
    EN_ATTENTE: "En attente",
    ANNULEE: "Annulée",
    ANNULE: "Annulée",
    PREPAREE: "En préparation",
    PRETE: "Prête",
    REMIS: "Remise",
    LIVREE: "Livrée",
    RETIREE: "Retirée",
  };
  return map[key] || statut || "—";
}

export function formatMode(mode) {
  if (mode === "LIVRAISON") return "Livraison";
  if (mode === "EMPORTER") return "Emporter";
  return mode || "—";
}

export function formatMemberSince(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const label = d.toLocaleDateString("fr-BE", { month: "long", year: "numeric" });
  return `Client depuis ${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export function formatShortDate(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function clientInitials(prenom, nom) {
  const p = (prenom || "").trim();
  const n = (nom || "").trim();
  if (p && n) return `${p.charAt(0)}${n.charAt(0)}`.toUpperCase();
  const full = [p, n].filter(Boolean).join(" ");
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function splitFullName(nom, prenom) {
  if (prenom) return { prenom, nom: nom || "" };
  const parts = (nom || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { prenom: "", nom: "" };
  if (parts.length === 1) return { prenom: parts[0], nom: "" };
  return { prenom: parts[0], nom: parts.slice(1).join(" ") };
}
