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
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-background/90 via-background/55 to-transparent" />

      {/* Headlight sweep beams */}
      <div className="headlight-beam pointer-events-none absolute -top-1/4 left-[-40%] h-[150%] w-[45%] rotate-12" />
      <div
        className="headlight-beam pointer-events-none absolute -top-1/4 left-[-40%] h-[150%] w-[35%] rotate-12"
        style={{ animationDelay: "-4s", opacity: 0.6 }}
      />

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
