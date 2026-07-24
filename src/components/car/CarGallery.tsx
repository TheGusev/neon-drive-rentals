import { useState } from "react";
import heroCar from "@/assets/hero-car.jpg";
import { cn } from "@/lib/utils";

export function CarGallery({ alt }: { alt: string }) {
  // Same image reused as placeholder — replace with per-car assets later.
  const images = [heroCar, heroCar, heroCar, heroCar];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted md:neon-glow">
        <img src={images[active]} alt={alt} className="h-full w-full object-cover" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "aspect-[4/3] overflow-hidden rounded-lg border transition",
              i === active ? "border-accent ring-2 ring-accent/40" : "border-border opacity-70 hover:opacity-100",
            )}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
