import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EntityCardProps {
  index?: number;
  className?: string;
  children: ReactNode;
}

/** Общая оболочка карточки в админке: единые отступы, ховер, каскадное появление. */
export function EntityCard({ index = 0, className, children }: EntityCardProps) {
  return (
    <div
      className={cn(
        "admin-card admin-in flex h-full min-w-0 flex-col rounded-2xl border bg-card p-4 shadow-sm",
        className,
      )}
      style={{ "--i": index } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function EntityGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/50 py-12 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
