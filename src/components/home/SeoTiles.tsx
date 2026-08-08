import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Plane, Wallet, Car } from "lucide-react";

const tiles = [
  {
    icon: Car,
    h: "Аренда авто в Новосибирске",
    p: "Прокат японских кей-каров. Выдача на ул. Доватора, 11.",
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
    <section
      aria-label="Услуги проката"
      className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-4"
    >
      {tiles.map((t, i) => (
        <Link
          key={t.h}
          to={t.to}
          className="nfs-tile lift group flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur-md transition hover:border-[color:var(--neon-orange)]/70 hover:bg-background/85 active:scale-[0.99]"
          style={{ animationDelay: `${400 + i * 90}ms` }}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color:var(--neon-orange)]/15 text-[color:var(--neon-orange)]">
            <t.icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[15px] font-bold leading-snug text-foreground">{t.h}</h3>
            <p className="mt-1 text-xs leading-snug text-foreground/70">{t.p}</p>
          </div>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--neon-orange)]" />
        </Link>
      ))}
    </section>
  );
}
