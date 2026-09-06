import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsBell } from "@/components/admin/NotificationsBell";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { adminLogout } from "@/lib/adminGate.functions";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function AdminHeader() {
  const router = useRouter();
  const logout = useServerFn(adminLogout);

  async function handleLogout() {
    await logout({});
    await router.navigate({ to: "/admin/login" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6 [box-sizing:content-box] pt-[env(safe-area-inset-top)]">
      <SidebarTrigger />
      <div className="hidden md:block">
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          NSK-RENT
        </div>
        <div className="text-sm font-bold tracking-wide">ПАНЕЛЬ УПРАВЛЕНИЯ</div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <NotificationsBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  АД
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">Администратор</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Администратор</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast("Профиль скоро появится")}>
              Профиль
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Настройки скоро появятся")}>
              Настройки
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Выйти</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
