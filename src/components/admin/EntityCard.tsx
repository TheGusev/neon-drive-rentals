import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EntityCardProps {
  index?: number;
  className?: string;
  /** Делает всю карточку кликабельной (клавиатура + мышь). */
  onClick?: () => void;
  label?: string;
  children: ReactNode;
}

/** Общая оболочка карточки в админке: единые отступы, ховер, каскадное появление. */
export function EntityCard({ index = 0, className, onClick, label, children }: EntityCardProps) {
  const base = cn(
    "admin-card admin-in flex h-full min-w-0 flex-col rounded-2xl border bg-card p-4 text-left shadow-sm",
    onClick &&
      "cursor-pointer transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className,
  );
  const style = { "--i": index } as CSSProperties;

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={base}
        style={style}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={base} style={style}>
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
