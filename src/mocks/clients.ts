import type { Client } from "@/types/domain";

export const clients: Client[] = [
  { id: "cl-001", name: "Андрей Смирнов", phone: "+7 (913) 123-45-67", email: "smirnov@mail.ru", ordersCount: 12, rating: 4.8, createdAt: "2024-06-10", lastBookingAt: "2025-05-24" },
  { id: "cl-002", name: "Мария Иванова", phone: "+7 (923) 234-56-78", email: "m.ivanova@mail.ru", ordersCount: 8, rating: 4.6, createdAt: "2024-09-02", lastBookingAt: "2025-05-14" },
  { id: "cl-003", name: "Дмитрий Кузнецов", phone: "+7 (903) 345-67-89", email: "kuznetsov@mail.ru", ordersCount: 5, rating: 4.9, createdAt: "2024-11-18", lastBookingAt: "2025-05-15" },
  { id: "cl-004", name: "Екатерина Попова", phone: "+7 (965) 456-78-90", email: "e.popova@mail.ru", ordersCount: 3, rating: 4.7, createdAt: "2025-01-25", lastBookingAt: "2025-04-30" },
  { id: "cl-005", name: "Сергей Волков", phone: "+7 (983) 567-89-01", email: "volkov@mail.ru", ordersCount: 1, rating: 2.4, createdAt: "2025-02-14", lastBookingAt: "2025-03-01", blacklisted: true },
  { id: "cl-006", name: "Ольга Морозова", phone: "+7 (913) 678-90-12", email: "morozova@mail.ru", ordersCount: 6, rating: 4.5, createdAt: "2024-12-05", lastBookingAt: "2025-05-10" },
];

export const getClientById = (id: string) => clients.find((c) => c.id === id);
