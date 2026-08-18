import * as XLSX from "xlsx";
import { payments } from "@/mocks/payments";
import { getClientById } from "@/mocks/clients";
import type { Car } from "@/types/domain";

const methodLabel = { card: "Карта", sbp: "СБП" } as const;
const statusLabel = { success: "Успешно", pending: "Ожидает", refunded: "Возврат", failed: "Ошибка" } as const;

export function exportPaymentsToExcel(getCarById: (id: string) => Car | undefined) {
  const rows = payments.map((p) => {
    const client = getClientById(p.clientId);
    const car = getCarById(p.carId);
    return {
      "Дата": new Date(p.date).toLocaleString("ru-RU"),
      "№ брони": p.bookingId,
      "Клиент": client?.name ?? p.clientId,
      "Телефон": client?.phone ?? "",
      "Автомобиль": car ? `${car.brand} ${car.model}` : p.carId,
      "Госномер": car?.plate ?? "",
      "Сумма, ₽": p.amount,
      "Метод": methodLabel[p.method],
      "Статус": statusLabel[p.status],
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Платежи");
  XLSX.writeFile(wb, `payments-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
