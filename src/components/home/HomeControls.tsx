import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NfsSideMenu } from "./NfsSideMenu";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";

const menuLinks = [
  { to: "/", label: "Главная" },
  { to: "/cars", label: "Автопарк" },
  { to: "/rent/novosibirsk", label: "Аренда в Новосибирске" },
  { to: "/rent/bez-zaloga", label: "Аренда без залога" },
  { to: "/kei-cars", label: "Кей-кары из Японии" },
  { to: "/blog", label: "Блог" },
  { to: "/profile", label: "Личный кабинет" },
] as const;

/**
 * Single floating control for the home page: the menu button.
 * Theme switching lives inside the menu sheet.
 */
export function HomeControls() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  useHideOnScroll(btnRef, { locked: open });

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-end gap-2 px-3 pt-[calc(max(env(safe-area-inset-top),0.5rem)+2.5rem)] md:px-6 md:pt-5">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            ref={btnRef}
            size="icon"
            variant="outline"
            aria-label="Меню"
            data-hidden="false"
            className="glass-surface pointer-events-auto h-14 w-14 rounded-2xl border-accent/50 opacity-100 transition-opacity duration-300 hover:border-accent data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0 md:h-12 md:w-12 motion-reduce:transition-none"
          >
            <Menu className="h-7 w-7 text-accent md:h-6 md:w-6" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto bg-background p-5 text-foreground">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[color:var(--neon-blue)]">Nsk · JDM</p>
          <p className="mt-1 font-display text-3xl font-black">
            <span className="logo-neon">NSK-RENT</span>
          </p>
          <div className="mt-4">
            <ThemeToggle withLabel className="w-full justify-center" />
          </div>
          <div className="mt-5">
            <NfsSideMenu />
          </div>
          <nav className="mt-6 flex flex-col gap-1 border-t border-border/60 pt-4">
            {menuLinks.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-foreground hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
