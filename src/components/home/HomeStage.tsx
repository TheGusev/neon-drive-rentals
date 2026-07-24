import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ArrowRight,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Fuel,
  MapPin,
  Search,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { cars } from "@/mocks/cars";
import { tariffs, getTariff } from "@/mocks/tariffs";
import type { BookingTariff, Car } from "@/types/domain";
import { HomeBookingProvider, useHomeBooking } from "./HomeBookingContext";
import { isCarAvailable, nextBusyUntil, splitAvailability } from "@/lib/availability";
import { daysBetween, formatRub } from "@/lib/bookingDraft";
import { CarQuickView } from "./CarQuickView";
import { HeroBackdrop } from "./HeroBackdrop";
import { NfsSideMenu } from "./NfsSideMenu";
import { SeoTiles } from "./SeoTiles";

const locations = [
  { value: "airport", label: "Аэропорт Толмачёво" },
  { value: "center", label: "Центр, ул. Ленина 1" },
  { value: "left-bank", label: "Левый берег, пл. Маркса" },
];

const benefits = [
  { icon: Wallet, title: "Честные цены", text: "без переплат" },
  { icon: Clock, title: "Поддержка 24/7", text: "всегда на связи" },
  { icon: Sparkles, title: "Онлайн за 3 мин", text: "быстрое бронирование" },
  { icon: Wrench, title: "JDM качество", text: "авто из Японии" },
];

const popular = cars.slice(0, 8);

// -------- Desktop --------

export function HomeDesktop({ heroImage }: { heroImage: string }) {
  return (
    <HomeBookingProvider>
      <HomeDesktopInner heroImage={heroImage} />
    </HomeBookingProvider>
  );
}

function HomeDesktopInner({ heroImage: _heroImage }: { heroImage: string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [quickCar, setQuickCar] = useState<Car | null>(null);
  const { from, to } = useHomeBooking();

  const scrollBy = (delta: number) => stripRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  const { available } = useMemo(() => splitAvailability(cars, from, to), [from, to]);

  return (
    <div className="relative -mx-4 -my-8 h-[calc(100svh-4.5rem)] overflow-hidden md:-mx-6 md:-my-12 md:h-[calc(100svh-5rem)]">
      <HeroBackdrop />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-[280px_1fr] items-center gap-8 px-6 pt-4">
          {/* Left: NFS-style menu */}
          <NfsSideMenu />

          {/* Middle: title + copy + CTAs */}
          <div className="max-w-2xl">
            <p className="rise-in text-[10px] uppercase tracking-[0.5em] text-[color:var(--neon-blue)] drop-shadow" style={{ animationDelay: "50ms" }}>
              速度を感じる · Nsk · JDM
            </p>

            <div className="rise-in mt-2" style={{ animationDelay: "150ms" }}>
              <p className="font-display text-[72px] font-black leading-[0.9] tracking-tight md:text-[84px] xl:text-[104px]">
                <span className="logo-neon">NSK-RENT</span>
              </p>
              <h1 className="mt-2 font-display text-xl font-bold leading-tight text-foreground drop-shadow-lg md:text-2xl">
                Аренда японских кей-каров в&nbsp;Новосибирске
              </h1>
            </div>

            <p className="rise-in mt-3 max-w-xl text-base text-foreground/95 drop-shadow-md md:text-lg" style={{ animationDelay: "280ms" }}>
              Правый руль, честные цены, ключи за 3 минуты. Доставка авто по городу и области.
            </p>

            <div className="rise-in mt-4 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-background/60 px-3 py-2 text-xs text-foreground backdrop-blur-md" style={{ animationDelay: "380ms" }}>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[color:var(--neon-blue)] shadow-[0_0_10px_var(--neon-blue)]" />
                {available.length} авто свободно
              </span>
              <span className="opacity-40">·</span>
              <span>от <b className="text-[color:var(--neon-orange)]">1 800 ₽</b>/сутки · за город от <b className="text-[color:var(--neon-orange)]">2 000 ₽</b></span>
            </div>

            <div className="rise-in mt-5 flex flex-wrap gap-3" style={{ animationDelay: "460ms" }}>
              <Button asChild size="lg" className="gap-2 font-bold uppercase tracking-wider md:pulse-glow">
                <Link to="/cars">
                  <Search className="h-4 w-4" />
                  Найти авто
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-accent/60 bg-background/60 font-bold uppercase tracking-wider text-foreground backdrop-blur hover:border-accent hover:bg-background/80"
                  >
                    <CalendarIcon className="h-4 w-4 text-accent" />
                    Быстрое бронирование
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
                  <div className="pt-6">
                    <QuickBookingForm />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Popular strip */}
        <div className="rise-in shrink-0 pt-1" style={{ animationDelay: "700ms" }}>
          <div className="mx-auto mb-2 flex max-w-7xl items-end justify-between gap-4 px-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-foreground/70">Каталог</p>
              <p className="font-display text-lg font-black text-foreground md:text-xl">
                Популярные <span className="text-[color:var(--neon-blue)]">модели</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => scrollBy(-320)} aria-label="Влево" className="h-8 w-8 border-border/70 bg-background/60 backdrop-blur hover:border-accent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => scrollBy(320)} aria-label="Вправо" className="h-8 w-8 border-border/70 bg-background/60 backdrop-blur hover:border-accent">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="sm" className="ml-2 gap-1 text-accent hover:text-accent">
                <Link to="/cars">Все <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </div>

          <div
            ref={stripRef}
            className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2 pr-6"
            style={{ paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))" }}
          >
            {popular.map((car) => (
              <StripCard key={car.id} car={car} onOpen={() => setQuickCar(car)} />
            ))}
          </div>
        </div>

        {/* SEO tiles */}
        <div className="shrink-0 pb-3 pt-2">
          <SeoTiles />
        </div>
      </div>

      <CarQuickView car={quickCar} onClose={() => setQuickCar(null)} />
    </div>
  );
}


function StripCard({ car, onOpen }: { car: Car; onOpen: () => void }) {
  const { from, to, tariff } = useHomeBooking();
  const available = isCarAvailable(car, from, to);
  const busyUntil = !available ? nextBusyUntil(car) : null;
  const t = getTariff(tariff);
  const priceInTariff = Math.round(car.pricePerDay * t.multiplier);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative flex h-[220px] w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border/60 bg-card/70 text-left backdrop-blur transition hover:-translate-y-1 hover:border-accent hover:neon-glow",
        !available && "opacity-60 grayscale-[0.3] hover:opacity-90",
      )}
    >
      <div className="relative flex-1 overflow-hidden bg-muted">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        <span className="absolute left-2 top-2 rounded-md bg-background/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest backdrop-blur">
          {car.class === "sport" ? "Sport" : "Econom"}
        </span>
        {!available && (
          <span className="absolute right-2 top-2 rounded-md bg-destructive/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-destructive-foreground">
            Занято{busyUntil ? ` до ${format(busyUntil, "d.MM")}` : ""}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold">{car.brand} {car.model}</p>
          <p className="text-[10px] text-muted-foreground">
            <Fuel className="mr-0.5 inline h-2.5 w-2.5" />{car.consumption}л · {car.transmission}
          </p>
        </div>
        <span className="font-display text-base font-black text-[color:var(--neon-orange)]">
          {priceInTariff.toLocaleString("ru-RU")}₽
        </span>
      </div>
    </button>
  );
}

// -------- Mobile --------

export function HomeMobile({ heroImage }: { heroImage: string }) {
  return (
    <HomeBookingProvider>
      <HomeMobileInner heroImage={heroImage} />
    </HomeBookingProvider>
  );
}

function HomeMobileInner({ heroImage }: { heroImage: string }) {
  const [quickCar, setQuickCar] = useState<Car | null>(null);

  return (
    <div className="-mx-4 -mt-8 flex min-h-[calc(100svh-4rem)] flex-col gap-4 px-4 pb-4 pt-6">
      <div className="rise-in relative h-[42svh] min-h-[280px] overflow-hidden rounded-3xl shadow-lg">
        <img src={heroImage} alt="Ночной драйв" className="ken-burns h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/50" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">Nsk · JDM</p>
          <h1 className="mt-1 font-display text-5xl font-black leading-none tracking-tight">
            <span className="bg-gradient-to-r from-white via-sky-200 to-white bg-clip-text text-transparent">
              NSK-RENT
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/85">Японские кей-кары · от 1800 ₽ / сутки</p>
        </div>
      </div>

      <div className="rise-in" style={{ animationDelay: "120ms" }}>
        <QuickBookingForm />
      </div>

      <div className="no-scrollbar rise-in -mx-4 flex gap-2 overflow-x-auto px-4" style={{ animationDelay: "220ms" }}>
        {benefits.map((b) => (
          <div key={b.title} className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-sm">
            <b.icon className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">{b.title}</span>
          </div>
        ))}
      </div>

      <div className="rise-in" style={{ animationDelay: "320ms" }}>
        <div className="mb-2 flex items-end justify-between">
          <p className="font-display text-base font-black">Популярные модели</p>
          <Link to="/cars" className="text-xs font-semibold text-primary">Все →</Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {popular.map((car) => (
            <MobileStripCard key={car.id} car={car} onOpen={() => setQuickCar(car)} />
          ))}
        </div>
      </div>

      <CarQuickView car={quickCar} onClose={() => setQuickCar(null)} />
    </div>
  );
}

function MobileStripCard({ car, onOpen }: { car: Car; onOpen: () => void }) {
  const { from, to, tariff } = useHomeBooking();
  const available = isCarAvailable(car, from, to);
  const busyUntil = !available ? nextBusyUntil(car) : null;
  const t = getTariff(tariff);
  const priceInTariff = Math.round(car.pricePerDay * t.multiplier);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "snap-start w-[180px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition active:scale-[0.98]",
        !available && "opacity-60",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={car.image} alt={`${car.brand} ${car.model}`} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-900">
          {car.class === "sport" ? "Sport" : "Econom"}
        </span>
        {!available && (
          <span className="absolute right-2 top-2 rounded bg-red-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            Занято{busyUntil ? ` ${format(busyUntil, "d.MM")}` : ""}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="truncate text-xs font-bold">{car.brand} {car.model}</p>
        <p className="mt-0.5 text-[11px] font-bold text-primary">
          {priceInTariff.toLocaleString("ru-RU")} ₽<span className="font-normal text-muted-foreground">/сутки</span>
        </p>
      </div>
    </button>
  );
}

// -------- Booking form with live recalculation --------

function QuickBookingForm() {
  const { from, to, tariff, location, setFrom, setTo, setTariff, setLocation } = useHomeBooking();

  const tariffInfo = getTariff(tariff);
  const days = daysBetween(from, to);

  const { available } = useMemo(() => splitAvailability(cars, from, to), [from, to]);

  const prices = useMemo(() => {
    if (!available.length) return null;
    const values = available.map((c) => Math.round(c.pricePerDay * tariffInfo.multiplier));
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [available, tariffInfo.multiplier]);

  const totalRange = prices && days > 0 ? { min: prices.min * days, max: prices.max * days } : null;

  return (
    <div className="relative w-full rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur md:p-5 md:neon-glow">
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Быстрое бронирование</p>
        <h3 className="mt-0.5 font-display text-lg font-bold md:text-xl">Найдите свой авто</h3>
      </div>

      <div className="space-y-2.5">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Место получения
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full">
              <MapPin className="mr-1 h-4 w-4 text-accent" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <DateField label="Получение" value={from} onChange={setFrom} />
          <DateField label="Возврат" value={to} onChange={setTo} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Тариф
          </label>
          <Select value={tariff} onValueChange={(v) => setTariff(v as BookingTariff)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tariffs.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title} · {t.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Live summary */}
        <div className="rounded-xl border border-border bg-muted/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Свободно</span>
            <span className="font-bold">
              <span className={cn(available.length > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
                {available.length}
              </span>
              <span className="text-muted-foreground"> / {cars.length} авто</span>
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Срок</span>
            <span className="font-bold">
              {days > 0 ? `${days} ${days === 1 ? "сутки" : "суток"}` : "выберите даты"}
            </span>
          </div>
          {prices && (
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Цена ({tariffInfo.title})</span>
              <span className="font-bold">
                от {formatRub(prices.min)}<span className="text-muted-foreground"> / сутки</span>
              </span>
            </div>
          )}
          {totalRange && (
            <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Итого</span>
              <span className="font-display text-base font-black text-primary">
                {totalRange.min === totalRange.max
                  ? formatRub(totalRange.min)
                  : `${formatRub(totalRange.min)} – ${formatRub(totalRange.max)}`}
              </span>
            </div>
          )}
        </div>

        <Button asChild size="lg" className="mt-1 w-full gap-2 font-bold uppercase tracking-wider md:pulse-glow">
          <Link to="/cars">
            <Search className="h-4 w-4" />
            Найти авто
            <ArrowRight className="ml-auto h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const dateValue = value ? parseISO(value) : undefined;
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start px-2.5 text-left text-xs font-normal",
              !dateValue && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-1 h-3.5 w-3.5 text-accent" />
            {dateValue ? format(dateValue, "d MMM", { locale: ru }) : "Дата"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(d) => onChange(d ? d.toISOString().slice(0, 10) : undefined)}
            initialFocus
            className={cn("pointer-events-auto p-3")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
