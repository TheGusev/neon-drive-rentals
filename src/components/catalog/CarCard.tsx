import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Heart, Star } from "lucide-react";
import type { Car } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/state/FavoritesContext";
import { cn } from "@/lib/utils";
import heroCar from "@/assets/hero-car.jpg";

export const fleetStatusMeta: Record<NonNullable<Car["status"]>, { label: string; className: string }> = {
  free: { label: "Свободен", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  busy: { label: "В аренде", className: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  maintenance: { label: "На ТО", className: "bg-muted text-muted-foreground" },
};

export function CarCard({ car }: { car: Car }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(car.id);
  const status = fleetStatusMeta[car.status ?? "free"];
  const canBook = (car.status ?? "free") === "free";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg md:hover:neon-glow">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={car.image ?? heroCar}
          alt={`${car.brand} ${car.model}, ${car.color}`}
          loading="lazy"
          width={1024}
          height={640}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className={cn("absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur", status.className)}>
          {status.label}
        </span>
        <button
          type="button"
          aria-label={fav ? "Убрать из избранного" : "В избранное"}
          onClick={() => toggleFavorite(car.id)}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/85 backdrop-blur transition hover:scale-110"
        >
          <Heart className={cn("h-4 w-4", fav ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="min-w-0 truncate font-display text-lg font-bold">
            {car.brand} {car.model}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">{car.year}</span>
        </div>

        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-current text-[color:var(--neon-orange)]" />
          {car.rating.toFixed(1)} · {car.reviewsCount ?? 0} отзывов · {car.color}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1">
            <span className="font-semibold text-foreground">{car.engineVolume.toFixed(2)} л</span> двигатель
          </div>
          <div className="inline-flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" /> {car.power} л.с.
          </div>
          <div className="inline-flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" /> {car.consumption} л/100 км
          </div>
          <div className="inline-flex items-center gap-1">
            <span className="font-semibold text-foreground">Автомат</span>
          </div>
        </dl>

        <div className="mt-auto space-y-3 pt-5">
          <div>
            <span className="font-display text-xl font-black text-foreground md:text-[color:var(--neon-orange)]">
              {car.pricePerDay.toLocaleString("ru-RU")} ₽
            </span>
            <span className="ml-1 text-xs text-muted-foreground">/ сутки</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/cars/$carId" params={{ carId: car.id }}>Подробнее</Link>
            </Button>
            <Button asChild size="sm" disabled={!canBook}>
              <Link to="/booking/$carId" params={{ carId: car.id }}>Выбрать</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
