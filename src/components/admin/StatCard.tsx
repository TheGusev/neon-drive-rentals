import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconTone?: string; // tailwind bg color class
}

export function StatCard({ label, value, delta, deltaTone = "neutral", icon: Icon, iconTone = "bg-primary/10 text-primary" }: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
          {delta && (
            <div
              className={cn(
                "mt-1 text-xs font-medium",
                deltaTone === "up" && "text-emerald-600",
                deltaTone === "down" && "text-rose-600",
                deltaTone === "neutral" && "text-muted-foreground",
              )}
            >
              {delta}
            </div>
          )}
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", iconTone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
