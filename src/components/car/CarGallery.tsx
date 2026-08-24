import { useState } from "react";
import heroCar from "@/assets/hero-car.jpg";
import { cn } from "@/lib/utils";
import { CarImage } from "@/components/car/CarImage";

interface CarGalleryProps {
  alt: string;
  images?: string[];
}

export function CarGallery({ alt, images }: CarGalleryProps) {
  const list = (images ?? []).filter(Boolean);
  const photos = list.length ? list : [heroCar];
  const [active, setActive] = useState(0);
  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted md:neon-glow">
        <CarImage
          src={current}
          fallbackSrc={heroCar}
          alt={alt}
          width={1024}
          height={768}
          className="h-full w-full object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} — фото ${i + 1}`}
              className={cn(
                "aspect-[4/3] overflow-hidden rounded-lg border transition",
                i === active
                  ? "border-accent ring-2 ring-accent/40"
                  : "border-border opacity-70 hover:opacity-100",
              )}
            >
              <CarImage
                src={src}
                fallbackSrc={heroCar}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
