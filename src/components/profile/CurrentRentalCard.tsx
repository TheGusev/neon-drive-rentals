import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/checkout/SectionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Booking, Car } from "@/types/domain";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const statusLabel = { signed: "Подписан", pending: "Ожидает подписи", none: "Не оформлен" } as const;
const statusTone = { signed: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", none: "bg-muted text-muted-foreground" } as const;

export function CurrentRentalCard({ booking, car }: { booking: Booking; car: Car }) {
  const cs = booking.contractStatus ?? "none";
  return (
    <SectionCard title="Текущая аренда" className="bg-card ring-1 ring-border">
      <div className="flex gap-4">
        <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-muted">
          {car.image ? (
            <img src={car.image} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Фото</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-foreground">{car.brand} {car.model}</div>
          <div className="text-xs text-muted-foreground">{car.year} · {car.transmission}</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            <Badge className={`${statusTone[cs]} border-0 font-medium`}>Договор: {statusLabel[cs]}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl bg-muted p-3 text-sm">
        <div className="flex items-start gap-2 text-foreground/80">
          <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <div>Выдача: <span className="font-medium">{fmt(booking.startDate)}</span></div>
            <div>Возврат: <span className="font-medium">{fmt(booking.endDate)}</span></div>
          </div>
        </div>
        {booking.pickupAddress && (
          <div className="flex items-start gap-2 text-foreground/80">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>{booking.pickupAddress}</span>
          </div>
        )}
      </div>

      <Button
        className="mt-4 h-12 w-full rounded-2xl bg-accent text-base font-semibold hover:bg-[#1c6fd8]"
        onClick={() => toast("Продление аренды скоро появится")}
      >
        Продлить аренду
      </Button>
    </SectionCard>
  );
}
