import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, action, children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl bg-[#f5f7fb] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-2">
          {title ? (
            <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
