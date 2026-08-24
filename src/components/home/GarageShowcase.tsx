import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowRight, ChevronLeft, ChevronRight, Eye, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBookings, useCars } from "@/state/AppDataContext";
import { getTariff } from "@/mocks/tariffs";
import type { Car } from "@/types/domain";
import { isCarAvailable, nextBusyUntil, splitAvailability } from "@/lib/availability";
import { useHomeBooking } from "./HomeBookingContext";
import { CarQuickView } from "./CarQuickView";
import { NfsSideMenu } from "./NfsSideMenu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useHydrated } from "@/hooks/useHydrated";
import { usePrefetchCar } from "@/hooks/usePrefetchCar";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CarImage } from "@/components/car/CarImage";


/**
 * "Гараж" — NFS-style car picker: benefit tiles on the side,
 * a highlighted car carousel with a dashboard-like position bar.
 */
export function GarageShowcase({ compact = false }: { compact?: boolean }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [quickCar, setQuickCar] = useState<Car | null>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const { from, to } = useHomeBooking();
  const cars = useCars();
  const bookings = useBookings();
  const garageCars = useMemo(() => cars.slice(0, 10), [cars]);
  const { available } = useMemo(
    () => splitAvailability(cars, from, to, bookings),
    [cars, from, to, bookings],
  );

  const measure = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const node = child as HTMLElement;
      const c = node.offsetLeft + node.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  // rAF-throttled scroll sync — no layout thrash, no jitter.
  const sync = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      measure();
    });
  }, [measure]);

  useEffect(() => {
    measure();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [measure]);

  // Play the entrance once, when the block first scrolls into view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scrollByCards = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 280;
    el.scrollBy({ left: dir * (step + 12), behavior: reducedMotion ? "auto" : "smooth" });
  };


  return (
    <TooltipProvider delayDuration={150}>
    <section ref={sectionRef} aria-label="Гараж — выбор автомобиля" className="relative">

      <div className={cn("mx-auto w-full max-w-7xl px-4 md:px-6", compact && "px-4")}>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[color:var(--neon-blue)]">Garage · 車庫</p>
            <h2
              className="mt-0.5 font-display text-xl font-black uppercase tracking-widest text-foreground md:text-3xl"
            >
              Гараж <span className="text-[color:var(--neon-blue)]">выбора</span>
            </h2>
            <p className="mt-1 text-xs text-foreground/75 md:text-sm">
              {available.length} авто свободно · выберите машину и посмотрите цену
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              aria-label="Влево"
              onClick={() => scrollByCards(-1)}
              className="h-9 w-9 border-border/70 bg-background/60 backdrop-blur hover:border-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Вправо"
              onClick={() => scrollByCards(1)}
              className="h-9 w-9 border-border/70 bg-background/60 backdrop-blur hover:border-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button asChild variant="ghost" size="sm" className="ml-1 gap-1 text-accent hover:text-accent">
              <Link to="/cars">
                Все <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="road-line road-line-run mt-3 w-full opacity-70" />
      </div>

      <div className="mx-auto mt-4 grid w-full max-w-7xl gap-4 px-4 md:px-6 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-6">
        <NfsSideMenu animate={entered} className="hidden xl:flex" />
        <NfsSideMenu animate={entered} orientation="horizontal" className="-mx-4 px-4 xl:hidden" />

        <div className="min-w-0">
          <div
            ref={stripRef}
            onScroll={sync}
            className="garage-strip no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 pt-1 md:-mx-6 md:px-6"
          >
            {garageCars.map((car, i) => (
              <GarageCard
                key={car.id}
                car={car}
                index={i}
                entered={entered}
                active={i === active}
                onQuickView={() => setQuickCar(car)}
              />
            ))}
          </div>

          {/* Dashboard-like position indicator */}
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full w-[28%] origin-left rounded-full bg-[color:var(--neon-blue)] shadow-[0_0_12px_var(--neon-blue)] transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `translateX(${(progress * 72 * 100) / 28}%)` }}
            />
          </div>
        </div>
      </div>

      <CarQuickView car={quickCar} onClose={() => setQuickCar(null)} />
    </section>
    </TooltipProvider>

  );
}

function GarageCard({
  car,
  active,
  index,
  entered,
  onQuickView,
}: {
  car: Car;
  active: boolean;
  index: number;
  entered: boolean;
  onQuickView: () => void;
}) {
  const { from, to, tariff } = useHomeBooking();
  const bookings = useBookings();
  const free = isCarAvailable(car, from, to, bookings);
  const hydrated = useHydrated();
  // Date-dependent availability label is rendered only after hydration to avoid
  // server/client mismatches caused by different timezones or render moments.
  const busyUntil = !free && hydrated ? nextBusyUntil(car, bookings) : null;
  const price = Math.round(car.pricePerDay * getTariff(tariff).multiplier);
  const coarse = useCoarsePointer();

  const perks = [
    `${car.consumption} л/100 км`,
    car.transmission === "AT" ? "Автомат" : "Механика",
    `${car.seats} места`,
    "Правый руль",
    `${car.mileageLimit} км/сутки`,
  ];

  const { prefetch, cancel } = usePrefetchCar();

  // On touch devices the centered card is the likely target — warm it early.
  useEffect(() => {
    if (coarse && active) prefetch(car, true);
  }, [coarse, active, car, prefetch]);

  const card = (
    <Link
      to="/cars/$carId"
      params={{ carId: car.id }}
      preload="intent"
      aria-label={`${car.brand} ${car.model} — подробнее`}
      data-active={active ? "true" : "false"}
      style={{ "--i": index } as React.CSSProperties}
      onMouseEnter={() => prefetch(car)}
      onMouseLeave={cancel}
      onFocus={() => prefetch(car, true)}
      onTouchStart={() => prefetch(car, true)}
      className={cn(
        "garage-card group relative flex h-[200px] w-[240px] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border text-left backdrop-blur sm:h-[220px] sm:w-[280px] xl:h-[250px] xl:w-[320px]",
        entered && "garage-in",
        active
          ? "border-accent bg-card/85 shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--neon-blue)_75%,transparent)]"
          : "border-border/60 bg-card/60",
        !free && "grayscale-[0.35]",
      )}
    >

      <div className="relative flex-1 overflow-hidden bg-muted">
        <CarImage
          src={car.image}
          alt={`${car.brand} ${car.model} — аренда в Новосибирске`}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          decoding="async"
          width={320}
          height={250}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <span className="garage-sweep pointer-events-none absolute inset-0" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        <span className="absolute left-2 top-2 rounded-md bg-background/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest backdrop-blur">
          {car.class === "sport" ? "Sport" : "Econom"}
        </span>
        {!free && (
          <span className="absolute right-2 top-9 rounded-md bg-destructive/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-destructive-foreground">
            Занято{busyUntil ? ` до ${format(busyUntil, "d.MM")}` : ""}
          </span>
        )}
        <button
          type="button"
          aria-label={`Быстрый просмотр: ${car.brand} ${car.model}`}
          onMouseEnter={() => prefetch(car, true)}
          onFocus={() => prefetch(car, true)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView();
          }}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md border border-border/60 bg-background/75 text-foreground backdrop-blur transition hover:border-accent hover:text-[color:var(--neon-blue)]"
        >

          <Eye className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-foreground">
            {car.brand} {car.model}
          </p>
          <p className="text-[10px] text-muted-foreground">
            <Fuel className="mr-0.5 inline h-2.5 w-2.5" />
            {car.consumption}л · {car.transmission}
          </p>
        </div>
        <span className="font-display text-base font-black text-[color:var(--neon-orange)]">
          {price.toLocaleString("ru-RU")}₽
        </span>
      </div>
    </Link>
  );


  // На сенсорных устройствах подсказки не показываем — они перекрывали контент при скролле.
  if (coarse) return card;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>

      <TooltipContent
        side="top"
        sideOffset={10}
        className="pointer-events-none max-w-[260px] border-accent/50 bg-background/95 text-foreground shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--neon-blue)_70%,transparent)] backdrop-blur"
      >
        <p className="font-display text-sm font-bold">
          {car.brand} {car.model} · {car.year}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Цвет: {car.color}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {perks.map((p) => (
            <span
              key={p}
              className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium"
            >
              {p}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px]">
          <span className="font-display text-sm font-black text-[color:var(--neon-orange)]">
            {price.toLocaleString("ru-RU")} ₽
          </span>{" "}
          <span className="text-muted-foreground">/ сутки</span>
          {" · "}
          {free ? (
            <span className="text-[color:var(--neon-blue)]">Свободна</span>
          ) : (
            <span className="text-destructive">
              Занято{busyUntil ? ` до ${format(busyUntil, "d.MM")}` : ""}
            </span>
          )}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Клик — страница авто · иконка «глаз» — быстрый просмотр
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

