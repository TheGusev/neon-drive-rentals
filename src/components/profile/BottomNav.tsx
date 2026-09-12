import { useEffect, useState } from "react";
import { CalendarCheck, FileText, MessageCircle, User } from "lucide-react";

type Item = { id: string; label: string; Icon: typeof User };

const items: Item[] = [
  { id: "profile-top", label: "Кабинет", Icon: User },
  { id: "bookings", label: "Аренды", Icon: CalendarCheck },
  { id: "messages", label: "Сообщения", Icon: MessageCircle },
  { id: "documents", label: "Документы", Icon: FileText },
];

/** Нижнее меню кабинета: только разделы кабинета, всегда видно. */
export function BottomNav() {
  const [active, setActive] = useState<string>("profile-top");

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0.1, 0.5, 1] },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => go(it.id)}
              className={`flex w-full flex-col items-center gap-1 py-2.5 text-[11px] ${
                active === it.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <it.Icon className="h-5 w-5" />
              <span>{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
