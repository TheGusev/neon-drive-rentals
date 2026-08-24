import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqBlock } from "@/components/home/FaqBlock";
import { RENTAL_TERMS } from "@/lib/rentalTerms";
import type { FaqItem } from "@/mocks/faq";
import type { Car } from "@/types/domain";
import { CarImage } from "@/components/car/CarImage";

export interface RelatedLink {
  to: string;
  label: string;
  hint?: string;
}

interface LandingPageProps {
  h1: string;
  lead: string;
  breadcrumb: string;
  breadcrumbTo?: string;
  sections: Array<{ h: string; body: string }>;
  bullets?: string[];
  cars?: Car[];
  carsTitle?: string;
  carsLimit?: number;
  faq: FaqItem[];
  related?: RelatedLink[];
  showTerms?: boolean;
}

export function LandingPage({
  h1,
  lead,
  breadcrumb,
  breadcrumbTo,
  sections,
  bullets,
  cars,
  carsTitle = "Автомобили в наличии",
  carsLimit = 6,
  faq,
  related,
  showTerms = true,
}: LandingPageProps) {
  const shown = cars?.slice(0, carsLimit) ?? [];

  return (
    <article className="bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-16">
        <Breadcrumbs
          items={[
            { name: "Главная", to: "/" },
            { name: "Автопарк", to: "/cars" },
            { name: breadcrumb, to: breadcrumbTo },
          ]}
        />

        <h1 className="font-display text-3xl font-black leading-tight md:text-5xl">{h1}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{lead}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/cars">
              Посмотреть автопарк <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="tel:+78005557213">Позвонить</a>
          </Button>
        </div>

        {showTerms && (
          <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Залог", `${RENTAL_TERMS.deposit.toLocaleString("ru-RU")} ₽`],
              [
                "Возраст / стаж",
                `от ${RENTAL_TERMS.minAge} лет / ${RENTAL_TERMS.minExperience} года`,
              ],
              ["Пробег", `${RENTAL_TERMS.mileagePerDay} км/сутки`],
              ["Выдача", "ул. Доватора, 11"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-card p-3">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-display text-base font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {bullets && bullets.length > 0 && (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="font-display text-xl font-bold md:text-2xl">{s.h}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
              {s.body}
            </p>
          </section>
        ))}

        {shown.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold md:text-2xl">{carsTitle}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((car) => (
                <Link
                  key={car.id}
                  to="/cars/$carId"
                  params={{ carId: car.id }}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <CarImage
                      src={car.image}
                      alt={`Аренда ${car.brand} ${car.model} в Новосибирске`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-display text-base font-bold">
                      {car.brand} {car.model}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {car.year} · {car.transmission} · {car.consumption} л/100 км
                    </p>
                    <p className="mt-2 font-display text-lg font-black text-primary">
                      от {car.pricePerDay.toLocaleString("ru-RU")} ₽/сутки
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {related && related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold md:text-2xl">Смотрите также</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((l) => (
                <Link
                  key={l.to}
                  to={l.to as "/"}
                  className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary"
                >
                  <p className="font-display text-sm font-bold group-hover:text-primary">
                    {l.label}
                  </p>
                  {l.hint && <p className="mt-1 text-xs text-muted-foreground">{l.hint}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <FaqBlock items={faq} title="Частые вопросы" subtitle="" />

      <div className="mx-auto max-w-4xl px-4 pb-16 md:px-6">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center md:p-10">
          <h2 className="font-display text-xl font-bold md:text-2xl">Готовы забронировать?</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Онлайн-договор за 3 минуты, выдача на ул. Доватора, 11. Залог{" "}
            {RENTAL_TERMS.deposit.toLocaleString("ru-RU")} ₽.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/cars">
                Выбрать авто <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/terms">Условия аренды</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
