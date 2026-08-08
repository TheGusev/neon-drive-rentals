import type { Booking } from "@/types/domain";

export const mockBookings: Booking[] = [
  { id: "bk-001", carId: "honda-n-wgn-white", clientId: "cl-001", startDate: "2026-08-08T10:00:00Z", endDate: "2026-08-11T10:00:00Z", totalPrice: 5700, status: "active", pickupAddress: "Новосибирск, ул. Доватора, 11", contractStatus: "signed" },
  { id: "bk-002", carId: "honda-n-wgn-black-2", clientId: "cl-002", startDate: "2026-08-09T09:00:00Z", endDate: "2026-08-10T19:00:00Z", totalPrice: 4400, status: "paid" },
  { id: "bk-003", carId: "honda-n-wgn-grey-1", clientId: "cl-003", startDate: "2026-08-12T10:00:00Z", endDate: "2026-08-14T20:00:00Z", totalPrice: 5400, status: "pending" },
  { id: "bk-004", carId: "nissan-dayz-grey", clientId: "cl-006", startDate: "2026-08-20T10:00:00Z", endDate: "2026-08-21T10:00:00Z", totalPrice: 1900, status: "paid" },
  { id: "bk-005", carId: "daihatsu-mira-es-black-2", clientId: "cl-004", startDate: "2026-08-15T12:00:00Z", endDate: "2026-08-17T12:00:00Z", totalPrice: 3800, status: "pending" },
  { id: "bk-h1", carId: "nissan-dayz-white-1", clientId: "cl-001", startDate: "2026-06-10T10:00:00Z", endDate: "2026-06-14T10:00:00Z", totalPrice: 8000, status: "completed", pickupAddress: "Новосибирск, ул. Доватора, 11" },
  { id: "bk-h2", carId: "suzuki-alto-white", clientId: "cl-001", startDate: "2026-05-01T09:00:00Z", endDate: "2026-05-03T09:00:00Z", totalPrice: 3600, status: "completed", pickupAddress: "Новосибирск, ул. Доватора, 11" },
  { id: "bk-h3", carId: "honda-n-box-black", clientId: "cl-001", startDate: "2026-03-20T12:00:00Z", endDate: "2026-03-25T12:00:00Z", totalPrice: 11500, status: "completed", pickupAddress: "Новосибирск, ул. Доватора, 11" },
];

export const bookings = mockBookings;

export const getBookingById = (id: string) => mockBookings.find((b) => b.id === id);
