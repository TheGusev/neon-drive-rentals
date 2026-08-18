import type { Booking, Car } from "@/types/domain";

/** Booking statuses that block a car for overlapping dates. */
const BLOCKING_STATUSES: Booking["status"][] = ["paid", "pending", "active"];

/** Returns bookings that overlap the requested [from, to) window for a given car. */
export function getConflictingBookings(
  carId: string,
  from: string | undefined,
  to: string | undefined,
  bookingList: Booking[],
): Booking[] {
  if (!from || !to) return [];
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  return bookingList
    .filter(
      (b) =>
        b.carId === carId &&
        BLOCKING_STATUSES.includes(b.status) &&
        overlaps(start, end, new Date(b.startDate), new Date(b.endDate)),
    )
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}



/** True if [aStart,aEnd) intersects [bStart,bEnd). */
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Statuses that make a car unavailable regardless of dates. */
const HARD_BLOCK_STATUSES: Car["status"][] = ["maintenance", "washing"];

export function isCarAvailable(
  car: Car,
  from: string | undefined,
  to: string | undefined,
  bookingList: Booking[],
): boolean {
  if (HARD_BLOCK_STATUSES.includes(car.status)) return false;
  if (!from || !to) return car.status !== "busy";

  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return car.status !== "busy";
  }

  const conflict = bookingList.some((b) => {
    if (b.carId !== car.id) return false;
    if (b.status === "cancelled" || b.status === "completed") return false;
    return overlaps(start, end, new Date(b.startDate), new Date(b.endDate));
  });
  return !conflict;
}

export function splitAvailability(
  list: Car[],
  from: string | undefined,
  to: string | undefined,
  bookingList: Booking[],
): { available: Car[]; busy: Car[] } {
  const available: Car[] = [];
  const busy: Car[] = [];
  for (const car of list) {
    if (isCarAvailable(car, from, to, bookingList)) available.push(car);
    else busy.push(car);
  }
  return { available, busy };
}

/** Returns end date of the closest active/paid booking that blocks the car, or null. */
export function nextBusyUntil(
  car: Car,
  bookingList: Booking[],
): Date | null {
  const now = Date.now();
  const upcoming = bookingList
    .filter(
      (b) =>
        b.carId === car.id &&
        b.status !== "cancelled" &&
        b.status !== "completed" &&
        new Date(b.endDate).getTime() >= now,
    )
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  return upcoming.length ? new Date(upcoming[0].endDate) : null;
}
