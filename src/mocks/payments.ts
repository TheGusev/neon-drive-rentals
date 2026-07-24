import type { Payment } from "@/types/domain";

export const payments: Payment[] = [
  { id: "p-001", date: "2025-05-24T10:12:00Z", bookingId: "bk-001", clientId: "cl-001", carId: "honda-nbox", amount: 7200, method: "card", status: "success" },
  { id: "p-002", date: "2025-05-14T09:30:00Z", bookingId: "bk-002", clientId: "cl-002", carId: "suzuki-alto-works", amount: 2200, method: "sbp", status: "success" },
  { id: "p-003", date: "2025-05-15T10:20:00Z", bookingId: "bk-003", clientId: "cl-003", carId: "mazda-flair-wagon", amount: 3800, method: "card", status: "pending" },
  { id: "p-004", date: "2025-04-14T11:00:00Z", bookingId: "bk-h1", clientId: "cl-001", carId: "nissan-dayz", amount: 10000, method: "card", status: "success" },
  { id: "p-005", date: "2025-03-03T09:45:00Z", bookingId: "bk-h2", clientId: "cl-001", carId: "suzuki-wagon-r", amount: 4400, method: "sbp", status: "success" },
  { id: "p-006", date: "2025-01-25T13:12:00Z", bookingId: "bk-h3", clientId: "cl-001", carId: "daihatsu-move-custom", amount: 11500, method: "card", status: "success" },
  { id: "p-007", date: "2025-05-10T14:20:00Z", bookingId: "bk-old-1", clientId: "cl-006", carId: "subaru-stella", amount: 4600, method: "sbp", status: "refunded" },
  { id: "p-008", date: "2025-05-08T18:00:00Z", bookingId: "bk-old-2", clientId: "cl-004", carId: "mitsubishi-ek-sport", amount: 6600, method: "card", status: "failed" },
];
