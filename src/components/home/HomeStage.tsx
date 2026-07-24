import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowRight, CalendarIcon, ChevronLeft, ChevronRight, Clock, Fuel, MapPin, Search, Sparkles, Wallet, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { cars } from "@/mocks/cars";

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

const popular = cars.slice(0, 6);

export function HomeDesktop({ heroImage }: { heroImage: string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollBy = (delta: number) => stripRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  return (
    <div className="relative -mx-4 -my-8 h-[calc(100svh-4.5rem)] overflow-hidden md:-mx-6 md:-my-12 md:h-[calc(100svh-5rem)]">
      {/* Background — full brightness, no dimming */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Ночной драйв кей-кара по неоновому туннелю"
          className="ken-burns h-full w-full object-cover"
        />
        {/* Neon streamers */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { top: "18%", dur: "6s", delay: "0s", color: "var(--neon-blue)" },
            { top: "42%", dur: "9s", delay: "2s", color: "var(--neon-orange)" },
            { top: "68%", dur: "7s", delay: "1s", color: "var(--neon-blue)" },
            { top: "88%", dur: "11s", delay: "3s", color: "var(--neon-orange)" },
          ].map((s, i) => (
            <span
              key={i}
              className="stream-line absolute left-0 h-px w-[35vw]"
              style={{
                top: s.top,
                background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                boxShadow: `0 0 12px ${s.color}, 0 0 24px ${s.color}`,
                animationDuration: s.dur,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* HERO block */}
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-6">
          <p className="rise-in text-[10px] uppercase tracking-[0.5em] text-accent md:text-xs" style={{ animationDelay: "50ms" }}>
            速度を感じる · Nsk · JDM
          </p>
          <h1
            className="rise-in mt-3 font-display text-[13vw] font-black leading-[0.85] tracking-tight md:text-[9vw] xl:text-[150px]"
            style={{ animationDelay: "150ms" }}
          >
            <span className="text-shimmer neon-flicker">NSK-RENT</span>
          </h1>
          <p className="rise-in mt-4 max-w-xl text-base text-foreground/90 drop-shadow md:text-lg" style={{ animationDelay: "280ms" }}>
            Аренда японских кей-каров в Новосибирске. Правый руль, честные цены, ключи за 3 минуты.
          </p>

          <div className="rise-in mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground/80" style={{ animationDelay: "380ms" }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[color:var(--neon-blue)] shadow-[0_0_10px_var(--neon-blue)]" />
              12 авто свободно сейчас
            </span>
            <span className="opacity-40">·</span>
            <span>от 2 100 ₽ / сутки</span>
          </div>

          {/* CTAs */}
          <div className="rise-in mt-6 flex flex-wrap gap-3" style={{ animationDelay: "460ms" }}>
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
                  className="gap-2 border-accent/60 bg-background/40 font-bold uppercase tracking-wider backdrop-blur hover:border-accent hover:bg-background/60"
                >
                  <CalendarIcon className="h-4 w-4 text-accent" />
                  Быстрое бронирование
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
                <div className="pt-6">
                  <QuickBookingCompact />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Benefits */}
          <div className="rise-in mt-8 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4" style={{ animationDelay: "560ms" }}>
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur transition hover:border-accent/60 hover:neon-glow"
              >
                <b.icon className="h-5 w-5 shrink-0 text-[color:var(--neon-orange)] transition-transform group-hover:scale-110" />
                <div className="min-w-0">
                  <p className="truncate font-display text-xs font-bold md:text-sm">{b.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground md:text-xs">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular strip — extends to right edge */}
        <div className="rise-in shrink-0 pb-4 pt-2" style={{ animationDelay: "700ms" }}>
          <div className="mx-auto mb-3 flex max-w-7xl items-end justify-between gap-4 px-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Каталог</p>
              <p className="font-display text-lg font-black md:text-2xl">
                Популярные <span className="text-[color:var(--neon-blue)]">модели</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => scrollBy(-320)}
                aria-label="Прокрутить влево"
                className="h-9 w-9 border-border/70 bg-card/60 backdrop-blur hover:border-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => scrollBy(320)}
                aria-label="Прокрутить вправо"
                className="h-9 w-9 border-border/70 bg-card/60 backdrop-blur hover:border-accent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="sm" className="ml-2 gap-1 text-accent hover:text-accent">
                <Link to="/cars">Все <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </div>

          <div
            ref={stripRef}
            className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2 pr-6"
            style={{ paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))" }}
          >
            {popular.map((car) => (
              <Link
                key={car.id}
                to="/cars/$carId"
                params={{ carId: car.id }}
                className="group relative flex h-[220px] w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border/60 bg-card/70 backdrop-blur transition hover:-translate-y-1 hover:border-accent hover:neon-glow"
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
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold">{car.brand} {car.model}</p>
                    <p className="text-[10px] text-muted-foreground">
                      <Fuel className="mr-0.5 inline h-2.5 w-2.5" />{car.consumption}л · {car.transmission}
                    </p>
                  </div>
                  <span className="font-display text-base font-black text-[color:var(--neon-orange)]">
                    {car.pricePerDay.toLocaleString("ru-RU")}₽
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeMobile({ heroImage }: { heroImage: string }) {
  return (
    <div className="-mx-4 -mt-8 flex min-h-[calc(100svh-4rem)] flex-col gap-4 px-4 pb-4 pt-6">
      {/* Hero card */}
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
          <p className="mt-2 text-sm text-white/85">Японские кей-кары в Новосибирске</p>
        </div>
      </div>

      {/* Booking */}
      <div className="rise-in" style={{ animationDelay: "120ms" }}>
        <QuickBookingCompact />
      </div>

      {/* Benefit chips */}
      <div className="no-scrollbar rise-in -mx-4 flex gap-2 overflow-x-auto px-4" style={{ animationDelay: "220ms" }}>
        {benefits.map((b) => (
          <div key={b.title} className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-sm">
            <b.icon className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">{b.title}</span>
          </div>
        ))}
      </div>

      {/* Popular strip */}
      <div className="rise-in" style={{ animationDelay: "320ms" }}>
        <div className="mb-2 flex items-end justify-between">
          <p className="font-display text-base font-black">Популярные модели</p>
          <Link to="/cars" className="text-xs font-semibold text-primary">Все →</Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {popular.map((car) => (
            <Link
              key={car.id}
              to="/cars/$carId"
              params={{ carId: car.id }}
              className="snap-start w-[180px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm active:scale-[0.98]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={car.image} alt={`${car.brand} ${car.model}`} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-900">
                  {car.class === "sport" ? "Sport" : "Econom"}
                </span>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-bold">{car.brand} {car.model}</p>
                <p className="mt-0.5 text-[11px] font-bold text-primary">
                  {car.pricePerDay.toLocaleString("ru-RU")} ₽<span className="font-normal text-muted-foreground">/сутки</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickBookingCompact() {
  const [pickup, setPickup] = useState<Date>();
  const [ret, setRet] = useState<Date>();
  const [loc, setLoc] = useState("airport");

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
          <Select value={loc} onValueChange={setLoc}>
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
          <DateField label="Получение" value={pickup} onChange={setPickup} />
          <DateField label="Возврат" value={ret} onChange={setRet} />
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
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start px-2.5 text-left text-xs font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-1 h-3.5 w-3.5 text-accent" />
            {value ? format(value, "d MMM", { locale: ru }) : "Дата"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn("pointer-events-auto p-3")} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
