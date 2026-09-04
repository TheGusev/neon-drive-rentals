import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Кадры берём из /public в WebP (в 3 раза легче JPG) — критично для мобильного
 * интернета: первый кадр ~44 КБ вместо ~140 КБ.
 */
const frames = [
  "/assets/cars/hero-drive.webp",
  "/assets/cars/hero-tunnel.webp",
  "/assets/cars/hero-garage.webp",
];

/**
 * Hero photo backdrop.
 * - `variant="mobile"` keeps the photo in the top band of the screen and fades
 *   it into the page background, so the shot is actually visible instead of
 *   being stretched (and washed out) behind the whole scrollable page.
 */
export function HeroBackdrop({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [idx, setIdx] = useState(0);
  // Второй и третий кадр подключаем только после первой отрисовки —
  // они не нужны для LCP и не должны конкурировать за канал на 4G.
  const [framesReady, setFramesReady] = useState(1);
  const reduced = useReducedMotion();
  const mobile = variant === "mobile";

  useEffect(() => {
    const id = window.setTimeout(() => setFramesReady(frames.length), 2500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (reduced || framesReady < frames.length) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % frames.length), 7000);
    return () => clearInterval(id);
  }, [reduced, framesReady]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 overflow-hidden",
        mobile ? "h-[64svh]" : "h-[92svh]",
      )}
      aria-hidden
    >
      {/* Placeholder while the first frame decodes — tinted, never white */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/70 to-background" />

      {frames.slice(0, framesReady).map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "low"}
          decoding="async"
          className={cn(
            "hero-photo absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms]",
            !reduced && "ken-burns",
          )}
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}


      {/* Light-theme softener: keeps the photo readable under light surfaces */}
      <div className="hero-light-scrim absolute inset-0" />

      {mobile ? (
        <>
          {/* Vertical readability mask: photo stays visible in the mid band,
              scrims sit exactly where the copy and the CTAs are. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--background) 72%, transparent) 0%, color-mix(in oklab, var(--background) 30%, transparent) 34%, color-mix(in oklab, var(--background) 62%, transparent) 66%, var(--background) 100%)",
            }}
          />
        </>
      ) : (
        <div className="absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-background/85 via-background/50 to-transparent" />
      )}

      {/*
        Localized headlight scan — clipped to the text region.
        Re-mounted on every frame change so the beam runs exactly once per swap.
      */}
      {!reduced && (
        <div
          key={idx}
          className={cn(
            "absolute overflow-hidden",
            mobile ? "inset-x-0 top-[8%] h-[40%]" : "left-0 top-[14%] h-[46%] w-[58%]",
          )}
        >
          <span className="headlight-scan absolute inset-y-0 -left-1/3 w-1/3" />
        </div>
      )}

      {/* Neon streamers */}
      <div className="absolute inset-0">
        {[
          { top: "18%", dur: "6s", delay: "0s", color: "var(--neon-blue)" },
          { top: "42%", dur: "9s", delay: "2s", color: "var(--neon-orange)" },
          { top: "68%", dur: "7s", delay: "1s", color: "var(--neon-blue)" },
          { top: "88%", dur: "11s", delay: "3s", color: "var(--neon-orange)" },
        ].map((s, i) => (
          <span
            key={i}
            className="stream-line absolute left-0 h-px w-[35vw]"
            style={{
              top: s.top,
              background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
              boxShadow: `0 0 12px ${s.color}, 0 0 24px ${s.color}`,
              animationDuration: s.dur,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
