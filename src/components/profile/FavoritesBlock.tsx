import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SectionCard } from "@/components/checkout/SectionCard";
import { useFavorites } from "@/state/FavoritesContext";
import { useCars } from "@/state/AppDataContext";
import { formatRub } from "@/lib/bookingDraft";
import { CarImage } from "@/components/car/CarImage";

export function FavoritesBlock() {
  const { favorites, toggleFavorite } = useFavorites();
  const cars = useCars();
  const list = cars.filter((c) => favorites.includes(c.id));

  return (
    <SectionCard title="Избранное" className="bg-card ring-1 ring-border">
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока пусто. Нажмите на сердечко в каталоге, чтобы сохранить автомобиль.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((car) => (
            <li key={car.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-2">
              <CarImage
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                loading="lazy"
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to="/cars/$carId"
                  params={{ carId: car.id }}
                  className="block truncate text-sm font-semibold transition-colors hover:text-accent"
                >
                  {car.brand} {car.model}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatRub(car.pricePerDay)} / сутки · {car.year}
                </p>
              </div>
              <button
                type="button"
                aria-label="Убрать из избранного"
                onClick={() => toggleFavorite(car.id)}
                className="shrink-0 rounded-full p-2 text-primary transition hover:bg-muted"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
