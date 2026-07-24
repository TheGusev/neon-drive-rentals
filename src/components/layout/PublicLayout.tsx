import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Главная" },
  { to: "/cars", label: "Автомобили" },
  { to: "/profile", label: "Кабинет" },
];

export function PublicLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="public-dark min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 md:flex md:justify-between md:px-6">
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

          <button
            type="button"
            aria-label="Меню"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {open && (
          <div className="border-t border-border/60 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
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
