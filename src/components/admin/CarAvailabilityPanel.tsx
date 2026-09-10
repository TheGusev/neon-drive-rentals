import { useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminBookingRowsQueryOptions } from "@/lib/queries";
import type { AdminBookingRow, Car } from "@/types/domain";

const fmt = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

const DAY = 86_400_000;

/** Брони, которые реально занимают авто. */
const BLOCKING = new Set(["pending", "paid", "active"]);

/** Свободные окна между занятыми периодами на ближайшие 90 дней. */
function freeWindows(busy: AdminBookingRow[]): { from: Date; to: Date }[] {
  const horizonStart = new Date();
  const horizonEnd = new Date(Date.now() + 90 * DAY);
  const windows: { from: Date; to: Date }[] = [];
  let cursor = horizonStart;

  for (const b of busy) {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    if (end <= cursor) continue;
    if (start.getTime() - cursor.getTime() > DAY) {
      windows.push({ from: new Date(cursor), to: start });
    }
    if (end > cursor) cursor = end;
  }
  if (horizonEnd.getTime() - cursor.getTime() > DAY) {
    windows.push({ from: new Date(cursor), to: horizonEnd });
  }
  return windows.slice(0, 4);
}

const toInput = (d: Date) => d.toISOString().slice(0, 10);

/** Занятость авто: список броней «с какого по какое» и свободные окна. */
export function CarAvailabilityPanel({ car }: { car: Car }) {
  const navigate = useNavigate();
  const { data: bookings } = useSuspenseQuery(adminBookingRowsQueryOptions());

  const busy = bookings
    .filter(
      (b) =>
        b.carId === car.id &&
        BLOCKING.has(b.status) &&
        new Date(b.endDate).getTime() >= Date.now() - DAY,
    )
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const windows = freeWindows(busy);

  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <CalendarRange className="h-4 w-4 text-muted-foreground" /> Занятость
      </h3>

      {busy.length === 0 ? (
        <p className="text-xs text-muted-foreground">Ближайших броней нет — авто свободно.</p>
      ) : (
        <ul className="space-y-1.5">
          {busy.map((b) => (
            <li
              key={b.id}
              className="admin-nums flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-xs"
            >
              <span className="truncate">
                {fmt(b.startDate)} — {fmt(b.endDate)}
              </span>
              <span className="shrink-0 text-muted-foreground">{b.clientName}</span>
            </li>
          ))}
        </ul>
      )}

      {windows.length > 0 && (
        <>
          <p className="pt-1 text-xs font-medium text-muted-foreground">Свободные даты</p>
          <div className="flex flex-wrap gap-2">
            {windows.map((w) => (
              <Button
                key={w.from.toISOString()}
                variant="outline"
                size="sm"
                className="admin-nums"
                onClick={() =>
                  navigate({
                    to: "/booking/$carId",
                    params: { carId: car.id },
                    search: { from: toInput(w.from), to: toInput(w.to) },
                  })
                }
              >
                {fmt(w.from)} — {fmt(w.to)}
              </Button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
