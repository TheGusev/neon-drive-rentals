import { createFileRoute } from "@tanstack/react-router";
import { Clock, Sparkles, Wallet, Wrench } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import { QuickBookingWidget } from "@/components/home/QuickBookingWidget";
import { PopularModels } from "@/components/home/PopularModels";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "NSK-RENT — Аренда японских кей-каров в Новосибирске" },
      {
        name: "description",
        content:
          "Прокат японских кей-каров и премиум-авто в Новосибирске. Онлайн-бронирование, честные цены, поддержка 24/7.",
      },
      { property: "og:title", content: "NSK-RENT — Аренда японских кей-каров в Новосибирске" },
      {
        property: "og:description",
        content: "Кей-кары в аренду в Новосибирске. Быстрое бронирование онлайн.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const benefits = [
  { icon: Wallet, title: "Честные цены", text: "Без скрытых комиссий и переплат" },
  { icon: Clock, title: "Поддержка 24/7", text: "На связи в любое время суток" },
  { icon: Sparkles, title: "Простое бронирование", text: "Оформление онлайн за 3 минуты" },
  { icon: Wrench, title: "Японское качество", text: "Обслуженный автопарк из Японии" },
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative -mx-4 -mt-8 overflow-hidden md:-mx-6 md:-mt-12">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroCar}
            alt="Японский кей-кар в неоновом гараже"
            width={1600}
            height={1024}
            className="h-full w-full object-cover md:opacity-90"
          />
          {/* Desktop neon overlay */}
          <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-background via-transparent to-transparent" />
          {/* Mobile softer overlay */}
          <div className="absolute inset-0 md:hidden bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-16 md:min-h-[calc(100svh-6rem)] md:grid-cols-[1.2fr_minmax(360px,1fr)] md:items-center md:gap-12 md:px-6 md:py-24">
          <div className="text-foreground">
            <p className="text-[10px] uppercase tracking-[0.5em] text-accent md:text-xs">
              速度を感じる · Nsk · JDM
            </p>
            <h1 className="mt-4 font-display text-5xl font-black leading-[0.9] tracking-tight md:text-8xl md:neon-text">
              NSK-RENT
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:mt-6 md:text-lg md:text-foreground/80">
              Аренда японских кей-каров в Новосибирске
            </p>
            <p className="mt-3 hidden max-w-md text-sm text-muted-foreground md:block">
              Компактные, экономичные и надёжные авто с правым рулём — прямо из Японии.
              Забронируйте за 3 минуты.
            </p>
          </div>

          <div className="md:ml-auto md:w-full md:max-w-md">
            <QuickBookingWidget />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-12 md:py-20">
        <div className="mb-8 text-center md:mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Почему мы</p>
          <h2 className="mt-1 font-display text-2xl font-black md:text-4xl md:neon-text">
            Преимущества
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-card p-6 transition md:hover:neon-glow"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground md:bg-transparent md:text-[color:var(--neon-orange)] md:neon-glow-orange">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR MODELS */}
      <PopularModels />
    </>
  );
}
