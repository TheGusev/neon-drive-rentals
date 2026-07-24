import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/domain";

const map: Record<BookingStatus, { label: string; cls: string }> = {
  paid: { label: "Оплачено", cls: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Ожидает", cls: "bg-amber-100 text-amber-700" },
  active: { label: "Активна", cls: "bg-sky-100 text-sky-700" },
  completed: { label: "Завершена", cls: "bg-slate-200 text-slate-700" },
  cancelled: { label: "Отменена", cls: "bg-rose-100 text-rose-700" },
};

export function PaymentStatusBadge({ status }: { status: BookingStatus }) {
  const s = map[status];
  return <Badge className={cn("border-0 font-medium", s.cls)}>{s.label}</Badge>;
}

export const bookingStatusLabels = map;
