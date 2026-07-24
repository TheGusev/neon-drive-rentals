import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cars } from "@/mocks/cars";
import type { Car } from "@/types/domain";
import { CarCard } from "@/components/catalog/CarCard";
import { CatalogFilters, type CatalogFiltersState } from "@/components/catalog/CatalogFilters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/_public/cars/")({
  head: () => ({
    meta: [
      { title: "Каталог японских авто в аренду — NSK-RENT" },
      { name: "description", content: "Каталог японских кей-каров для аренды в Новосибирске. Фильтры по классу, коробке передач и цене." },
      { property: "og:title", content: "Каталог японских авто в аренду — NSK-RENT" },
      { property: "og:description", content: "Выберите авто и забронируйте онлайн за 3 минуты." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cars" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/cars" }],
  }),
  component: CatalogPage,
});

type SortKey = "price-asc" | "price-desc" | "rating";

const priceBounds: [number, number] = [
  Math.min(...cars.map((c) => c.pricePerDay)),
  Math.max(...cars.map((c) => c.pricePerDay)),
];

const emptyFilters = (): CatalogFiltersState => ({
  classes: [],
  transmissions: [],
  price: priceBounds,
});

function applyFilters(list: Car[], f: CatalogFiltersState, sort: SortKey): Car[] {
  const filtered = list.filter((c) => {
    if (f.classes.length && !f.classes.includes(c.class)) return false;
    if (f.transmissions.length && !f.transmissions.includes(c.transmission)) return false;
    if (c.pricePerDay < f.price[0] || c.pricePerDay > f.price[1]) return false;
    return true;
  });
  const sorted = [...filtered];
  if (sort === "price-asc") sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
  if (sort === "price-desc") sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
  if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
  return sorted;
}

function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFiltersState>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [sheetOpen, setSheetOpen] = useState(false);

  const list = useMemo(() => applyFilters(cars, filters, sort), [filters, sort]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Автопарк</p>
          <h1 className="mt-1 font-display text-3xl font-black md:text-4xl md:neon-text">
            Каталог автомобилей
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Найдено {list.length} {list.length === 1 ? "авто" : "авто"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 md:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Фильтры
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Фильтры</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <CatalogFilters
                  value={filters}
                  onChange={setFilters}
                  priceBounds={priceBounds}
                  onReset={() => setFilters(emptyFilters())}
                />
              </div>
              <Button className="mt-6 w-full" onClick={() => setSheetOpen(false)}>
                Показать {list.length}
              </Button>
            </SheetContent>
          </Sheet>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Сначала дешевле</SelectItem>
              <SelectItem value="price-desc">Сначала дороже</SelectItem>
              <SelectItem value="rating">По рейтингу</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 font-display text-lg font-bold">Фильтры</h2>
            <CatalogFilters
              value={filters}
              onChange={setFilters}
              priceBounds={priceBounds}
              onReset={() => setFilters(emptyFilters())}
            />
          </div>
        </aside>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
          {list.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              По выбранным фильтрам ничего не найдено.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
