import { CalendarDays, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Booking, Car } from "@/types/domain";
import { CarImage } from "@/components/car/CarImage";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusLabel = {
  signed: "Подписан",
  pending: "Ожидает подписи",
  none: "Не оформлен",
} as const;
const statusTone = {
  signed: "bg-emerald-500/15 text-emerald-600 public-dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 public-dark:text-amber-400",
  none: "bg-muted text-muted-foreground",
} as const;

export function CurrentRentalCard({ booking, car }: { booking: Booking; car: Car }) {
  const cs = booking.contractStatus ?? "none";
  return (
    <SectionCard title="Текущая аренда" className="bg-card ring-1 ring-border">
      <div className="flex gap-4">
        <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-muted">
          <CarImage
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <div className="truncate text-base font-semibold text-foreground">
              {car.brand} {car.model}
            </div>
            <Badge className="shrink-0 border-0 bg-emerald-500/15 font-medium text-emerald-600 public-dark:text-emerald-400">
              Активна
            </Badge>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Договор № {booking.id.toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground">
            {car.year} · {car.transmission}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            <Badge className={`${statusTone[cs]} border-0 font-medium`}>
              Договор: {statusLabel[cs]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl bg-muted p-3 text-sm">
        <div className="flex items-start gap-2 text-foreground/80">
          <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <div>
              Выдача: <span className="font-medium">{fmt(booking.startDate)}</span>
            </div>
            <div>
              Возврат: <span className="font-medium">{fmt(booking.endDate)}</span>
            </div>
          </div>
        </div>
        {booking.pickupAddress && (
          <div className="flex items-start gap-2 text-foreground/80">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span className="min-w-0 flex-1">{booking.pickupAddress}</span>
            <a
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(booking.pickupAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-accent ring-1 ring-border"
            >
              <Navigation className="h-3.5 w-3.5" /> Маршрут
            </a>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border/60 pt-2 text-foreground/80">
          <span>Сумма аренды</span>
          <span className="font-semibold text-foreground">
            {booking.totalPrice.toLocaleString("ru-RU")} ₽
          </span>
        </div>
      </div>

      <Button
        variant="accent"
        size="xl"
        className="mt-4 w-full"
        onClick={() => toast("Продление аренды скоро появится")}
      >
        Продлить аренду
      </Button>
    </SectionCard>
  );
}
