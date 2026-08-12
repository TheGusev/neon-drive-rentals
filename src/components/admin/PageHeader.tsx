import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="sticky top-16 z-20 -mx-4 mb-4 w-[calc(100%+2rem)] border-b bg-background/85 px-4 py-3 backdrop-blur md:-mx-6 md:w-[calc(100%+3rem)] md:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
          {description && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
