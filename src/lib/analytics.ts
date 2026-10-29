export const METRIKA_COUNTER_ID = 112667049;

export type MetrikaGoal = "call" | "booking" | "login";
type Ym = ((id: number, action: string, ...args: unknown[]) => void) & {
  a?: unknown[];
  l?: number;
};

declare global {
  interface Window {
    ym?: Ym;
    nskMetrikaInitialized?: number;
  }
}

export function trackingAllowed(hostname: string, pathname: string): boolean {
  return (
    !pathname.startsWith("/admin") && (hostname === "nsk-rent.ru" || hostname === "www.nsk-rent.ru")
  );
}

/** No contact details, document data or booking contents are sent to analytics. */
export function reachGoal(goal: MetrikaGoal): void {
  if (typeof window === "undefined") return;
  if (!trackingAllowed(window.location.hostname, window.location.pathname)) return;
  try {
    window.ym?.(METRIKA_COUNTER_ID, "reachGoal", goal);
  } catch {
    // A blocked analytics script must never interrupt booking or authentication.
  }
}
