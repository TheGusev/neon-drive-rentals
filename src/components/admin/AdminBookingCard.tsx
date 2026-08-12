import { Eye, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityCard } from "@/components/admin/EntityCard";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import type { Booking, Car, Client } from "@/types/domain";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });

interface Props {
  booking: Booking;
  car?: Car | undefined;
  client?: Client | undefined;
  index: number;
  onView?: () => void;
}

export function AdminBookingCard({ booking, car, client, index, onView }: Props) {
  return (
    <EntityCard index={index}>
      <div className="flex min-w-0 items-start gap-3">
        <div className="aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {car?.image && (
            <img src={car.image} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {car ? `${car.brand} ${car.model}` : booking.carId}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {client?.name ?? booking.clientId}
              </div>
            </div>
            <PaymentStatusBadge status={booking.status} />
          </div>
          <div className="admin-nums mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {fmt(booking.startDate)} — {fmt(booking.endDate)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="admin-nums text-xs text-muted-foreground">№ {booking.id}</span>
        <div className="flex items-center gap-2">
          <span className="admin-nums text-base font-bold">
            {booking.totalPrice.toLocaleString("ru-RU")} ₽
          </span>
          {onView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onView}
              aria-label="Просмотр"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </EntityCard>
  );
}
