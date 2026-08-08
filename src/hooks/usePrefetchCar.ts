import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";

import type { Car } from "@/types/domain";

/** Cars already warmed in this session (route + hero image). */
const warmed = new Set<string>();

/**
 * Warms the `/cars/$carId` route (loader + code chunk) and the car's hero
 * image so both the detail page and the quick-view modal open instantly.
 * Debounced so sweeping the cursor across the carousel doesn't fetch everything.
 */
export function usePrefetchCar(delay = 80) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const prefetch = useCallback(
    (car: Car, immediate = false) => {
      if (warmed.has(car.id)) return;

      const run = () => {
        if (warmed.has(car.id)) return;
        warmed.add(car.id);
        void router.preloadRoute({ to: "/cars/$carId", params: { carId: car.id } }).catch(() => {
          warmed.delete(car.id);
        });
        if (typeof window !== "undefined" && car.image) {
          const img = new Image();
          img.decoding = "async";
          img.src = car.image;
        }
      };

      cancel();
      if (immediate || delay <= 0) run();
      else timer.current = setTimeout(run, delay);
    },
    [cancel, delay, router],
  );

  return { prefetch, cancel };
}
