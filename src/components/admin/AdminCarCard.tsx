import { Pencil, Trash2, Gauge, Cog, Fuel, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityCard } from "@/components/admin/EntityCard";
import { StatusDot } from "@/components/admin/StatusDot";
import type { Car } from "@/types/domain";
import { CarImage } from "@/components/car/CarImage";

const classLabel = { econom: "Эконом", sport: "Спорт", premium: "Премиум" } as const;

interface Props {
  car: Car;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function AdminCarCard({ car, index, onEdit, onDelete }: Props) {
  return (
    <EntityCard
      index={index}
      onClick={onEdit}
      label={`Изменить ${car.brand} ${car.model}`}
    >
      <div className="flex min-w-0 gap-3">
        <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
          <CarImage
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <span className="absolute left-1.5 top-1.5 rounded-full bg-background/85 px-1.5 py-0.5 backdrop-blur">
            <StatusDot status={car.status ?? "free"} showLabel={false} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {car.brand} {car.model}
              </div>
              <div className="admin-nums mt-0.5 truncate text-xs text-muted-foreground">
                {car.year} · {car.plate ?? "без номера"}
              </div>
            </div>
            <div className="flex shrink-0 gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label="Изменить"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Удалить"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
              </Button>
            </div>
          </div>

          <div className="admin-nums mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1">
              <Cog className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{car.transmission}</span>
            </span>
            <span className="flex min-w-0 items-center gap-1">
              <Gauge className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{car.power} л.с.</span>
            </span>
            <span className="flex min-w-0 items-center gap-1">
              <Fuel className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{car.consumption} л/100</span>
            </span>
            <span className="flex min-w-0 items-center gap-1">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{car.seats ?? 4} мест</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
          {classLabel[car.class]}
        </span>
        <span className="admin-nums text-base font-bold">
          {car.pricePerDay.toLocaleString("ru-RU")} ₽
          <span className="text-xs font-normal text-muted-foreground">/сутки</span>
        </span>
      </div>
    </EntityCard>
  );
}
