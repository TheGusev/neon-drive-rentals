import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyBottomBarProps {
  label?: string;
  value?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function StickyBottomBar({ label, value, children, className }: StickyBottomBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 z-30 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {(label || value) && (
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-500">{label}</span>
          <span className="text-lg font-bold text-slate-900">{value}</span>
        </div>
      )}
      {children}
    </div>
  );
}
