import type { Client } from "@/types/domain";

export const clients: Client[] = [
  { id: "cl-001", name: "Андрей Смирнов", phone: "+7 (913) 123-45-67", ordersCount: 12, rating: 4.8 },
  { id: "cl-002", name: "Мария Иванова", phone: "+7 (923) 234-56-78", ordersCount: 8, rating: 4.6 },
  { id: "cl-003", name: "Дмитрий Кузнецов", phone: "+7 (903) 345-67-89", ordersCount: 5, rating: 4.9 },
  { id: "cl-004", name: "Екатерина Попова", phone: "+7 (965) 456-78-90", ordersCount: 3, rating: 4.7 },
];
