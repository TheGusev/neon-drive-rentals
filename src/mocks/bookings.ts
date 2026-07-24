import type { Booking } from "@/types/domain";

export const bookings: Booking[] = [
  { id: "bk-001", carId: "honda-nbox", clientId: "cl-001", startDate: "2025-05-24T10:00:00Z", endDate: "2025-05-27T10:00:00Z", totalPrice: 7200, status: "active" },
  { id: "bk-002", carId: "suzuki-alto-works", clientId: "cl-002", startDate: "2025-05-14T09:00:00Z", endDate: "2025-05-14T19:00:00Z", totalPrice: 2200, status: "paid" },
  { id: "bk-003", carId: "mazda-flair-wagon", clientId: "cl-003", startDate: "2025-05-15T10:00:00Z", endDate: "2025-05-15T20:00:00Z", totalPrice: 3800, status: "pending" },
];

export const getBookingById = (id: string) => bookings.find((b) => b.id === id);
