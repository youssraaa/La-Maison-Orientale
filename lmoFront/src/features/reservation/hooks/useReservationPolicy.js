import { useEffect, useState } from "react";
import { DEFAULT_POLICY, loadReservationPolicy } from "../utils/reservationPolicy";

export default function useReservationPolicy() {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadReservationPolicy()
      .then((data) => {
        if (!cancelled) setPolicy(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { policy, loading };
}
