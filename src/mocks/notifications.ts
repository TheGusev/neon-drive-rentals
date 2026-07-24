import type { NotificationItem } from "@/types/domain";

export const notifications: NotificationItem[] = [
  { id: "n1", title: "Новая заявка", description: "Клиент Мария Иванова забронировала Suzuki Alto Works", time: "5 мин назад", unread: true },
  { id: "n2", title: "Оплата подтверждена", description: "Бронь bk-001 — 7 200 ₽ (карта)", time: "1 ч назад", unread: true },
  { id: "n3", title: "ТО подходит", description: "Honda N-BOX — плановое ТО через 3 дня", time: "вчера" },
];
