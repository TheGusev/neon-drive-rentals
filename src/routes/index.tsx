import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="public-dark min-h-screen bg-background text-foreground">
      <HeaderStub />
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.5em] text-muted-foreground md:text-sm">
              速度を感じる · Drive the Night
            </p>
            <h1 className="font-display text-5xl font-black tracking-tight md:text-7xl md:neon-text">
              rentsib.ru
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
              Аренда японских кей-каров и премиум-авто в Новосибирске. Онлайн-бронирование,
              честные цены, поддержка 24/7.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/cars">Подобрать авто</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/profile">Мой кабинет</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-xs text-muted-foreground">
            Наполнение главной (hero, быстрый поиск, преимущества, популярные модели)
            добавим в следующем промте.
          </div>
        </div>
      </section>
    </div>
  );
}

function HeaderStub() {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 md:flex md:justify-between md:px-6">
        <Link to="/" className="min-w-0">
          <span className="font-display text-xl font-black tracking-widest md:neon-text md:text-2xl">
            RENTSIB
          </span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link to="/cars" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground">
            Автомобили
          </Link>
          <Link to="/profile" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground">
            Кабинет
          </Link>
          <Link to="/admin" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground">
            Админка
          </Link>
        </nav>
      </div>
    </header>
  );
}
