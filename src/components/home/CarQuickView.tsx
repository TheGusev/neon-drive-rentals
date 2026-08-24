import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Fuel, Gauge, Info, Shield, Users, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Car } from "@/types/domain";
import { getTariff, tariffs } from "@/mocks/tariffs";
import { PICKUP_POINT } from "@/mocks/pickupPoints";
import { useHomeBooking } from "./HomeBookingContext";
import { calcPrice, daysBetween, formatRub } from "@/lib/bookingDraft";
import { isCarAvailable, nextBusyUntil } from "@/lib/availability";
import { useBookings } from "@/state/AppDataContext";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BookingConfirmDialog } from "./BookingConfirmDialog";
import { CarImage } from "@/components/car/CarImage";


interface Props {
  car: Car | null;
  onClose: () => void;
}

export function CarQuickView({ car, onClose }: Props) {
  const { from, to, tariff } = useHomeBooking();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const open = !!car && !confirmOpen;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && !confirmOpen && onClose()}>
        <DialogContent className="max-w-2xl overflow-hidden p-0 sm:rounded-2xl">
          {car && (
            <QuickBody
              car={car}
              from={from}
              to={to}
              tariff={tariff}
              onOrder={() => setConfirmOpen(true)}
            />
          )}
        </DialogContent>
      </Dialog>
      <BookingConfirmDialog
        open={confirmOpen}
        car={car}
        from={from}
        to={to}
        tariff={tariff}
        locationLabel={PICKUP_POINT.address}
        onClose={() => {
          setConfirmOpen(false);
          onClose();
        }}
      />
    </>
  );
}


function QuickBody({
  car,
  from,
  to,
  tariff,
  onOrder,
}: {
  car: Car;
  from: string | undefined;
  to: string | undefined;
  tariff: ReturnType<typeof useHomeBooking>["tariff"];
  onOrder: () => void;
}) {

  const bookings = useBookings();
  const available = isCarAvailable(car, from, to, bookings);
  const busyUntil = !available ? nextBusyUntil(car, bookings) : null;
  const tariffInfo = getTariff(tariff);
  const days = daysBetween(from, to);
  const price = calcPrice({
    pricePerDay: car.pricePerDay,
    deposit: car.deposit ?? 0,
    draft: { startDate: from, endDate: to, tariff },
    tariffMultiplier: tariffInfo.multiplier,
  });
  const pricePerDayInTariff = Math.round(car.pricePerDay * tariffInfo.multiplier);

  return (
    <div className="flex max-h-[85vh] flex-col overflow-y-auto">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <CarImage
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge variant="secondary" className="uppercase tracking-wider">
            {car.class === "sport" ? "Sport" : "Econom"}
          </Badge>
          {available ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 public-dark:text-emerald-400 hover:bg-emerald-500/15">
              Свободно на даты
            </Badge>
          ) : (
            <Badge variant="destructive">
              Занято{busyUntil ? ` до ${format(busyUntil, "d MMM", { locale: ru })}` : ""}
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-foreground">
          <div>
            <p className="font-display text-2xl font-black leading-tight md:text-3xl">
              {car.brand} {car.model}
            </p>
            <p className="text-xs text-muted-foreground">{car.year} · {car.transmission} · {car.engineVolume} л</p>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{car.brand} {car.model}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Spec icon={Zap} label="Мощность" value={`${car.power} л.с.`} />
          <Spec icon={Gauge} label="Крутящий" value={`${car.torque} Н·м`} />
          <Spec icon={Fuel} label="Расход" value={`${car.consumption} л`} />
          <Spec icon={Users} label="Мест" value={`${car.seats ?? 4}`} />
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Тариф · {tariffInfo.title}
              </p>
              <p className="mt-1 font-display text-2xl font-black">
                {formatRub(pricePerDayInTariff)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">/ сутки</span>
              </p>
            </div>
            {days > 0 && from && to && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {days} {days === 1 ? "сутки" : "суток"}
                </p>
                <p className="mt-1 font-display text-2xl font-black text-[color:var(--neon-orange,theme(colors.primary))]">
                  {formatRub(price.rental)}
                </p>
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" />Депозит {formatRub(car.deposit ?? 0)}</span>
            <span>·</span>
            <span>Лимит {car.mileageLimit ?? 250} км/сутки</span>
            <span>·</span>
            <span>{car.fuelPolicy}</span>
          </div>
        </div>

        {!available && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Автомобиль занят на выбранные даты{busyUntil ? ` до ${format(busyUntil, "d MMMM yyyy", { locale: ru })}` : ""}.
              Выберите другой период или похожую модель.
            </span>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline">
            <Link to="/cars/$carId" params={{ carId: car.id }}>
              Все характеристики
            </Link>
          </Button>
          <Button
            type="button"
            disabled={!available}
            onClick={onOrder}
            className="gap-2 font-bold uppercase tracking-wider"
          >
            Заказать аренду <ArrowRight className="h-4 w-4" />
          </Button>

        </div>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 font-display text-sm font-bold">{value}</p>
    </div>
  );
}

// Re-export tariffs so downstream can select from the same source
export { tariffs };
