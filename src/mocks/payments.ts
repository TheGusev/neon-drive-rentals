import type { Payment } from "@/types/domain";

export const payments: Payment[] = [
  { id: "p-001", date: "2026-08-08T10:12:00Z", bookingId: "bk-001", clientId: "cl-001", carId: "honda-n-wgn-white", amount: 5700, method: "card", status: "success" },
  { id: "p-002", date: "2026-08-09T09:30:00Z", bookingId: "bk-002", clientId: "cl-002", carId: "honda-n-wgn-black-2", amount: 4400, method: "sbp", status: "success" },
  { id: "p-003", date: "2026-08-07T10:20:00Z", bookingId: "bk-003", clientId: "cl-003", carId: "honda-n-wgn-grey-1", amount: 5400, method: "card", status: "pending" },
  { id: "p-004", date: "2026-08-06T18:05:00Z", bookingId: "bk-004", clientId: "cl-006", carId: "nissan-dayz-grey", amount: 1900, method: "sbp", status: "success" },
  { id: "p-005", date: "2026-08-05T14:40:00Z", bookingId: "bk-005", clientId: "cl-004", carId: "daihatsu-mira-es-black-2", amount: 5000, method: "card", status: "refunded" },
  { id: "p-006", date: "2026-06-14T11:00:00Z", bookingId: "bk-h1", clientId: "cl-001", carId: "nissan-dayz-white-1", amount: 8000, method: "card", status: "success" },
  { id: "p-007", date: "2026-05-03T09:15:00Z", bookingId: "bk-h2", clientId: "cl-001", carId: "suzuki-alto-white", amount: 3600, method: "sbp", status: "success" },
  { id: "p-008", date: "2026-03-25T12:30:00Z", bookingId: "bk-h3", clientId: "cl-001", carId: "honda-n-box-black", amount: 11500, method: "card", status: "success" },
];

export const getPaymentsByBooking = (bookingId: string) => payments.filter((p) => p.bookingId === bookingId);
