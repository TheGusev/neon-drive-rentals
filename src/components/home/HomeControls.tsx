import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NfsSideMenu } from "./NfsSideMenu";
import { cn } from "@/lib/utils";

const menuLinks = [
  { to: "/", label: "Главная" },
  { to: "/cars", label: "Автопарк" },
  { to: "/rent/novosibirsk", label: "Аренда в Новосибирске" },
  { to: "/rent/bez-zaloga", label: "Аренда без залога" },
  { to: "/kei-cars", label: "Кей-кары из Японии" },
  { to: "/blog", label: "Блог" },
  { to: "/profile", label: "Личный кабинет" },
] as const;

/** Hide the floating button while scrolling down, bring it back on any scroll up. */
function useAutoHide() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (y < 64) setHidden(false);
        else if (delta > 6) setHidden(true);
        else if (delta < -2) setHidden(false);
        lastY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

/**
 * Single floating control for the home page: the menu button.
 * Theme switching lives inside the menu sheet.
 */
export function HomeControls() {
  const hidden = useAutoHide();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-end gap-2 px-3 pt-[calc(max(env(safe-area-inset-top),0.5rem)+2.5rem)] md:px-6 md:pt-5">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            aria-label="Меню"
            className={cn(
              "menu-pulse pointer-events-auto h-14 w-14 rounded-2xl border-2 border-accent/70 bg-background/85 shadow-[0_0_24px_color-mix(in_oklab,var(--neon-blue)_55%,transparent)] backdrop-blur transition-[transform,opacity] duration-300 will-change-transform hover:border-accent md:h-12 md:w-12 motion-reduce:transition-none",
              hidden ? "pointer-events-none -translate-y-24 opacity-0" : "translate-y-0 opacity-100",
            )}
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
