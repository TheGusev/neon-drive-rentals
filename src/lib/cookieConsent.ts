/** Хранение решения по cookie на клиенте. Версия меняется при обновлении политики. */
export const COOKIE_CONSENT_VERSION = "1.0";
const KEY = "nsk-cookie-consent";

export type CookieConsent = {
  version: string;
  analytics: boolean;
  date: string;
};

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCookieConsent(analytics: boolean): CookieConsent {
  const value: CookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    analytics,
    date: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      /* приватный режим — решение действует только на сессию */
    }
    window.dispatchEvent(new CustomEvent("nsk-cookie-consent", { detail: value }));
  }
  return value;
}
