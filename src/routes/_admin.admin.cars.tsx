import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCarCard } from "@/components/admin/AdminCarCard";
import { EntityGrid, EmptyState } from "@/components/admin/EntityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cars } from "@/mocks/cars";
import type { CarFleetStatus } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/cars")({
  head: () => ({ meta: [{ title: "Автопарк — Панель управления" }] }),
  component: AdminCarsPage,
});

function AdminCarsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | CarFleetStatus>("all");

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      if (status !== "all" && (c.status ?? "free") !== status) return false;
      if (q && !`${c.brand} ${c.model} ${c.plate ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [q, status]);

  return (
    <div className="w-full">
      <PageHeader
        title="Автопарк"
        description={`${filtered.length} из ${cars.length} автомобилей`}
        actions={
          <Button onClick={() => toast("Форма добавления авто скоро появится")}>
            <Plus className="mr-2 h-4 w-4" /> Добавить авто
          </Button>
        }
      />

      <div className="mb-4 flex w-full flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по марке, модели или номеру"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="free">Свободные</SelectItem>
            <SelectItem value="busy">В аренде</SelectItem>
            <SelectItem value="washing">Мойка</SelectItem>
            <SelectItem value="maintenance">ТО</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="Ничего не найдено" />
      ) : (
        <EntityGrid key={`${q}|${status}`}>
          {filtered.map((c, i) => (
            <AdminCarCard
              key={c.id}
              car={c}
              index={i}
              onEdit={() => toast(`Редактирование ${c.brand} ${c.model}`)}
              onDelete={() => toast(`Удаление ${c.brand} ${c.model}`)}
            />
          ))}
        </EntityGrid>
      )}
    </div>
  );
}
