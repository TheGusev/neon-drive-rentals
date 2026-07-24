import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusDot } from "@/components/admin/StatusDot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cars } from "@/mocks/cars";
import type { CarFleetStatus } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/cars")({
  head: () => ({ meta: [{ title: "Автопарк — Панель управления" }] }),
  component: AdminCarsPage,
});

const classLabel = { econom: "Эконом", sport: "Спорт", premium: "Премиум" } as const;

function AdminCarsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | CarFleetStatus>("all");

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      if (status !== "all" && (c.status ?? "free") !== status) return false;
      if (q && !`${c.brand} ${c.model} ${c.plate ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, status]);

  return (
    <div>
      <PageHeader
        title="Автопарк"
        description="Управление автомобилями, статусами и ценами"
        actions={
          <Button onClick={() => toast("Форма добавления авто скоро появится")}>
            <Plus className="mr-2 h-4 w-4" /> Добавить авто
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск по марке, модели или номеру" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="free">Свободные</SelectItem>
            <SelectItem value="busy">В аренде</SelectItem>
            <SelectItem value="washing">Мойка</SelectItem>
            <SelectItem value="maintenance">ТО</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Авто</TableHead>
              <TableHead>Год</TableHead>
              <TableHead>Госномер</TableHead>
              <TableHead>Класс</TableHead>
              <TableHead>КПП</TableHead>
              <TableHead className="text-right">Цена/сутки</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {c.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="text-sm font-medium">{c.brand} {c.model}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{c.year}</TableCell>
                <TableCell className="text-sm font-mono">{c.plate ?? "—"}</TableCell>
                <TableCell className="text-sm">{classLabel[c.class]}</TableCell>
                <TableCell className="text-sm">{c.transmission}</TableCell>
                <TableCell className="text-right text-sm font-semibold whitespace-nowrap">{c.pricePerDay.toLocaleString("ru-RU")} ₽</TableCell>
                <TableCell><StatusDot status={c.status ?? "free"} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toast(`Редактирование ${c.brand} ${c.model}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toast(`Удаление ${c.brand} ${c.model}`)}>
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">Ничего не найдено</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
