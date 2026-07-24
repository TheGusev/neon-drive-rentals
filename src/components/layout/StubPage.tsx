import { type ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function StubPage({ title, subtitle, children }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-sm text-muted-foreground">
        {children ?? "Содержимое этой страницы будет добавлено в следующем промте."}
      </div>
    </section>
  );
}
