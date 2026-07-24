import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Plane, Wallet, Car } from "lucide-react";

const tiles = [
  {
    icon: Car,
    h: "Аренда авто в Новосибирске",
    p: "Прокат японских кей-каров с доставкой по городу и области.",
    to: "/rent/novosibirsk" as const,
  },
  {
    icon: Wallet,
    h: "Аренда без залога",
    p: "Страховой депозит от 5 000 ₽, для проверенных клиентов — 0 ₽.",
    to: "/rent/bez-zaloga" as const,
  },
  {
    icon: Plane,
    h: "Кей-кары из Японии",
    p: "Правый руль, оригинал. Honda N-BOX, Suzuki Wagon R, Nissan Dayz.",
    to: "/kei-cars" as const,
  },
  {
    icon: BookOpen,
    h: "Блог и гайды",
    p: "Как арендовать, куда съездить, чем кей-кары лучше седана.",
    to: "/blog" as const,
  },
];

export function SeoTiles() {
  return (
    <section aria-label="Услуги проката" className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-2.5 px-6 lg:grid-cols-4">
      {tiles.map((t, i) => (
        <Link
          key={t.h}
          to={t.to}
          className="nfs-tile group flex items-start gap-3 rounded-xl border border-border/60 bg-background/65 p-3 backdrop-blur-md transition hover:border-[color:var(--neon-orange)]/70 hover:bg-background/80"
          style={{ animationDelay: `${800 + i * 90}ms` }}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[color:var(--neon-orange)]/15 text-[color:var(--neon-orange)]">
            <t.icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-sm font-bold text-foreground">{t.h}</h3>
            <p className="line-clamp-2 text-[11px] leading-snug text-foreground/70">{t.p}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/40 transition group-hover:text-[color:var(--neon-orange)]" />
        </Link>
      ))}
    </section>
  );
}
