import { Link } from "@tanstack/react-router";
import type { Car } from "@/types/domain";
import { useCars } from "@/state/AppDataContext";
import heroCar from "@/assets/hero-car.jpg";

/** Перелинковка: 3–4 авто того же класса, исключая текущее. */
export function SimilarCars({ car }: { car: Car }) {
  const all = useCars();
  const similar = all
    .filter((c) => c.id !== car.id && c.class === car.class)
    .sort((a, b) => Math.abs(a.pricePerDay - car.pricePerDay) - Math.abs(b.pricePerDay - car.pricePerDay))
    .slice(0, 4);

  if (!similar.length) return null;

  return (
    <section aria-labelledby="similar-heading">
      <h2 id="similar-heading" className="mb-4 font-display text-2xl font-bold md:neon-text">
        Похожие авто в аренду
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {similar.map((c) => (
          <Link
            key={c.id}
            to="/cars/$carId"
            params={{ carId: c.id }}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-accent"
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={c.image ?? heroCar}
                alt={`Аренда ${c.brand} ${c.model} ${c.year}, ${c.color}, в Новосибирске`}
                loading="lazy"
                width={1024}
                height={768}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="font-display text-sm font-bold">
                {c.brand} {c.model}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.year} · {c.transmission} · {c.consumption} л/100 км
              </p>
              <p className="mt-1 font-display text-base font-black text-accent">
                от {c.pricePerDay.toLocaleString("ru-RU")} ₽/сутки
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <Link to="/cars" className="link-quiet text-sm font-semibold hover:text-accent">
          Смотреть весь автопарк →
        </Link>
      </div>
    </section>
  );
}
