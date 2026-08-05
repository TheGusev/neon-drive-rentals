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
  Menu,
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
    <div className="relative min-h-[100svh] overflow-x-hidden">
      <HeroBackdrop />

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100svh-5rem)] flex-col">
        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-5 px-6 pt-4 xl:grid-cols-[280px_1fr] xl:gap-8">
          {/* Left: NFS-style menu — column on xl, chip row below */}
          <NfsSideMenu className="hidden xl:flex" />
          <NfsSideMenu orientation="horizontal" className="-mx-6 px-6 xl:hidden" />

          {/* Middle: title + copy + CTAs */}
          <div className="max-w-2xl">
            <p className="rise-in text-[10px] uppercase tracking-[0.5em] text-[color:var(--neon-blue)] drop-shadow" style={{ animationDelay: "50ms" }}>
              速度を感じる · Nsk · JDM
            </p>

            <div className="rise-in mt-2" style={{ animationDelay: "150ms" }}>
              <p className="font-display text-[clamp(2.75rem,6vw,6.5rem)] font-black leading-[0.9] tracking-tight">
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
        "group relative flex h-[180px] w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border/60 bg-card/70 text-left backdrop-blur transition hover:-translate-y-1 hover:border-accent hover:neon-glow sm:h-[200px] sm:w-[270px] xl:h-[220px] xl:w-[300px]",
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

function HomeMobileInner({ heroImage: _heroImage }: { heroImage: string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [quickCar, setQuickCar] = useState<Car | null>(null);
  const { from, to } = useHomeBooking();
  const { available } = useMemo(() => splitAvailability(cars, from, to), [from, to]);

  const scrollBy = (delta: number) => stripRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  return (
    <div className="nfs-theme relative min-h-[100svh] overflow-hidden bg-background text-foreground">
      <HeroBackdrop />

      {/* Top overlay bar: hamburger menu (does not shift layout) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-end px-3 pt-[calc(max(env(safe-area-inset-top),0.5rem)+2.5rem)]">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              aria-label="Меню"
              className="menu-pulse pointer-events-auto h-14 w-14 rounded-2xl border-2 border-accent/70 bg-background/85 shadow-[0_0_24px_color-mix(in_oklab,var(--neon-blue)_55%,transparent)] backdrop-blur hover:border-accent"
            >
              <Menu className="h-7 w-7 text-accent" />
            </Button>

          </SheetTrigger>
          <SheetContent side="left" className="nfs-theme w-[86vw] max-w-sm overflow-y-auto bg-background p-5 text-foreground">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[color:var(--neon-blue)]">Nsk · JDM</p>
            <p className="mt-1 font-display text-3xl font-black">
              <span className="logo-neon">NSK-RENT</span>
            </p>
            <div className="mt-5">
              <NfsSideMenu />
            </div>
            <nav className="mt-6 flex flex-col gap-1 border-t border-border/60 pt-4">
              {[
                { to: "/", label: "Главная" },
                { to: "/cars", label: "Автопарк" },
                { to: "/profile", label: "Личный кабинет" },
              ].map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-foreground hover:bg-muted"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col px-4 pb-6 pt-[calc(max(env(safe-area-inset-top),0.5rem)+7rem)]">
        {/* Hero copy */}
        <div className="max-w-full">
          <p className="rise-in text-[10px] uppercase tracking-[0.5em] text-[color:var(--neon-blue)] drop-shadow" style={{ animationDelay: "50ms" }}>
            速度を感じる · Nsk · JDM
          </p>
          <div className="rise-in mt-2" style={{ animationDelay: "150ms" }}>
            <p className="font-display text-[56px] font-black leading-[0.9] tracking-tight">
              <span className="logo-neon">NSK-RENT</span>
            </p>
            <h1 className="mt-2 font-display text-lg font-bold leading-tight text-foreground drop-shadow-lg">
              Аренда японских кей-каров в&nbsp;Новосибирске
            </h1>
          </div>

          <p className="rise-in mt-3 text-sm text-foreground/95 drop-shadow-md" style={{ animationDelay: "280ms" }}>
            Правый руль, честные цены, ключи за 3 минуты.
          </p>

          <div className="rise-in mt-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg bg-background/60 px-3 py-2 text-[11px] text-foreground backdrop-blur-md" style={{ animationDelay: "380ms" }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[color:var(--neon-blue)] shadow-[0_0_10px_var(--neon-blue)]" />
              {available.length} авто свободно
            </span>
            <span className="opacity-40">·</span>
            <span>от <b className="text-[color:var(--neon-orange)]">1 800 ₽</b>/сутки</span>
          </div>

          <div className="rise-in mt-4 flex flex-col gap-2" style={{ animationDelay: "460ms" }}>
            <Button asChild size="lg" className="w-full gap-2 font-bold uppercase tracking-wider pulse-glow">
              <Link to="/cars">
                <Search className="h-4 w-4" />
                Найти авто
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 border-accent/60 bg-background/60 font-bold uppercase tracking-wider text-foreground backdrop-blur hover:border-accent hover:bg-background/80"
                >
                  <CalendarIcon className="h-4 w-4 text-accent" />
                  Быстрое бронирование
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="nfs-theme max-h-[92svh] overflow-y-auto rounded-t-2xl bg-background p-5 text-foreground">
                <div className="pt-2">
                  <QuickBookingForm />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Benefits pills strip */}
        <div className="no-scrollbar rise-in -mx-4 mt-5 flex gap-2 overflow-x-auto px-4" style={{ animationDelay: "560ms" }}>
          {benefits.map((b) => (
            <div key={b.title} className="flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[11px] font-semibold text-foreground backdrop-blur">
              <b.icon className="h-3.5 w-3.5 text-[color:var(--neon-blue)]" />
              {b.title}
            </div>
          ))}
        </div>

        {/* Popular strip */}
        <div className="rise-in mt-5" style={{ animationDelay: "680ms" }}>
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-foreground/70">Каталог</p>
              <p className="font-display text-base font-black text-foreground">
                Популярные <span className="text-[color:var(--neon-blue)]">модели</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="icon" variant="outline" onClick={() => scrollBy(-240)} aria-label="Влево" className="h-8 w-8 border-border/70 bg-background/60 backdrop-blur">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => scrollBy(240)} aria-label="Вправо" className="h-8 w-8 border-border/70 bg-background/60 backdrop-blur">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            ref={stripRef}
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
          >
            {popular.map((car) => (
              <StripCard key={car.id} car={car} onOpen={() => setQuickCar(car)} />
            ))}
          </div>
        </div>

        {/* SEO tiles — full-bleed 2-cols */}
        <div className="rise-in mt-5" style={{ animationDelay: "820ms" }}>
          <SeoTiles />
        </div>
      </div>

      <CarQuickView car={quickCar} onClose={() => setQuickCar(null)} />
    </div>
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
