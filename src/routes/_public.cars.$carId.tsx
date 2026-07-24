import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Fuel, Gauge, Star, Users, Wrench, Car as CarIcon, Coins, Route as RouteIcon, Droplet } from "lucide-react";
import { getCarById } from "@/mocks/cars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarGallery } from "@/components/car/CarGallery";
import { AvailabilityCalendar } from "@/components/car/AvailabilityCalendar";

export const Route = createFileRoute("/_public/cars/$carId")({
  loader: ({ params }) => {
    const car = getCarById(params.carId);
    if (!car) throw notFound();
    return { car };
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.car;
    const title = c
      ? `${c.brand} ${c.model} ${c.year} — аренда в Новосибирске`
      : "Авто не найдено — NSK-RENT";
    const description = c
      ? `Аренда ${c.brand} ${c.model} ${c.year} в Новосибирске от ${c.pricePerDay.toLocaleString("ru-RU")} ₽ / сутки. Онлайн-бронирование.`
      : "Автомобиль не найден.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/cars/${params.carId}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/cars/${params.carId}` }],
    };
  },
  component: CarPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <h1 className="font-display text-2xl font-bold">Авто не найдено</h1>
      <p className="mt-2 text-sm text-muted-foreground">Возможно, эта модель уже недоступна.</p>
      <Button asChild className="mt-6"><Link to="/cars">К каталогу</Link></Button>
    </div>
  ),
});

import type { CarClass } from "@/types/domain";
const classLabel: Record<CarClass, string> = { econom: "Эконом", sport: "Спорт", premium: "Премиум" };

function CarPage() {
  const { car } = Route.useLoaderData();

  const specs = [
    { icon: CarIcon, label: "Двигатель", value: `${car.engineVolume.toFixed(2)} л` },
    { icon: Gauge, label: "Мощность", value: `${car.power} л.с.` },
    { icon: Wrench, label: "Крутящий момент", value: `${car.torque} Н·м` },
    { icon: Fuel, label: "Расход", value: `${car.consumption} л/100км` },
    { icon: CarIcon, label: "КПП", value: car.transmission },
    { icon: Users, label: "Мест", value: String(car.seats ?? 4) },
    { icon: CarIcon, label: "Кузов", value: car.bodyType ?? "хэтчбек" },
    { icon: Star, label: "Рейтинг", value: car.rating.toFixed(1) },
  ];

  const terms = [
    { icon: RouteIcon, label: "Пробег", value: car.mileageLimit ? `${car.mileageLimit} км/сутки` : "Без лимита" },
    { icon: Coins, label: "Залог", value: `${(car.deposit ?? 0).toLocaleString("ru-RU")} ₽` },
    { icon: Droplet, label: "Топливо", value: car.fuelPolicy ?? "полный → полный" },
    { icon: Users, label: "Возраст / стаж", value: "от 21 года / 2 года" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <CarGallery alt={`${car.brand} ${car.model}`} />

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <Badge className="uppercase tracking-wider">{classLabel[car.class]}</Badge>
              <div className="inline-flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-current text-[color:var(--neon-orange)]" />
                <span className="font-semibold">{car.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
            </div>
            <h1 className="mt-3 font-display text-3xl font-black md:text-4xl md:neon-text">
              {car.brand} {car.model}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{car.year} год · правый руль</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 md:neon-glow">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Цена</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-3xl font-black md:text-4xl md:text-[color:var(--neon-orange)] md:[text-shadow:0_0_18px_color-mix(in_oklab,var(--neon-orange)_60%,transparent)]">
                от {car.pricePerDay.toLocaleString("ru-RU")} ₽
              </span>
              <span className="text-sm text-muted-foreground">/ сутки</span>
            </div>
            <Button asChild size="lg" className="mt-5 w-full gap-2 font-bold uppercase tracking-wider">
              <Link to="/booking/$carId" params={{ carId: car.id }}>
                Забронировать <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div>
            <h2 className="mb-3 font-display text-xl font-bold">Характеристики</h2>
            <dl className="grid grid-cols-2 gap-3">
              {specs.map((s) => (
                <div key={s.label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                  <s.icon className="mt-0.5 h-4 w-4 text-accent" />
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</dt>
                    <dd className="text-sm font-semibold">{s.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-2xl font-bold md:neon-text">Календарь занятости</h2>
          <AvailabilityCalendar carId={car.id} />
        </div>

        <div>
          <h2 className="mb-4 font-display text-2xl font-bold md:neon-text">Условия аренды</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {terms.map((t) => (
              <div key={t.label} className="rounded-xl border border-border bg-card p-4">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground md:bg-transparent md:text-[color:var(--neon-orange)] md:neon-glow-orange">
                  <t.icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">{t.label}</p>
                <p className="mt-1 font-semibold">{t.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
