import { useCallback, useEffect, useState } from "react";
import api from "../api/httpClient";
import { restaurantInfo as fallbackInfo } from "../data/restaurantInfo";

let cachedInfo = null;
let cachedHours = null;

function mapApiToLegacy(data, hoursData) {
  if (!data) return fallbackInfo;
  const schedule =
    hoursData?.schedule?.length > 0
      ? hoursData.schedule.map((row) => ({ day: row.day, time: row.time }))
      : fallbackInfo.hours.schedule;
  const summary = hoursData?.summary || fallbackInfo.hours.summary;

  return {
    ...fallbackInfo,
    name: data.name || fallbackInfo.name,
    tagline: data.tagline || fallbackInfo.tagline,
    cuisine: data.cuisine || fallbackInfo.cuisine,
    services: Array.isArray(data.services) && data.services.length ? data.services : fallbackInfo.services,
    address: {
      ...fallbackInfo.address,
      street: data.addressStreet || fallbackInfo.address.street,
      city: data.addressCity || fallbackInfo.address.city,
      full: data.addressFull || fallbackInfo.address.full,
    },
    phone: {
      display: data.phoneDisplay || fallbackInfo.phone.display,
      href: data.phoneHref || fallbackInfo.phone.href,
    },
    email: {
      display: data.emailDisplay || fallbackInfo.email.display,
      href: data.emailHref || fallbackInfo.email.href,
    },
    hours: { schedule, summary },
    googleRating: {
      score: data.googleRatingScore || fallbackInfo.googleRating.score,
      countLabel: data.googleRatingCount || fallbackInfo.googleRating.countLabel,
    },
    googleReviewsUrl: data.googleReviewsUrl || fallbackInfo.googleReviewsUrl,
    socials: [
      data.instagramUrl
        ? { id: "instagram", label: "Instagram", href: data.instagramUrl }
        : fallbackInfo.socials.find((s) => s.id === "instagram"),
      data.tiktokUrl
        ? { id: "tiktok", label: "TikTok", href: data.tiktokUrl }
        : fallbackInfo.socials.find((s) => s.id === "tiktok"),
    ].filter(Boolean),
  };
}

export function useRestaurantInfo() {
  const [info, setInfo] = useState(cachedInfo || fallbackInfo);
  const [loading, setLoading] = useState(!cachedInfo);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [data, hoursData] = await Promise.all([
          api.get("/api/public/restaurant/info"),
          api.get("/api/public/restaurant/hours").catch(() => null),
        ]);
        const mapped = mapApiToLegacy(data, hoursData);
        cachedInfo = mapped;
        cachedHours = hoursData;
        if (!cancelled) setInfo(mapped);
      } catch {
        if (!cancelled) setInfo(fallbackInfo);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { info, loading };
}

export default useRestaurantInfo;
