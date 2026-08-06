import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Car, CalendarCheck, MessageCircle, User } from "lucide-react";
import { toast } from "sonner";

type Item = {
  label: string;
  Icon: typeof Home;
  to?: "/" | "/cars" | "/profile";
  hash?: string;
  onClick?: () => void;
  match?: (p: string) => boolean;
};

const items: Item[] = [
  { label: "Главная", Icon: Home, to: "/", match: (p) => p === "/" },
  { label: "Каталог", Icon: Car, to: "/cars", match: (p) => p.startsWith("/cars") },
  { label: "Аренды", Icon: CalendarCheck, to: "/profile", hash: "bookings" },
  { label: "Сообщения", Icon: MessageCircle, onClick: () => toast("Чат появится в следующем обновлении") },
  { label: "Профиль", Icon: User, to: "/profile", match: (p) => p === "/profile" },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((it) => {
          const active = it.match?.(pathname) ?? false;
          const cls = `flex flex-col items-center gap-1 py-2.5 text-[11px] ${active ? "text-accent" : "text-muted-foreground"}`;
          const inner = (
            <>
              <it.Icon className="h-5 w-5" />
              <span>{it.label}</span>
            </>
          );
          return (
            <li key={it.label}>
              {it.onClick ? (
                <button type="button" onClick={it.onClick} className={`${cls} w-full`}>{inner}</button>
              ) : it.to ? (
                <Link to={it.to} hash={it.hash} className={cls}>{inner}</Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
