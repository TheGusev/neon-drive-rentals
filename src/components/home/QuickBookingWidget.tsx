import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, MapPin, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PICKUP_POINT } from "@/mocks/pickupPoints";

export function QuickBookingWidget() {
  const [pickup, setPickup] = useState<Date>();
  const [ret, setRet] = useState<Date>();

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-lg md:p-6 md:neon-glow">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Быстрое бронирование
        </p>
        <h3 className="mt-1 font-display text-xl font-bold md:text-2xl">Найдите свой авто</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Место получения
          </label>
          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{PICKUP_POINT.address}</p>
              <p className="text-xs text-muted-foreground">
                Единственный пункт выдачи · {PICKUP_POINT.hours}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DateField label="Получение" value={pickup} onChange={setPickup} />
          <DateField label="Возврат" value={ret} onChange={setRet} />
        </div>

        <Button asChild size="lg" className="mt-2 w-full gap-2 font-bold uppercase tracking-wider">
          <Link to="/cars">
            <Search className="h-4 w-4" />
            Найти авто
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-1 h-4 w-4 text-accent" />
            {value ? format(value, "d MMM yyyy", { locale: ru }) : "Выберите дату"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            className={cn("pointer-events-auto p-3")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
