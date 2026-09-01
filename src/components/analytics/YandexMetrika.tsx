import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const COUNTER_ID = 112132850;

type Ym = ((id: number, action: string, ...args: unknown[]) => void) & { a?: unknown[]; l?: number };

declare global {
  interface Window {
    ym?: Ym;
  }
}

function trackingAllowed(hostname: string, pathname: string): boolean {
  if (pathname.startsWith("/admin")) return false;
  return hostname === "nsk-rent.ru" || hostname === "www.nsk-rent.ru";
}

/** Счётчик Яндекс.Метрики: только публичные страницы боевого домена. */
export function YandexMetrika() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!trackingAllowed(window.location.hostname, pathname)) return;

    if (!window.ym) {
      const ym: Ym = ((...args: unknown[]) => {
        (ym.a = ym.a || []).push(args);
      }) as Ym;
      ym.l = Date.now();
      window.ym = ym;

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://mc.yandex.ru/metrika/tag.js";
      document.head.appendChild(script);

      window.ym(COUNTER_ID, "init", {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        accurateTrackBounce: true,
        trackLinks: true,
      });
      return;
    }

    // SPA-переходы Метрика сама не считает.
    window.ym(COUNTER_ID, "hit", window.location.href);
  }, [pathname, href]);

  return (
    <noscript>
      <div>
        <img
          src={`https://mc.yandex.ru/watch/${COUNTER_ID}`}
          style={{ position: "absolute", left: "-9999px" }}
          alt=""
        />
      </div>
    </noscript>
  );
}
