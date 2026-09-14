import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, FileText, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/profile", label: "Кабинет", Icon: User, exact: true },
  { to: "/profile/rentals", label: "Аренды", Icon: CalendarCheck },
  { to: "/profile/messages", label: "Сообщения", Icon: MessageCircle },
  { to: "/profile/documents", label: "Документы", Icon: FileText },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return <li key={item.to}><Link to={item.to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px]", active ? "text-primary" : "text-muted-foreground")}><item.Icon className="h-5 w-5" /><span>{item.label}</span></Link></li>;
        })}
      </ul>
    </nav>
  );
}