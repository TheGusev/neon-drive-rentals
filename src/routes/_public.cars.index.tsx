import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Booking, Car } from "@/types/domain";
import { isCarAvailable } from "@/lib/availability";
import { useBookings, useCars } from "@/state/AppDataContext";
import { CarCard } from "@/components/catalog/CarCard";
import { CatalogFilters, type CatalogFiltersState } from "@/components/catalog/CatalogFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE_URL, breadcrumbJsonLd, jsonLdScript, socialMeta } from "@/lib/seo";

export const Route = createFileRoute("/_public/cars/")({
  validateSearch: (search: Record<string, unknown>): { from?: string; to?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Автопарк японских кей-каров в аренду в Новосибирске — NSK-RENT" },
      { name: "description", content: "21 японский кей-кар в аренду в Новосибирске: фильтры по марке, модели, году, цвету, цене и датам. От 1 800 ₽ в сутки." },
      { property: "og:title", content: "Автопарк японских кей-каров в аренду — NSK-RENT" },
      { property: "og:description", content: "Выберите автомобиль и забронируйте онлайн за 3 минуты." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/cars` },
      { name: "twitter:card", content: "summary_large_image" },
      ...socialMeta("/assets/cars/hero-drive.jpg"),
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/cars` }],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Главная", url: "/" },
          { name: "Автопарк", url: "/cars" },
        ]),
      ),
    ],
  }),
  component: CatalogPage,
});

type SortKey = "price-asc" | "price-desc" | "rating";

const computeBounds = (list: Car[]): [number, number] =>
  list.length
    ? [Math.min(...list.map((c) => c.pricePerDay)), Math.max(...list.map((c) => c.pricePerDay))]
    : [0, 10000];

const emptyFilters = (priceBounds: [number, number], pickup?: Date, ret?: Date): CatalogFiltersState => ({
  brands: [],
  models: [],
  colors: [],
  years: [],
  transmissions: [],
  statuses: [],
  price: priceBounds,
  pickup,
  ret,
});

const parseDate = (v?: string) => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

function applyFilters(
  list: Car[],
  f: CatalogFiltersState,
  sort: SortKey,
  query: string,
  bookings: Booking[],
): Car[] {
  const q = query.trim().toLowerCase();
  const filtered = list.filter((c) => {
    if (q && !`${c.brand} ${c.model} ${c.color}`.toLowerCase().includes(q)) return false;
    if (f.brands.length && !f.brands.includes(c.brand)) return false;
    if (f.models.length && !f.models.includes(c.model)) return false;
    if (f.colors.length && !f.colors.includes(c.color)) return false;
    if (f.years.length && !f.years.includes(c.year)) return false;
    if (f.transmissions.length && !f.transmissions.includes(c.transmission)) return false;
    if (f.statuses.length && !f.statuses.includes(c.status ?? "free")) return false;
    if (c.pricePerDay < f.price[0] || c.pricePerDay > f.price[1]) return false;
    if (f.pickup && f.ret && !isCarAvailable(c, f.pickup.toISOString(), f.ret.toISOString(), bookings)) return false;
    return true;
  });
  const sorted = [...filtered];
  if (sort === "price-asc") sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
  if (sort === "price-desc") sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
  if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
  return sorted;
}

function CatalogPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const allCars = useCars();
  const bookings = useBookings();
  const priceBounds = useMemo(() => computeBounds(allCars), [allCars]);
  const [filters, setFilters] = useState<CatalogFiltersState>(() =>
    emptyFilters(computeBounds(allCars), parseDate(search.from), parseDate(search.to)),
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [sheetOpen, setSheetOpen] = useState(false);

  const list = useMemo(
    () => applyFilters(allCars, filters, sort, query, bookings),
    [allCars, filters, sort, query, bookings],
  );

  const reset = () => {
    setFilters(emptyFilters(priceBounds));
    setQuery("");
    void navigate({ to: "/cars", search: {} });
  };

  const toInput = (d?: Date) => (d ? d.toISOString().slice(0, 10) : "");
  const setDates = (next: { pickup?: Date; ret?: Date }) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    void navigate({
      to: "/cars",
      search: {
        from: merged.pickup ? merged.pickup.toISOString() : undefined,
        to: merged.ret ? merged.ret.toISOString() : undefined,
      },
    });
  };
  const bookingFrom = filters.pickup?.toISOString();
  const bookingTo = filters.ret?.toISOString();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ name: "Главная", to: "/" }, { name: "Автопарк" }]} />
      <header className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">NSK-RENT</p>
          <h1 className="mt-1 font-display text-3xl font-black md:text-4xl md:neon-text">Автопарк японских кей-каров в аренду в Новосибирске</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Японские кей-кары для города и поездок по области. Найдено {list.length} из {allCars.length} авто.
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:flex md:justify-between">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по модели или цвету"
              className="h-11 rounded-2xl pl-9"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 gap-2 rounded-2xl md:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                  Фильтры
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <CatalogFilters value={filters} onChange={setFilters} priceBounds={priceBounds} onReset={reset} />
                </div>
                <Button className="mt-6 w-full" onClick={() => setSheetOpen(false)}>
                  Показать {list.length}
                </Button>
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-11 w-[150px] rounded-2xl md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                <SelectItem value="price-desc">Сначала дороже</SelectItem>
                <SelectItem value="rating">По рейтингу</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2 rounded-2xl border border-border bg-card p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-xs font-semibold text-muted-foreground">
            Дата получения
            <Input
              type="date"
              className="mt-1 h-11 rounded-xl"
              value={toInput(filters.pickup)}
              onChange={(e) => setDates({ pickup: parseDate(e.target.value) })}
            />
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            Дата возврата
            <Input
              type="date"
              className="mt-1 h-11 rounded-xl"
              value={toInput(filters.ret)}
              onChange={(e) => setDates({ ret: parseDate(e.target.value) })}
            />
          </label>
          <p className="text-xs text-muted-foreground sm:pb-3">
            {bookingFrom && bookingTo
              ? `Свободно на выбранные даты: ${list.length}`
              : "Выберите даты — покажем только свободные авто"}
          </p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl border border-border bg-card p-5">
            <h2 className="mb-4 font-display text-lg font-bold">Фильтры</h2>
            <CatalogFilters value={filters} onChange={setFilters} priceBounds={priceBounds} onReset={reset} />
          </div>
        </aside>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => (
            <CarCard key={c.id} car={c} from={bookingFrom} to={bookingTo} />
          ))}
          {list.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              По выбранным фильтрам ничего не найдено.
              <Button variant="link" onClick={reset}>Сбросить фильтры</Button>
            </div>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display text-xl font-bold text-foreground">Аренда японских кей-каров в Новосибирске</h2>
        <p className="mt-2">
          В автопарке NSK-RENT — компактные японские автомобили с расходом 4–6 л/100 км: они экономичны в городе и
          спокойно идут по трассе в область. Выдача одна — Новосибирск, ул. Доватора, 11, круглосуточно.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/rent/novosibirsk" className="dash-chip hover:text-accent">Аренда авто в Новосибирске</Link>
          <Link to="/rent/bez-zaloga" className="dash-chip hover:text-accent">Аренда без залога</Link>
          <Link to="/kei-cars" className="dash-chip hover:text-accent">Что такое кей-кары</Link>
          <Link to="/blog" className="dash-chip hover:text-accent">Блог об аренде</Link>
        </div>
      </section>
    </div>
  );
}
