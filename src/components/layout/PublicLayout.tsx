import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Главная" },
  { to: "/cars", label: "Автомобили" },
  { to: "/blog", label: "Блог" },
  { to: "/profile", label: "Кабинет" },
];

export function PublicLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change so it never persists across pages.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="public-dark min-h-screen bg-background text-foreground">
      <header className="safe-top sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+2.75rem)] md:flex md:justify-between md:px-6 md:py-4 md:pt-4">

          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="font-display text-xl font-black tracking-widest md:neon-text md:text-2xl">
              RENTSIB
            </span>
            <span className="hidden text-xs tracking-[0.3em] text-muted-foreground md:inline">
              DRIVE THE NIGHT
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`text-sm font-semibold uppercase tracking-widest transition-colors ${
                    active ? "text-accent" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <a href="tel:+78005557213" className="flex items-center gap-2 text-sm text-foreground">
              <Phone className="h-4 w-4 text-accent" />
              <span className="font-semibold">+7 (800) 555-72-13</span>
            </a>
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" /> Войти
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Открыть меню"
                className="menu-pulse relative z-50 inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-accent/70 bg-background/90 text-foreground shadow-[0_0_24px_color-mix(in_oklab,var(--neon-blue)_55%,transparent)] backdrop-blur transition hover:border-accent hover:scale-105 active:scale-95 md:hidden"
              >
                <Menu className="h-7 w-7 text-accent" />
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[82vw] max-w-sm p-5">
              <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">Меню</p>
              <p className="mt-1 font-display text-2xl font-black tracking-widest">RENTSIB</p>
              <nav className="mt-6 flex flex-col gap-1">
                {nav.map((n) => {
                  const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      className={`rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                        active ? "bg-muted text-primary" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 border-t border-border pt-4">
                <a href="tel:+78005557213" className="flex items-center gap-2 text-sm text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-semibold">+7 (800) 555-72-13</span>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:justify-between md:px-6">
          <span>© {new Date().getFullYear()} RentSib — аренда авто в Новосибирске</span>
          <span>ИП · ОГРНИП пусто · info@rentsib.ru</span>
        </div>
      </footer>
    </div>
  );
}
