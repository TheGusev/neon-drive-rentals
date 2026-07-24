import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bookings } from "@/mocks/bookings";
import { getCarById } from "@/mocks/cars";
import { getClientById } from "@/mocks/clients";
import type { BookingStatus } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/bookings")({
  head: () => ({ meta: [{ title: "Бронирования — Панель управления" }] }),
  component: AdminBookingsPage,
});

const fmt = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "2-digit" });

function AdminBookingsPage() {
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
  }, [q, tab]);

  return (
    <div>
      <PageHeader title="Бронирования" description="Все заявки и активные аренды" />

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск по номеру, авто или клиенту" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
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

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№</TableHead>
              <TableHead>Авто</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Даты</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => {
              const car = getCarById(b.carId);
              const client = getClientById(b.clientId);
              return (
                <TableRow key={b.id}>
                  <TableCell className="text-sm font-mono">{b.id}</TableCell>
                  <TableCell className="text-sm">{car ? `${car.brand} ${car.model}` : b.carId}</TableCell>
                  <TableCell className="text-sm">{client?.name ?? b.clientId}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{fmt(b.startDate)} — {fmt(b.endDate)}</TableCell>
                  <TableCell className="text-right text-sm font-semibold whitespace-nowrap">{b.totalPrice.toLocaleString("ru-RU")} ₽</TableCell>
                  <TableCell><PaymentStatusBadge status={b.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => toast(`Просмотр брони ${b.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Заявок не найдено</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
