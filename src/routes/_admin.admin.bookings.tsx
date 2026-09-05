import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminBookingCard } from "@/components/admin/AdminBookingCard";
import { EntityGrid, EmptyState } from "@/components/admin/EntityCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { updateBookingStatus, issueKeys, acceptReturn, deleteBooking } from "@/lib/bookings.functions";
import { AdminBookingDetailSheet } from "@/components/admin/AdminBookingDetailSheet";
import { adminBookingRowsQueryOptions } from "@/lib/queries";
import { useCarLookup } from "@/state/AppDataContext";
import type { AdminBookingRow, BookingStatus } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/bookings")({
  head: () => ({ meta: [{ title: "Бронирования — Панель управления" }] }),
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const { data: bookings } = useSuspenseQuery(adminBookingRowsQueryOptions());
  const getCarById = useCarLookup();
  const queryClient = useQueryClient();
  const changeStatus = useServerFn(updateBookingStatus);
  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: BookingStatus }) => changeStatus({ data: vars }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error("Не удалось изменить статус");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Статус обновлён");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });
  const runIssueKeys = useServerFn(issueKeys);
  const runAcceptReturn = useServerFn(acceptReturn);
  const journeyMutation = useMutation({
    mutationFn: (vars: { id: string; action: "keys" | "return" }) =>
      vars.action === "keys"
        ? runIssueKeys({ data: { id: vars.id } })
        : runAcceptReturn({ data: { id: vars.id } }),
    onSuccess: async (res, vars) => {
      if (!res.ok) {
        toast.error("Не удалось обновить маршрут аренды");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success(vars.action === "keys" ? "Ключи выданы" : "Возврат принят");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const runDelete = useServerFn(deleteBooking);
  const deleteMutation = useMutation({
    mutationFn: (vars: { id: string }) => runDelete({ data: vars }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error("Не удалось удалить бронь");
        return;
      }
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await queryClient.invalidateQueries({ queryKey: ["cars"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Бронь удалена");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | BookingStatus>("all");

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (tab !== "all" && b.status !== tab) return false;
      if (q) {
        const car = getCarById(b.carId);
        const hay = `${b.id} ${car?.brand ?? ""} ${car?.model ?? ""} ${b.carName} ${b.clientName} ${b.clientPhone}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [q, tab, bookings, getCarById]);

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      all: bookings.length,
      pending: 0,
      paid: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const b of bookings) base[b.status] = (base[b.status] ?? 0) + 1;
    return base;
  }, [bookings]);

  return (
    <div className="w-full">
      <PageHeader
        title="Брони"
        description={`${counts.active} активных аренд · ${counts.pending} ожидают оплаты · всего ${bookings.length}`}
      />

      <div className="mb-4 w-full space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру, авто или клиенту"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="all">Все · {counts.all}</TabsTrigger>
            <TabsTrigger value="pending">Ожидают · {counts.pending}</TabsTrigger>
            <TabsTrigger value="paid">Оплачены · {counts.paid}</TabsTrigger>
            <TabsTrigger value="active">Активные · {counts.active}</TabsTrigger>
            <TabsTrigger value="completed">Завершены · {counts.completed}</TabsTrigger>
            <TabsTrigger value="cancelled">Отменены · {counts.cancelled}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="Заявок не найдено" />
      ) : (
        <EntityGrid key={`${q}|${tab}`}>
          {filtered.map((b, i) => (
            <AdminBookingCard
              key={b.id}
              booking={b}
              car={getCarById(b.carId)}
              client={{ id: b.clientId, name: b.clientName, phone: b.clientPhone, ordersCount: 0, rating: 5 }}
              index={i}
              onView={() => setSelectedId(b.id)}
              onStatusChange={(status) => statusMutation.mutate({ id: b.id, status })}
              statusPending={statusMutation.isPending}
              onIssueKeys={() => journeyMutation.mutate({ id: b.id, action: "keys" })}
              onAcceptReturn={() => journeyMutation.mutate({ id: b.id, action: "return" })}
              journeyPending={journeyMutation.isPending}
            />
          ))}
        </EntityGrid>
      )}

      <AdminBookingDetailSheet
        booking={(bookings.find((b) => b.id === selectedId) as AdminBookingRow | undefined) ?? null}
        car={getCarById(bookings.find((b) => b.id === selectedId)?.carId ?? "")}
        open={Boolean(selectedId)}
        onOpenChange={(open) => setSelectedId(open ? selectedId : null)}
        onIssueKeys={() => selectedId && journeyMutation.mutate({ id: selectedId, action: "keys" })}
        onAcceptReturn={() => selectedId && journeyMutation.mutate({ id: selectedId, action: "return" })}
        onStatusChange={(status) => selectedId && statusMutation.mutate({ id: selectedId, status })}
        onDelete={() => selectedId && deleteMutation.mutate({ id: selectedId })}
        pending={journeyMutation.isPending || statusMutation.isPending || deleteMutation.isPending}
      />
    </div>
  );
}
