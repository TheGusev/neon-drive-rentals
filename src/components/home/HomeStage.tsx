import { Suspense, lazy, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarIcon,
  Clock,
  Search,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useBookings, useCars } from "@/state/AppDataContext";
import { HomeBookingProvider, useHomeBooking } from "./HomeBookingContext";
import { splitAvailability } from "@/lib/availability";
import { HeroBackdrop } from "./HeroBackdrop";
import { SeoTiles } from "./SeoTiles";
import { GarageShowcase } from "./GarageShowcase";

/** Календарь + форма расчёта не нужны при первом рендере — грузим по клику.
 *  На слабой сети (Safari/iOS) первая попытка загрузки чанка может сорваться,
 *  поэтому повторяем её дважды, прежде чем показывать ошибку. */
const QuickBookingForm = lazy(() => retryImport(() => import("./QuickBookingForm")));

async function retryImport<T>(load: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await load();
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastError;
}

function BookingFormSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-3 rounded-2xl border border-border bg-card/95 p-4">
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="h-14 rounded bg-muted" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
      <div className="h-10 rounded bg-muted" />
      <div className="h-24 rounded bg-muted" />
      <div className="h-11 rounded bg-muted" />
    </div>
  );
}

const benefits = [
  { icon: Wallet, title: "Честные цены", text: "без переплат" },
  { icon: Clock, title: "Поддержка 24/7", text: "всегда на связи" },
  { icon: Sparkles, title: "Онлайн за 3 мин", text: "быстрое бронирование" },
  { icon: Wrench, title: "JDM качество", text: "авто из Японии" },
];

// -------- Desktop --------

export function HomeDesktop({ heroImage }: { heroImage: string }) {
  return (
    <HomeBookingProvider>
      <HomeDesktopInner heroImage={heroImage} />
    </HomeBookingProvider>
  );
}

function HomeDesktopInner({ heroImage: _heroImage }: { heroImage: string }) {
  const { from, to } = useHomeBooking();

  const cars = useCars();
  const bookings = useBookings();
  const { available } = useMemo(
    () => splitAvailability(cars, from, to, bookings),
    [cars, from, to, bookings],
  );

  return (
    <div className="relative min-h-[100svh] overflow-x-hidden">
      <HeroBackdrop />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col">
        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-5 px-6 pt-4">
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
              Правый руль, честные цены, ключи за 3 минуты. Выдача авто на ул. Доватора, 11.
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
                    <Suspense fallback={<BookingFormSkeleton />}>
                      <QuickBookingForm />
                    </Suspense>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Garage picker */}
        <div className="rise-in shrink-0 pt-2" style={{ animationDelay: "700ms" }}>
          <GarageShowcase />
        </div>


        {/* SEO tiles */}
        <div className="shrink-0 pb-3 pt-2">
          <SeoTiles />
        </div>
      </div>

    </div>
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
  const { from, to } = useHomeBooking();
  const cars = useCars();
  const bookings = useBookings();
  const { available } = useMemo(
    () => splitAvailability(cars, from, to, bookings),
    [cars, from, to, bookings],
  );

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-background text-foreground">
      <HeroBackdrop />

      {/* Menu + theme controls live in HomeControls (single fixed row) */}


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
              <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto rounded-t-2xl bg-background p-5 text-foreground">
                <div className="pt-2">
                  <Suspense fallback={<BookingFormSkeleton />}>
                    <QuickBookingForm />
                  </Suspense>
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

        {/* Garage picker */}
        <div className="rise-in -mx-4 mt-5" style={{ animationDelay: "680ms" }}>
          <GarageShowcase compact />
        </div>


        {/* SEO tiles — full-bleed 2-cols */}
        <div className="rise-in mt-5" style={{ animationDelay: "820ms" }}>
          <SeoTiles />
        </div>
      </div>

    </div>
  );
}
