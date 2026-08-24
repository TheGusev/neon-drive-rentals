import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Car, CalendarCheck, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { to: "/admin/cars", label: "Авто", icon: Car },
  { to: "/admin/bookings", label: "Брони", icon: CalendarCheck },
  { to: "/admin/clients", label: "Клиенты", icon: Users },
  { to: "/admin/finance", label: "Финансы", icon: Wallet },
];

export function AdminTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => (
          <li key={t.to}>
            <Link
              to={t.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
                isActive(t.to, t.exact) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
