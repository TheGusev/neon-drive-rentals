import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowRight, CalendarIcon, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useBookings, useCars } from "@/state/AppDataContext";
import { tariffs, getTariff } from "@/mocks/tariffs";
import type { BookingTariff } from "@/types/domain";
import { useHomeBooking } from "./HomeBookingContext";
import { splitAvailability } from "@/lib/availability";
import { daysBetween, formatRub } from "@/lib/bookingDraft";
import { PICKUP_POINT } from "@/mocks/pickupPoints";

/** Тяжёлый виджет (календарь + расчёт цены) — грузится лениво при открытии панели. */
export default function QuickBookingForm() {
  const { from, to, tariff, setFrom, setTo, setTariff } = useHomeBooking();

  const tariffInfo = getTariff(tariff);
  const days = daysBetween(from, to);

  const cars = useCars();
  const bookings = useBookings();
  const { available } = useMemo(
    () => splitAvailability(cars, from, to, bookings),
    [cars, from, to, bookings],
  );

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
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Быстрое бронирование
        </p>
        <h3 className="mt-0.5 font-display text-lg font-bold md:text-xl">Найдите свой авто</h3>
      </div>

      <div className="space-y-2.5">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Место получения
          </label>
          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight">{PICKUP_POINT.address}</p>
              <p className="text-[10px] text-muted-foreground">
                Единственный пункт выдачи · {PICKUP_POINT.hours}
              </p>
            </div>
          </div>
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
              <span
                className={cn(
                  available.length > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive",
                )}
              >
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
                от {formatRub(prices.min)}
                <span className="text-muted-foreground"> / сутки</span>
              </span>
            </div>
          )}
          {totalRange && (
            <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Итого
              </span>
              <span className="font-display text-base font-black text-primary">
                {totalRange.min === totalRange.max
                  ? formatRub(totalRange.min)
                  : `${formatRub(totalRange.min)} – ${formatRub(totalRange.max)}`}
              </span>
            </div>
          )}
        </div>

        {days > 0 && available.length > 0 && (
          <div className="space-y-1.5 rounded-xl border border-border bg-background/60 p-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Свободны на эти даты
            </p>
            {available.slice(0, 3).map((car) => (
              <div
                key={car.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2 py-1.5"
              >
                <span className="min-w-0 truncate text-xs font-semibold">
                  {car.brand} {car.model}
                </span>
                <Button asChild size="sm" className="h-7 shrink-0 px-2 text-[11px]">
                  <Link
                    to="/booking/$carId"
                    params={{ carId: car.id }}
                    search={{ from, to, tariff }}
                  >
                    Забронировать
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          asChild
          size="lg"
          className="mt-1 w-full gap-2 font-bold uppercase tracking-wider md:pulse-glow"
        >
          <Link to="/cars" search={{ from, to }}>
            <Search className="h-4 w-4" />
            Найти автомобиль
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
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
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
