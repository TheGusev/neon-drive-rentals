import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Error message shown under the section; also highlights the card border. */
  error?: string | null;
  id?: string;
}

export function SectionCard({ title, action, children, className, error, id }: SectionCardProps) {
  return (
    <section
      id={id}
      tabIndex={error ? -1 : undefined}
      aria-invalid={error ? true : undefined}
      className={cn(
        "scroll-mt-24 rounded-3xl bg-muted p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition",
        error && "border-2 border-destructive ring-2 ring-destructive/20",
        className,
      )}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-2">
          {title ? (
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
              {title}
              {error && <AlertCircle className="h-4 w-4 text-destructive" />}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </header>
      )}
      {children}
      {error && (
        <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </section>
  );
}
