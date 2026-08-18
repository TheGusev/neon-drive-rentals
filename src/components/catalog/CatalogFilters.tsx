import { CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { CarFleetStatus, Transmission } from "@/types/domain";
import { useCarFacets, useCars } from "@/state/AppDataContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface CatalogFiltersState {
  brands: string[];
  models: string[];
  colors: string[];
  years: number[];
  transmissions: Transmission[];
  statuses: CarFleetStatus[];
  price: [number, number];
  pickup?: Date;
  ret?: Date;
}

export interface CatalogFiltersProps {
  value: CatalogFiltersState;
  onChange: (v: CatalogFiltersState) => void;
  priceBounds: [number, number];
  onReset: () => void;
}

const transmissionOptions: { value: Transmission; label: string }[] = [
  { value: "AT", label: "Автомат" },
  { value: "CVT", label: "Вариатор" },
  { value: "MT", label: "Механика" },
];

const statusOptions: { value: CarFleetStatus; label: string }[] = [
  { value: "free", label: "Свободен" },
  { value: "busy", label: "В аренде" },
  { value: "washing", label: "На мойке" },
  { value: "maintenance", label: "На ТО" },
];

export function CatalogFilters({ value, onChange, priceBounds, onReset }: CatalogFiltersProps) {
  const toggle = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const allCars = useCars();
  const { brands: carBrands, colors: carColors, years: carYears } = useCarFacets();

  const models = Array.from(
    new Set(
      allCars
        .filter((c) => (value.brands.length ? value.brands.includes(c.brand) : true))
        .map((c) => c.model),
    ),
  ).sort();

  return (
    <div className="space-y-6">
      <Group label="Марка">
        <ChipList
          items={carBrands.map((b) => ({ key: b, label: b, active: value.brands.includes(b) }))}
          onToggle={(key) => onChange({ ...value, brands: toggle(value.brands, key), models: [] })}
        />
      </Group>

      <Group label="Модель">
        <ChipList
          items={models.map((m) => ({ key: m, label: m, active: value.models.includes(m) }))}
          onToggle={(key) => onChange({ ...value, models: toggle(value.models, key) })}
        />
      </Group>

      <Group label="Цвет">
        <ChipList
          items={carColors.map((c) => ({ key: c, label: c, active: value.colors.includes(c) }))}
          onToggle={(key) => onChange({ ...value, colors: toggle(value.colors, key) })}
        />
      </Group>

      <Group label="Год выпуска">
        <ChipList
          items={carYears.map((y) => ({ key: String(y), label: String(y), active: value.years.includes(y) }))}
          onToggle={(key) => onChange({ ...value, years: toggle(value.years, Number(key)) })}
        />
      </Group>

      <Group label="Коробка передач">
        <div className="flex flex-wrap gap-3">
          {transmissionOptions.map((o) => (
            <label key={o.value} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <Checkbox
                checked={value.transmissions.includes(o.value)}
                onCheckedChange={() => onChange({ ...value, transmissions: toggle(value.transmissions, o.value) })}
              />
              {o.label}
            </label>
          ))}
        </div>
      </Group>

      <Group label="Статус">
        <ChipList
          items={statusOptions.map((s) => ({ key: s.value, label: s.label, active: value.statuses.includes(s.value) }))}
          onToggle={(key) => onChange({ ...value, statuses: toggle(value.statuses, key as CarFleetStatus) })}
        />
      </Group>

      <Group
        label="Цена / сутки"
        right={
          <span className="text-xs text-muted-foreground">
            {value.price[0].toLocaleString("ru-RU")} – {value.price[1].toLocaleString("ru-RU")} ₽
          </span>
        }
      >
        <Slider
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={100}
          value={value.price}
          onValueChange={(v) => onChange({ ...value, price: [v[0], v[1]] as [number, number] })}
        />
      </Group>

      <Group label="Даты аренды">
        <div className="grid grid-cols-2 gap-2">
          <DateInput label="Получение" value={value.pickup} onChange={(d) => onChange({ ...value, pickup: d })} />
          <DateInput label="Возврат" value={value.ret} onChange={(d) => onChange({ ...value, ret: d })} />
        </div>
      </Group>

      <Button variant="outline" size="sm" className="gap-2" onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
        Сбросить фильтры
      </Button>
    </div>
  );
}

function ChipList({
  items,
  onToggle,
}: {
  items: Array<{ key: string; label: string; active: boolean }>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={() => onToggle(it.key)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            it.active
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-background text-muted-foreground hover:border-accent hover:text-foreground",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function Group({ label, children, right }: { label: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

function DateInput({ label, value, onChange }: { label: string; value?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start text-left font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="mr-1 h-4 w-4 text-accent" />
          {value ? format(value, "d MMM", { locale: ru }) : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn("pointer-events-auto p-3")} />
      </PopoverContent>
    </Popover>
  );
}
