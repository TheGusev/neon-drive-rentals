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
  const [leaving, setLeaving] = useState(false);
  const save = useServerFn(recordConsent);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    if (readCookieConsent()) return;
    const timer = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const decide = (analytics: boolean) => {
    saveCookieConsent(analytics);
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 260);
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
      className={`fixed bottom-4 left-3 z-[60] w-[min(21rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur transition-all duration-300 ease-out sm:left-4 ${
        leaving ? "-translate-x-6 opacity-0" : "translate-x-0 opacity-100 animate-in slide-in-from-left-8 fade-in"
      }`}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-start gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
          <Cookie className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">Мы используем cookie</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            Технические — для работы сайта, аналитические — для статистики.{" "}
            <Link to="/cookies" className="link-text">
              Подробнее
            </Link>
          </p>
          <div className="mt-2.5 flex gap-2">
            <Button size="sm" variant="accent" className="h-7 flex-1 px-2 text-[11px]" onClick={() => decide(true)}>
              Принять все
            </Button>
            <Button size="sm" variant="outline" className="h-7 flex-1 px-2 text-[11px]" onClick={() => decide(false)}>
              Только нужные
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
