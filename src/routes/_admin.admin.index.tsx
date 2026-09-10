import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Wallet,
  Car as CarIcon,
  Users,
  UserPlus,
  PlusCircle,
  BarChart3,
  Settings,
  Phone,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/StatCard";
import { StatusDot, fleetStatusLabels } from "@/components/admin/StatusDot";
import { AdminBookingCard } from "@/components/admin/AdminBookingCard";
import { EmptyState } from "@/components/admin/EntityCard";
import { NewClientDialog } from "@/components/admin/NewClientDialog";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  adminBookingRowsQueryOptions,
  adminClientsQueryOptions,
  adminPaymentsQueryOptions,
} from "@/lib/queries";
import { useCarLookup, useCars } from "@/state/AppDataContext";
import type { CarFleetStatus } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Дашборд — Панель управления NSK-RENT" },
      { name: "description", content: "Обзор бронирований, выручки, автопарка и клиентов." },
    ],
  }),
  component: DashboardPage,
});

const fmtRub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;
const dayKey = (value: string | Date) => new Date(value).toISOString().slice(0, 10);
const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

function DashboardPage() {
  const { data: bookings } = useSuspenseQuery(adminBookingRowsQueryOptions());
  const { data: clients } = useSuspenseQuery(adminClientsQueryOptions());
  const { data: payments } = useSuspenseQuery(adminPaymentsQueryOptions());
  const getCarById = useCarLookup();
  const cars = useCars();

  const today = todayKey();
  const yesterday = yesterdayKey();

  // Брони считаем по дате начала аренды — она есть у каждой записи.
  const bookingsToday = bookings.filter((b) => dayKey(b.startDate) === today).length;
  const bookingsYesterday = bookings.filter((b) => dayKey(b.startDate) === yesterday).length;
  const successToday = payments.filter((p) => p.status === "success" && dayKey(p.date) === today);
  const successYesterday = payments.filter(
    (p) => p.status === "success" && dayKey(p.date) === yesterday,
  );
  const revenueToday = successToday.reduce((s, p) => s + p.amount, 0);
  const revenueYesterday = successYesterday.reduce((s, p) => s + p.amount, 0);
  const cashToday = successToday.filter((p) => p.method === "cash").reduce((s, p) => s + p.amount, 0);

  const countStatus = (status: CarFleetStatus) =>
    cars.filter((c) => (c.status ?? "free") === status).length;
  const fleetStatus: Record<CarFleetStatus, number> = {
    free: countStatus("free"),
    busy: countStatus("busy"),
    maintenance: countStatus("maintenance"),
  };
  const totalFleet = Object.values(fleetStatus).reduce((a, b) => a + b, 0);

  const activeBookings = bookings.filter(
    (b) => b.status === "active" || b.status === "paid" || b.status === "pending",
  );
  const bookedDates = bookings.flatMap((b) => {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) days.push(new Date(d));
    return days;
  });

  const deltaLabel = (now: number, prev: number, money = false) => {
    const diff = now - prev;
    const value = money ? fmtRub(Math.abs(diff)) : String(Math.abs(diff));
    if (diff === 0) return "как вчера";
    return `${diff > 0 ? "+" : "−"}${value} к вчера`;
  };

  return (
    <div className="w-full space-y-6 py-4">
      <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Брони сегодня"
          value={String(bookingsToday)}
          delta={deltaLabel(bookingsToday, bookingsYesterday)}
          deltaTone={bookingsToday >= bookingsYesterday ? "up" : "down"}
          icon={CalendarCheck}
          iconTone="bg-sky-500/15 text-sky-600 public-dark:text-sky-400"
        />
        <StatCard
          label="Выручка сегодня"
          value={fmtRub(revenueToday)}
          delta={deltaLabel(revenueToday, revenueYesterday, true)}
          deltaTone={revenueToday >= revenueYesterday ? "up" : "down"}
          icon={Wallet}
          iconTone="bg-emerald-500/15 text-emerald-600 public-dark:text-emerald-400"
        />
        <StatCard
          label="Всего автомобилей"
          value={String(cars.length)}
          icon={CarIcon}
          iconTone="bg-amber-500/15 text-amber-600 public-dark:text-amber-400"
        />
        <StatCard
          label="Всего клиентов"
          value={String(clients.length)}
          icon={Users}
          iconTone="bg-violet-500/15 text-violet-600 public-dark:text-violet-400"
        />
      </div>

      <div className="grid w-full gap-4 xl:grid-cols-3">
        <section className="admin-card min-w-0 rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Статус автомобилей</h2>
          <ul className="space-y-3">
            {(Object.entries(fleetStatus) as [CarFleetStatus, number][]).map(([key, count]) => {
              const pct = totalFleet ? Math.round((count / totalFleet) * 100) : 0;
              return (
                <li key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <StatusDot status={key} />
                    <span className="admin-nums font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`admin-bar h-full ${fleetStatusLabels[key].dot}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="admin-nums mt-4 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
            Наличными сегодня: <span className="font-semibold text-foreground">{fmtRub(cashToday)}</span>
          </p>
        </section>

        <section className="min-w-0 xl:col-span-2">
          <h2 className="mb-3 text-base font-semibold">Активные брони</h2>
          {activeBookings.length === 0 ? (
            <EmptyState text="Активных броней нет" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeBookings.map((b, i) => (
                <AdminBookingCard
                  key={b.id}
                  booking={b}
                  car={getCarById(b.carId)}
                  client={{
                    id: b.clientId,
                    name: b.clientName,
                    phone: b.clientPhone,
                    ordersCount: 0,
                    rating: 5,
                  }}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Календарь занятости</h2>
          <Calendar
            mode="multiple"
            selected={bookedDates}
            onSelect={() => {}}
            className="rounded-md border-0"
            modifiersClassNames={{
              selected: "bg-destructive text-destructive-foreground hover:bg-destructive",
            }}
          />
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold">Последние клиенты</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/clients">Все</Link>
            </Button>
          </div>
          {clients.length === 0 ? (
            <EmptyState text="Клиентов пока нет" />
          ) : (
            <ul className="divide-y">
              {clients.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="admin-nums flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {c.phone || "—"}
                    </div>
                  </div>
                  <span className="admin-nums shrink-0 text-xs text-muted-foreground">
                    заказов: <span className="font-semibold text-foreground">{c.ordersCount}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <NewClientDialog
            trigger={
              <button type="button" className="tile-action">
                <UserPlus className="h-5 w-5" /> Новый клиент
              </button>
            }
          />
          <Link to="/admin/cars" search={{ new: true }} className="tile-action">
            <PlusCircle className="h-5 w-5" /> Добавить авто
          </Link>
          <Link to="/admin/finance" className="tile-action">
            <BarChart3 className="h-5 w-5" /> Отчёты
          </Link>
          <Link to="/admin/settings" className="tile-action">
            <Settings className="h-5 w-5" /> Настройки
          </Link>
        </div>
      </section>
    </div>
  );
}
