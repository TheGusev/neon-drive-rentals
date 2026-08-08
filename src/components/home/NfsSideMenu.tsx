import type React from "react";
import { Car, Clock, MapPin, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const items = [
  {
    icon: Car,
    title: "8 JDM кей-каров",
    sub: "весь парк из Японии",
    hint: "Весь парк — японские кей-кары: компактные, экономичные, идеальны для города и парковки во дворах.",
  },
  {
    icon: ShieldCheck,
    title: "Правый руль",
    sub: "оригинал, не распил",
    hint: "Только оригинальные праворульные автомобили без распилов и конструкторов — проверенные и обслуженные.",
  },
  {
    icon: Zap,
    title: "От 1 800 ₽ / сутки",
    sub: "город · без переплат",
    hint: "1 800 ₽/сутки по городу, от 2 000 ₽ за город. Без скрытых комиссий: цена в договоре равна цене на сайте.",
  },
  {
    icon: MapPin,
    title: "Пункт выдачи",
    sub: "Доватора, 11",
    hint: "Единственный пункт выдачи: Новосибирск, ул. Доватора, 11. Доставка автомобиля не выполняется.",
  },
  {
    icon: Clock,
    title: "Договор за 3 мин",
    sub: "онлайн + СМС-подпись",
    hint: "Оформление онлайн: паспорт и права, подпись договора по СМС-коду — ключи получаете сразу.",
  },
];

export function NfsSideMenu({
  orientation = "vertical",
  animate = true,
  className,
}: {
  orientation?: "vertical" | "horizontal";
  animate?: boolean;
  className?: string;
}) {
  const horizontal = orientation === "horizontal";

  return (
    <TooltipProvider delayDuration={150}>
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
          <Tooltip key={it.title}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`${it.title} — подробнее`}
                className={cn(
                  "group flex items-center gap-3 rounded-r-xl border border-l-2 border-border/50 border-l-[color:var(--neon-blue)]/70 bg-background/55 py-2.5 pl-3 pr-4 text-left backdrop-blur-md transition hover:border-accent/70",
                  horizontal && "shrink-0 rounded-xl py-2 pr-3",
                  animate && "garage-in",
                )}
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[color:var(--neon-blue)]/15 text-[color:var(--neon-blue)] transition group-hover:bg-[color:var(--neon-orange)]/20 group-hover:text-[color:var(--neon-orange)]">
                  <it.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-foreground">{it.title}</p>
                  <p className="truncate text-[11px] text-foreground/70">{it.sub}</p>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side={horizontal ? "bottom" : "right"}
              sideOffset={8}
              className="pointer-events-none max-w-[240px] border-accent/50 bg-background/95 text-[11px] leading-snug text-foreground backdrop-blur"
            >
              {it.hint}
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );
}
