import { CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { CarClass, Transmission } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface CatalogFiltersState {
  classes: CarClass[];
  transmissions: Transmission[];
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

const classOptions: { value: CarClass; label: string }[] = [
  { value: "econom", label: "Эконом" },
  { value: "sport", label: "Спорт" },
  { value: "premium", label: "Премиум" },
];

const transmissionOptions: { value: Transmission; label: string }[] = [
  { value: "AT", label: "AT" },
  { value: "CVT", label: "CVT" },
  { value: "MT", label: "MT" },
];

export function CatalogFilters({ value, onChange, priceBounds, onReset }: CatalogFiltersProps) {
  const toggle = <T extends string>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div className="space-y-6">
      <Group label="Класс авто">
        <div className="flex flex-wrap gap-3">
          {classOptions.map((o) => (
            <label key={o.value} className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <Checkbox
                checked={value.classes.includes(o.value)}
                onCheckedChange={() => onChange({ ...value, classes: toggle(value.classes, o.value) })}
              />
              {o.label}
            </label>
          ))}
        </div>
      </Group>

      <Group label="Коробка передач">
        <div className="flex flex-wrap gap-3">
          {transmissionOptions.map((o) => (
            <label key={o.value} className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <Checkbox
                checked={value.transmissions.includes(o.value)}
                onCheckedChange={() => onChange({ ...value, transmissions: toggle(value.transmissions, o.value) })}
              />
              {o.label}
            </label>
          ))}
        </div>
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
