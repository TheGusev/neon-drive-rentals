import { Calendar } from "@/components/ui/calendar";
import { bookings as allBookings } from "@/mocks/bookings";
import { eachDayOfInterval, parseISO } from "date-fns";

export function AvailabilityCalendar({ carId }: { carId: string }) {
  const carBookings = allBookings.filter((b) => b.carId === carId);
  const bookedDays = carBookings.flatMap((b) =>
    eachDayOfInterval({ start: parseISO(b.startDate), end: parseISO(b.endDate) }),
  );

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={undefined}
        onSelect={() => undefined}
        modifiers={{ booked: bookedDays }}
        modifiersClassNames={{
          booked: "bg-destructive/20 text-destructive line-through",
        }}
        className="pointer-events-auto rounded-md border border-border p-3"
      />
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-destructive/30 ring-1 ring-destructive/50" />
          Занято
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-muted ring-1 ring-border" />
          Свободно
        </span>
      </div>
    </div>
  );
}
