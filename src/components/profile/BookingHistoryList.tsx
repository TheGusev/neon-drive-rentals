import { SectionCard } from "@/components/checkout/SectionCard";
import { useBookings, useCarLookup } from "@/state/AppDataContext";
import { currentClient } from "@/mocks/profile";
import type { Booking } from "@/types/domain";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

export function BookingHistoryList({ items }: { items?: Booking[] }) {
  const fallback = useBookings();
  const getCarById = useCarLookup();
  const source = items ?? fallback.filter((b) => b.clientId === currentClient.id);
  const history = source.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <SectionCard title="История бронирований">
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">Завершённых поездок пока нет.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((b) => {
            const car = getCarById(b.carId);
            if (!car) return null;
            return (
              <li key={b.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
                <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  {car.image && <img src={car.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{car.brand} {car.model}</div>
                  <div className="text-xs text-muted-foreground">{fmt(b.startDate)} — {fmt(b.endDate)}</div>
                </div>
                <div className="text-right text-sm font-semibold text-foreground whitespace-nowrap">
                  {b.totalPrice.toLocaleString("ru-RU")} ₽
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
