import type { Booking, Car, DashboardStats } from "@/types/domain";
import { clients } from "@/mocks/clients";
import { payments } from "@/mocks/payments";

/** Builds dashboard KPI from the live catalog and bookings. */
export function buildDashboardStats(cars: Car[], bookings: Booking[]): DashboardStats {
  const activeToday = bookings.filter((b) => b.status === "active" || b.status === "paid");
  const revenueToday = payments
    .filter((p) => p.status === "success")
    .slice(0, 3)
    .reduce((sum, p) => sum + p.amount, 0);

  const countStatus = (status: string) =>
    cars.filter((c) => (c.status ?? "free") === status).length;

  return {
    bookingsToday: activeToday.length,
    bookingsDelta: 2,
    revenueToday,
    revenueDelta: 3400,
    carsTotal: cars.length,
    clientsTotal: clients.length,
    fleetStatus: {
      free: countStatus("free"),
      busy: countStatus("busy"),
      washing: countStatus("washing"),
      maintenance: countStatus("maintenance"),
    },
  };
}
