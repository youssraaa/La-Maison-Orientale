import { restaurantInfo } from "../../../common/data/restaurantInfo";

const RESTAURANT = {
  lat: restaurantInfo.map.lat,
  lng: restaurantInfo.map.lng,
  label: restaurantInfo.address.full,
};

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateDeliveryWindow(distanceKm) {
  const travelMin = Math.round((distanceKm / 22) * 60);
  const prepMin = 12;
  const min = Math.max(prepMin + travelMin, 18);
  const max = min + 15;
  return { min, max, travelMin, prepMin };
}

export async function geocodeDeliveryAddress(address) {
  const query = String(address || "").trim();
  if (!query) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${query}, Belgique`)}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: { "Accept-Language": "fr" },
  });
  if (!response.ok) return null;

  const results = await response.json();
  if (!results?.length) return null;

  return {
    lat: Number.parseFloat(results[0].lat),
    lng: Number.parseFloat(results[0].lon),
    label: results[0].display_name,
  };
}

export async function computeDeliveryEstimate(deliveryAddress) {
  const destination = await geocodeDeliveryAddress(deliveryAddress);
  if (!destination) {
    return {
      destination: null,
      distanceKm: null,
      window: { min: 25, max: 40, travelMin: null, prepMin: 12 },
      mapQuery: deliveryAddress,
    };
  }

  const distanceKm = haversineKm(
    RESTAURANT.lat,
    RESTAURANT.lng,
    destination.lat,
    destination.lng
  );
  const window = estimateDeliveryWindow(distanceKm);

  return {
    destination,
    distanceKm: Math.round(distanceKm * 10) / 10,
    window,
    mapQuery: deliveryAddress,
    restaurant: RESTAURANT,
  };
}

export function buildDirectionsEmbed(deliveryAddress) {
  const dest = encodeURIComponent(deliveryAddress);
  const origin = encodeURIComponent(RESTAURANT.label);
  return `https://www.google.com/maps/embed/v1/directions?key=&origin=${origin}&destination=${dest}&mode=driving`;
}

export function buildRestaurantMapEmbed() {
  return restaurantInfo.map.googleEmbed;
}

/** Embed sans clé API — itinéraire approximatif via recherche. */
export function buildRouteMapEmbed(deliveryAddress) {
  const q = encodeURIComponent(`${RESTAURANT.label} to ${deliveryAddress}`);
  return `https://www.google.com/maps?q=${q}&z=12&output=embed`;
}
