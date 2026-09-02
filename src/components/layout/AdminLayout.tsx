import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Car, CalendarCheck, Users, Wallet, Settings, Globe } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { ThemeProvider, useTheme } from "@/components/layout/ThemeProvider";

const items = [
  { to: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { to: "/admin/cars", label: "Автомобили", icon: Car },
  { to: "/admin/bookings", label: "Бронирования", icon: CalendarCheck },
  { to: "/admin/clients", label: "Клиенты", icon: Users },
  { to: "/admin/finance", label: "Финансы", icon: Wallet },
  { to: "/admin/settings", label: "Настройки", icon: Settings },
];

function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Car className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">nsk-rent.ru</div>
            <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
              Панель управления
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Основное</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.to}>
                  <SidebarMenuButton asChild isActive={isActive(it.to, it.exact)}>
                    <Link to={it.to} className="flex items-center gap-2">
                      <it.icon className="h-4 w-4" />
                      <span>{it.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminShell />
    </ThemeProvider>
  );
}

function AdminShell() {
  const { themeClass } = useTheme();
  return (
    <div className={`${themeClass} min-h-screen bg-background text-foreground transition-colors duration-300`}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
            <AdminHeader />
            <main className="w-full flex-1 bg-muted/30 px-4 pb-24 md:px-6 md:pb-6">
              <Outlet />
            </main>
            <AdminTabBar />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
