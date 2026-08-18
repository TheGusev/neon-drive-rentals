import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  name: string;
  /** Абсолютный путь внутри сайта. Последний элемент оставляем без ссылки. */
  to?: string;
}

/** Компактная строка хлебных крошек. Разметка BreadcrumbList добавляется в head() маршрута. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.name}-${i}`} className="inline-flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />}
            {last || !item.to ? (
              <span className="text-foreground">{item.name}</span>
            ) : (
              <Link to={item.to} className="link-quiet hover:text-accent">
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
