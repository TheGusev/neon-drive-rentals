import { useEffect, useState } from "react";

/**
 * Returns `true` only after the component has hydrated on the client.
 * Use it to gate content that depends on `Date.now()`, `window` or
 * `localStorage` so the server and the first client render stay identical.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
