import { Link } from "@tanstack/react-router";
import { ArrowRight, Fuel, Gauge, Star } from "lucide-react";
import type { Car } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroCar from "@/assets/hero-car.jpg";

const classLabel: Record<Car["class"], string> = {
  econom: "Econom",
  sport: "Sport",
  premium: "Premium",
};

export function CarCard({ car }: { car: Car }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition md:hover:neon-glow">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={car.image ?? heroCar}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 uppercase tracking-wider">
          {classLabel[car.class]}
        </Badge>
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 text-xs font-semibold backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-current text-[color:var(--neon-orange)]" />
          {car.rating.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-bold">
            {car.brand} {car.model}
          </h3>
          <span className="text-xs text-muted-foreground">{car.year}</span>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1">
            <span className="font-semibold text-foreground">{car.engineVolume.toFixed(2)}л</span>
            двигатель
          </div>
          <div className="inline-flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            {car.power} л.с.
          </div>
          <div className="inline-flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {car.consumption} л
          </div>
          <div className="inline-flex items-center gap-1">
            <span className="font-semibold text-foreground">{car.transmission}</span>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between pt-5">
          <div>
            <span className="font-display text-xl font-black text-foreground md:text-[color:var(--neon-orange)] md:[text-shadow:0_0_16px_color-mix(in_oklab,var(--neon-orange)_60%,transparent)]">
              {car.pricePerDay.toLocaleString("ru-RU")} ₽
            </span>
            <span className="ml-1 text-xs text-muted-foreground">/ сутки</span>
          </div>
          <Button asChild size="sm" variant="ghost" className="gap-1">
            <Link to="/cars/$carId" params={{ carId: car.id }}>
              Подробнее <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
