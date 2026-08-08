import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { notifications } from "@/mocks/notifications";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { adminLogout } from "@/lib/adminGate.functions";

export function AdminHeader() {
  const unread = notifications.filter((n) => n.unread).length;
  const router = useRouter();
  const logout = useServerFn(adminLogout);

  async function handleLogout() {
    await logout({});
    await router.navigate({ to: "/admin/login" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />
      <div className="hidden md:block">
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          NSK-RENT
        </div>
        <div className="text-sm font-bold tracking-wide">ПАНЕЛЬ УПРАВЛЕНИЯ</div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b px-4 py-3 text-sm font-semibold">Уведомления</div>
            <ul className="max-h-80 divide-y overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="flex gap-3 px-4 py-3 text-sm">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-sky-500" : "bg-transparent"}`} />
                  <div className="min-w-0">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{n.description}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{n.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">АД</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">Администратор</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Администратор</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast("Профиль скоро появится")}>Профиль</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Настройки скоро появятся")}>Настройки</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Выйти</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
