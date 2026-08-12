import { CreditCard, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EntityCard } from "@/components/admin/EntityCard";
import type { Car, Client, Payment } from "@/types/domain";

const methodLabel = { card: "Карта", sbp: "СБП" } as const;
const statusMap: Record<Payment["status"], { label: string; cls: string }> = {
  success: { label: "Успешно", cls: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Ожидает", cls: "bg-amber-100 text-amber-700" },
  refunded: { label: "Возврат", cls: "bg-sky-100 text-sky-700" },
  failed: { label: "Ошибка", cls: "bg-rose-100 text-rose-700" },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

interface Props {
  payment: Payment;
  car?: Car | undefined;
  client?: Client | undefined;
  index: number;
}

export function AdminPaymentCard({ payment, car, client, index }: Props) {
  const s = statusMap[payment.status];
  const Icon = payment.method === "sbp" ? Smartphone : CreditCard;

  return (
    <EntityCard index={index}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{client?.name ?? payment.clientId}</div>
          <div className="truncate text-xs text-muted-foreground">
            {car ? `${car.brand} ${car.model}` : payment.carId}
          </div>
        </div>
        <Badge className={`shrink-0 border-0 font-medium ${s.cls}`}>{s.label}</Badge>
      </div>

      <div className="admin-nums mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {methodLabel[payment.method]} · {fmt(payment.date)}
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="admin-nums text-xs text-muted-foreground">№ {payment.bookingId}</span>
        <span className="admin-nums text-base font-bold">
          {payment.amount.toLocaleString("ru-RU")} ₽
        </span>
      </div>
    </EntityCard>
  );
}
