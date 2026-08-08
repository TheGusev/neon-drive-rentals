import { Car, Clock, MapPin, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: Car, title: "8 JDM кей-каров", sub: "весь парк из Японии" },
  { icon: ShieldCheck, title: "Правый руль", sub: "оригинал, не распил" },
  { icon: Zap, title: "От 1 800 ₽ / сутки", sub: "город · без переплат" },
  { icon: MapPin, title: "Пункт выдачи", sub: "Доватора, 11" },
  { icon: Clock, title: "Договор за 3 мин", sub: "онлайн + СМС-подпись" },
];

export function NfsSideMenu({
  orientation = "vertical",
  className,
}: {
  orientation?: "vertical" | "horizontal";
  className?: string;
}) {
  const horizontal = orientation === "horizontal";

  return (
    <nav
      aria-label="Преимущества"
      className={cn(
        horizontal
          ? "no-scrollbar flex w-full gap-2 overflow-x-auto"
          : "flex w-full max-w-[280px] flex-col gap-2",
        className,
      )}
    >
      {items.map((it, i) => (
        <div
          key={it.title}
          className={cn(
            "nfs-tile group flex items-center gap-3 rounded-r-xl border border-l-2 border-border/50 border-l-[color:var(--neon-blue)]/70 bg-background/55 py-2.5 pl-3 pr-4 backdrop-blur-md transition",
            horizontal && "shrink-0 rounded-xl py-2 pr-3",
          )}
          style={{ animationDelay: `${100 + i * 80}ms` }}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[color:var(--neon-blue)]/15 text-[color:var(--neon-blue)] transition group-hover:bg-[color:var(--neon-orange)]/20 group-hover:text-[color:var(--neon-orange)]">
            <it.icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold text-foreground">{it.title}</p>
            <p className="truncate text-[11px] text-foreground/70">{it.sub}</p>
          </div>
        </div>
      ))}
    </nav>
  );
}
