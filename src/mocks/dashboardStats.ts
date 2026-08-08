import type { DashboardStats } from "@/types/domain";
import { mockCars } from "@/data/mockCars";
import { mockBookings } from "@/data/mockBookings";
import { clients } from "@/mocks/clients";
import { payments } from "@/mocks/payments";

const activeToday = mockBookings.filter((b) => b.status === "active" || b.status === "paid");
const revenueToday = payments
  .filter((p) => p.status === "success")
  .slice(0, 3)
  .reduce((sum, p) => sum + p.amount, 0);

const countStatus = (status: string) => mockCars.filter((c) => (c.status ?? "free") === status).length;

export const dashboardStats: DashboardStats = {
  bookingsToday: activeToday.length,
  bookingsDelta: 2,
  revenueToday,
  revenueDelta: 3400,
  carsTotal: mockCars.length,
  clientsTotal: clients.length,
  fleetStatus: {
    free: countStatus("free"),
    busy: countStatus("busy"),
    washing: countStatus("washing"),
    maintenance: countStatus("maintenance"),
  },
};
