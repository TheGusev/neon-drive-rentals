import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { METRIKA_COUNTER_ID as COUNTER_ID, reachGoal, trackingAllowed } from "@/lib/analytics";

/** Счётчик Яндекс.Метрики: подключается сразу на публичных страницах боевого домена. */
export function YandexMetrika() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!trackingAllowed(window.location.hostname, pathname)) return;

    if (window.nskMetrikaInitialized !== COUNTER_ID) {
      if (!window.ym) {
        const ym: NonNullable<Window["ym"]> = ((...args: unknown[]) => {
          (ym.a = ym.a || []).push(args);
        }) as NonNullable<Window["ym"]>;
        ym.l = Date.now();
        window.ym = ym;

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`;
        document.head.appendChild(script);
      }

      window.ym?.(COUNTER_ID, "init", {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        accurateTrackBounce: true,
        trackLinks: true,
        referrer: document.referrer,
        url: window.location.href,
      });
      window.nskMetrikaInitialized = COUNTER_ID;
      return;
    }

    // SPA-переходы Метрика сама не считает.
    window.ym?.(COUNTER_ID, "hit", window.location.href);
  }, [pathname, href]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (link?.getAttribute("href")?.toLowerCase().startsWith("tel:")) reachGoal("call");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

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
