import { SectionCard } from "@/components/checkout/SectionCard";
import { bookings } from "@/mocks/bookings";
import { getCarById } from "@/mocks/cars";
import { currentClient } from "@/mocks/profile";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

export function BookingHistoryList() {
  const history = bookings.filter((b) => b.clientId === currentClient.id && b.status === "completed");

  return (
    <SectionCard title="История бронирований">
      {history.length === 0 ? (
        <p className="text-sm text-slate-500">Завершённых поездок пока нет.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((b) => {
            const car = getCarById(b.carId);
            if (!car) return null;
            return (
              <li key={b.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {car.image && <img src={car.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">{car.brand} {car.model}</div>
                  <div className="text-xs text-slate-500">{fmt(b.startDate)} — {fmt(b.endDate)}</div>
                </div>
                <div className="text-right text-sm font-semibold text-slate-900 whitespace-nowrap">
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
