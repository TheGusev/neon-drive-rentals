import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCarCard } from "@/components/admin/AdminCarCard";
import { EntityGrid, EmptyState } from "@/components/admin/EntityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminCarsQueryOptions } from "@/lib/queries";
import { createCar, deleteCar, updateCar } from "@/lib/admin.functions";
import type { Car, CarFleetStatus } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/cars")({
  head: () => ({ meta: [{ title: "Автопарк — Панель управления" }] }),
  component: AdminCarsPage,
});

type FormState = {
  brand: string;
  model: string;
  year: string;
  transmission: "AT" | "MT" | "CVT";
  seats: string;
  priceCity: string;
  priceOut: string;
  status: CarFleetStatus;
  plate: string;
  color: string;
  image: string;
};

const emptyForm: FormState = {
  brand: "",
  model: "",
  year: "2015",
  transmission: "AT",
  seats: "4",
  priceCity: "1800",
  priceOut: "2000",
  status: "free",
  plate: "",
  color: "",
  image: "",
};

function toForm(car: Car): FormState {
  return {
    brand: car.brand,
    model: car.model,
    year: String(car.year),
    transmission: (car.transmission as FormState["transmission"]) ?? "AT",
    seats: String(car.seats ?? 4),
    priceCity: String(car.pricePerDay),
    priceOut: String(car.pricePerDay + 200),
    status: car.status ?? "free",
    plate: car.plate ?? "",
    color: car.color ?? "",
    image: car.image ?? "",
  };
}

function AdminCarsPage() {
  const { data: cars } = useSuspenseQuery(adminCarsQueryOptions());
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | CarFleetStatus>("all");
  const [editing, setEditing] = useState<Car | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const createFn = useServerFn(createCar);
  const updateFn = useServerFn(updateCar);
  const deleteFn = useServerFn(deleteCar);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "cars"] });
    await queryClient.invalidateQueries({ queryKey: ["cars"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year) || 2015,
        transmission: form.transmission,
        seats: Number(form.seats) || 4,
        priceCity: Number(form.priceCity) || 0,
        priceOut: Number(form.priceOut) || 0,
        status: form.status,
        plate: form.plate.trim(),
        color: form.color.trim(),
        image: form.image.trim() || undefined,
      };
      return editing
        ? updateFn({ data: { id: editing.id, patch: payload } })
        : createFn({ data: payload });
    },
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error("Не удалось сохранить: база данных недоступна");
        return;
      }
      setOpen(false);
      await refresh();
      toast.success(editing ? "Автомобиль обновлён" : "Автомобиль добавлен");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error(
          res.reason === "has_bookings"
            ? "Нельзя удалить: по автомобилю есть незакрытые брони"
            : res.reason === "not_found"
              ? "Автомобиль не найден"
              : "Не удалось удалить автомобиль",
        );
        return;
      }
      await refresh();
      toast.success("Автомобиль удалён");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      if (status !== "all" && (c.status ?? "free") !== status) return false;
      if (q && !`${c.brand} ${c.model} ${c.plate ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [q, status, cars]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (car: Car) => {
    setEditing(car);
    setForm(toForm(car));
    setOpen(true);
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Автопарк"
        description={`${filtered.length} из ${cars.length} автомобилей`}
        actions={
          <Button onClick={openCreate}>
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
              onEdit={() => openEdit(c)}
              onDelete={() => {
                if (confirm(`Удалить ${c.brand} ${c.model}?`)) deleteMutation.mutate(c.id);
              }}
            />
          ))}
        </EntityGrid>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Редактирование авто" : "Новый автомобиль"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Марка" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
            <Field label="Модель" value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
            <Field label="Год" value={form.year} onChange={(v) => setForm({ ...form, year: v })} />
            <Field label="Гос. номер" value={form.plate} onChange={(v) => setForm({ ...form, plate: v })} />
            <Field label="Цвет" value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
            <Field label="Мест" value={form.seats} onChange={(v) => setForm({ ...form, seats: v })} />
            <Field
              label="Цена по городу, ₽"
              value={form.priceCity}
              onChange={(v) => setForm({ ...form, priceCity: v })}
            />
            <Field
              label="Цена за город, ₽"
              value={form.priceOut}
              onChange={(v) => setForm({ ...form, priceOut: v })}
            />
            <div className="space-y-1.5">
              <Label>Коробка</Label>
              <Select
                value={form.transmission}
                onValueChange={(v) => setForm({ ...form, transmission: v as FormState["transmission"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AT">AT</SelectItem>
                  <SelectItem value="CVT">CVT</SelectItem>
                  <SelectItem value="MT">MT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Статус</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as CarFleetStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Свободен</SelectItem>
                  <SelectItem value="busy">В аренде</SelectItem>
                  <SelectItem value="maintenance">ТО</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Field
                label="Ссылка на фото"
                value={form.image}
                onChange={(v) => setForm({ ...form, image: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="soft" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.brand || !form.model}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
