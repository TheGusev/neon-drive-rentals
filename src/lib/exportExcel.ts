import * as XLSX from "xlsx";
import type { Car, Payment } from "@/types/domain";

const methodLabel = { card: "Карта", sbp: "СБП", cash: "Наличные" } as const;
const statusLabel = { success: "Успешно", pending: "Ожидает", refunded: "Возврат", failed: "Ошибка" } as const;

export type ExportablePayment = Payment & {
  clientName?: string;
  clientPhone?: string;
  carName?: string;
};

/** Выгрузка реальных платежей из базы: онлайн и наличные с методом оплаты. */
export function exportPaymentsToExcel(
  payments: ExportablePayment[],
  getCarById: (id: string) => Car | undefined,
) {
  const rows = payments.map((p) => {
    const car = getCarById(p.carId);
    return {
      "Дата": new Date(p.date).toLocaleString("ru-RU"),
      "№ брони": p.bookingId,
      "Клиент": p.clientName ?? p.clientId,
      "Телефон": p.clientPhone ?? "",
      "Автомобиль": car ? `${car.brand} ${car.model}` : (p.carName ?? p.carId),
      "Госномер": car?.plate ?? "",
      "Сумма, ₽": p.amount,
      "Способ оплаты": methodLabel[p.method] ?? p.method,
      "Статус": statusLabel[p.status] ?? p.status,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Платежи");
  XLSX.writeFile(wb, `payments-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
