import type { Booking } from "@/types/domain";

export const bookings: Booking[] = [
  { id: "bk-001", carId: "honda-nbox", clientId: "cl-001", startDate: "2025-05-24T10:00:00Z", endDate: "2025-05-27T10:00:00Z", totalPrice: 7200, status: "active", pickupAddress: "Новосибирск, ул. Красный проспект, 28", contractStatus: "signed" },
  { id: "bk-002", carId: "suzuki-alto-works", clientId: "cl-002", startDate: "2025-05-14T09:00:00Z", endDate: "2025-05-14T19:00:00Z", totalPrice: 2200, status: "paid" },
  { id: "bk-003", carId: "mazda-flair-wagon", clientId: "cl-003", startDate: "2025-05-15T10:00:00Z", endDate: "2025-05-15T20:00:00Z", totalPrice: 3800, status: "pending" },
  { id: "bk-h1", carId: "nissan-dayz", clientId: "cl-001", startDate: "2025-04-10T10:00:00Z", endDate: "2025-04-14T10:00:00Z", totalPrice: 10000, status: "completed", pickupAddress: "Новосибирск, аэропорт Толмачёво" },
  { id: "bk-h2", carId: "suzuki-wagon-r", clientId: "cl-001", startDate: "2025-03-01T09:00:00Z", endDate: "2025-03-03T09:00:00Z", totalPrice: 4400, status: "completed", pickupAddress: "Новосибирск, ул. Ленина, 12" },
  { id: "bk-h3", carId: "daihatsu-move-custom", clientId: "cl-001", startDate: "2025-01-20T12:00:00Z", endDate: "2025-01-25T12:00:00Z", totalPrice: 11500, status: "completed", pickupAddress: "Новосибирск, ул. Красный проспект, 28" },
];

export const getBookingById = (id: string) => bookings.find((b) => b.id === id);
