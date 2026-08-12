import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/domain";

const map: Record<BookingStatus, { label: string; cls: string }> = {
  paid: { label: "Оплачено", cls: "bg-emerald-500/15 text-emerald-600 public-dark:text-emerald-400" },
  pending: { label: "Ожидает", cls: "bg-amber-500/15 text-amber-600 public-dark:text-amber-400" },
  active: { label: "Активна", cls: "bg-sky-500/15 text-sky-600 public-dark:text-sky-400" },
  completed: { label: "Завершена", cls: "bg-muted text-muted-foreground" },
  cancelled: { label: "Отменена", cls: "bg-rose-500/15 text-rose-600 public-dark:text-rose-400" },
};

export function PaymentStatusBadge({ status }: { status: BookingStatus }) {
  const s = map[status];
  return <Badge className={cn("border-0 font-medium", s.cls)}>{s.label}</Badge>;
}

export const bookingStatusLabels = map;
