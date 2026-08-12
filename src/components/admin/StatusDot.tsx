import { cn } from "@/lib/utils";
import type { CarFleetStatus } from "@/types/domain";

const map: Record<CarFleetStatus, { label: string; dot: string; tone: string }> = {
  free: { label: "Свободна", dot: "bg-emerald-500", tone: "text-emerald-600 public-dark:text-emerald-400" },
  busy: { label: "В аренде", dot: "bg-rose-500", tone: "text-rose-600 public-dark:text-rose-400" },
  washing: { label: "Мойка", dot: "bg-sky-500", tone: "text-sky-600 public-dark:text-sky-400" },
  maintenance: { label: "ТО", dot: "bg-amber-500", tone: "text-amber-600 public-dark:text-amber-400" },
};

export function StatusDot({
  status,
  showLabel = true,
  className,
}: {
  status: CarFleetStatus;
  showLabel?: boolean;
  className?: string;
}) {
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium",
        showLabel && s.tone,
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", s.dot)} />
      {showLabel && s.label}
    </span>
  );
}

export const fleetStatusLabels = map;
