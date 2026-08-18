import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminBookingCard } from "@/components/admin/AdminBookingCard";
import { EntityGrid, EmptyState } from "@/components/admin/EntityCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { adminBookingsQueryOptions } from "@/lib/queries";
import { useCarLookup } from "@/state/AppDataContext";
import { getClientById } from "@/mocks/clients";
import type { BookingStatus } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/bookings")({
  head: () => ({ meta: [{ title: "Бронирования — Панель управления" }] }),
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const { data: bookings } = useSuspenseQuery(adminBookingsQueryOptions());
  const getCarById = useCarLookup();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | BookingStatus>("all");

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (tab !== "all" && b.status !== tab) return false;
      if (q) {
        const car = getCarById(b.carId);
        const client = getClientById(b.clientId);
        const hay = `${b.id} ${car?.brand} ${car?.model} ${client?.name}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [q, tab, bookings, getCarById]);

  return (
    <div className="w-full">
      <PageHeader title="Бронирования" description={`${filtered.length} заявок и аренд`} />

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
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="pending">Ожидают</TabsTrigger>
            <TabsTrigger value="paid">Оплачены</TabsTrigger>
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="completed">Завершены</TabsTrigger>
            <TabsTrigger value="cancelled">Отменены</TabsTrigger>
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
              client={getClientById(b.clientId)}
              index={i}
              onView={() => toast(`Просмотр брони ${b.id}`)}
            />
          ))}
        </EntityGrid>
      )}
    </div>
  );
}
