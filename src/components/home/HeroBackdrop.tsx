import { useEffect, useState } from "react";
import heroDrive from "@/assets/cars/hero-drive.jpg";
import heroTunnel from "@/assets/cars/hero-tunnel.jpg";
import heroGarage from "@/assets/cars/hero-garage.jpg";

const frames = [heroDrive, heroTunnel, heroGarage];

export function HeroBackdrop() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % frames.length), 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {frames.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className="ken-burns absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms]"
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}

      {/* Left-side readability gradient — keeps text always legible */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-background/85 via-background/50 to-transparent" />

      {/*
        Localized headlight scan — clipped to the text region on the left.
        Re-mounted on every frame change so the beam runs exactly once per swap,
        crossing only the logo + H1 area. Text opacity stays 100%.
      */}
      <div
        key={idx}
        aria-hidden
        className="pointer-events-none absolute left-0 top-[14%] h-[46%] w-[58%] overflow-hidden"
      >
        <span className="headlight-scan absolute inset-y-0 -left-1/3 w-1/3" />
      </div>

      {/* Neon streamers */}
      <div className="pointer-events-none absolute inset-0">
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
