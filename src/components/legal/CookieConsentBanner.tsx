import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COOKIE_CONSENT_VERSION, readCookieConsent, saveCookieConsent } from "@/lib/cookieConsent";
import { recordConsent } from "@/lib/consent.functions";

/** Баннер согласия на cookie: без него аналитика не подключается. */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const save = useServerFn(recordConsent);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    if (readCookieConsent()) return;
    const timer = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const decide = (analytics: boolean) => {
    saveCookieConsent(analytics);
    setVisible(false);
    void save({
      data: {
        kind: "cookie",
        docVersion: COOKIE_CONSENT_VERSION,
        page: window.location.pathname,
        payload: { analytics, necessary: true },
      },
    }).catch(() => undefined);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Согласие на использование cookie"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur md:inset-x-6 md:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <Cookie className="h-4 w-4" />
        </span>
        <div className="min-w-0 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Мы используем cookie</p>
          <p className="mt-1 leading-snug">
            Технические cookie нужны для работы сайта, аналитические — для статистики посещений.
            Подробности — в{" "}
            <Link to="/cookies" className="link-text">
              политике cookie
            </Link>{" "}
            и{" "}
            <Link to="/privacy" className="link-text">
              политике конфиденциальности
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => decide(false)} className="sm:w-auto">
          Только необходимые
        </Button>
        <Button variant="accent" onClick={() => decide(true)} className="sm:w-auto">
          Принять все
        </Button>
      </div>
    </div>
  );
}
