import type { ClientProfile, ClientDocument, ClientReview } from "@/types/domain";

export const currentClient: ClientProfile = {
  id: "cl-001",
  name: "Иван Иванов",
  phone: "+7 (913) 555-12-34",
  email: "ivan@example.com",
  rating: 4.8,
  reviewsCount: 12,
};

export const clientDocuments: ClientDocument[] = [
  { id: "d1", type: "passport", number: "50** ******23", status: "verified", uploadedAt: "2024-11-03" },
  { id: "d2", type: "license", number: "54АА ***456", status: "pending", uploadedAt: "2025-05-12" },
];

export const clientReviews: ClientReview[] = [
  { id: "r1", author: "Менеджер NSK-RENT", rating: 5, text: "Аккуратный водитель, возврат авто в чистом виде.", date: "2025-04-18" },
  { id: "r2", author: "Менеджер NSK-RENT", rating: 5, text: "Всё вовремя, без замечаний.", date: "2025-03-02" },
  { id: "r3", author: "Менеджер NSK-RENT", rating: 4, text: "Небольшая задержка возврата, в остальном отлично.", date: "2025-01-27" },
];
