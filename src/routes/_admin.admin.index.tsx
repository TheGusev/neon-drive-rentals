import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Wallet, Car as CarIcon, Users, FilePlus2, UserPlus, PlusCircle, Droplets, BarChart3, Settings, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { StatCard } from "@/components/admin/StatCard";
import { StatusDot, fleetStatusLabels } from "@/components/admin/StatusDot";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { dashboardStats } from "@/mocks/dashboardStats";
import { bookings } from "@/mocks/bookings";
import { getCarById } from "@/mocks/cars";
import { clients, getClientById } from "@/mocks/clients";
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

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
const fmtRub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;

function DashboardPage() {
  const activeBookings = bookings.filter((b) => b.status === "active" || b.status === "paid" || b.status === "pending");
  const bookedDates = bookings.flatMap((b) => {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) days.push(new Date(d));
    return days;
  });
  const totalFleet = Object.values(dashboardStats.fleetStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <Button
        size="lg"
        className="h-12 w-full text-base font-semibold"
        onClick={() => toast("Форма создания договора скоро появится")}
      >
        <FilePlus2 className="mr-2 h-5 w-5" /> Создать договор аренды
      </Button>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Брони сегодня" value={String(dashboardStats.bookingsToday)} delta={`+${dashboardStats.bookingsDelta} к вчера`} deltaTone="up" icon={CalendarCheck} iconTone="bg-sky-100 text-sky-700" />
        <StatCard label="Выручка сегодня" value={fmtRub(dashboardStats.revenueToday)} delta={`+${fmtRub(dashboardStats.revenueDelta)}`} deltaTone="up" icon={Wallet} iconTone="bg-emerald-100 text-emerald-700" />
        <StatCard label="Всего автомобилей" value={String(dashboardStats.carsTotal)} icon={CarIcon} iconTone="bg-amber-100 text-amber-700" />
        <StatCard label="Всего клиентов" value={String(dashboardStats.clientsTotal)} icon={Users} iconTone="bg-violet-100 text-violet-700" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Статус автомобилей</h2>
          <ul className="space-y-3">
            {(Object.entries(dashboardStats.fleetStatus) as [CarFleetStatus, number][]).map(([key, count]) => {
              const pct = totalFleet ? Math.round((count / totalFleet) * 100) : 0;
              return (
                <li key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <StatusDot status={key} />
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${fleetStatusLabels[key].dot}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Активные брони</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Авто</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Даты</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeBookings.map((b) => {
                  const car = getCarById(b.carId);
                  const client = getClientById(b.clientId);
                  return (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                            {car?.image && <img src={car.image} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <div className="min-w-0 text-sm">
                            <div className="truncate font-medium">{car ? `${car.brand} ${car.model}` : b.carId}</div>
                            <div className="text-xs text-muted-foreground">{car?.plate}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{client?.name ?? b.clientId}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{fmtDate(b.startDate)} — {fmtDate(b.endDate)}</TableCell>
                      <TableCell className="text-right text-sm font-semibold whitespace-nowrap">{fmtRub(b.totalPrice)}</TableCell>
                      <TableCell><PaymentStatusBadge status={b.status} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
            modifiersClassNames={{ selected: "bg-rose-500 text-white hover:bg-rose-500" }}
          />
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Последние клиенты</h2>
          <ul className="divide-y">
            {clients.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {c.rating.toFixed(1)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <QuickAction icon={UserPlus} label="Новый клиент" onClick={() => toast("Форма клиента скоро появится")} />
          <QuickAction icon={PlusCircle} label="Добавить авто" onClick={() => toast("Форма авто скоро появится")} />
          <QuickAction icon={Droplets} label="Календарь мойки" onClick={() => toast("Календарь мойки скоро появится")} />
          <QuickAction icon={BarChart3} label="Отчёты" onClick={() => toast("Отчёты скоро появятся")} />
          <Link to="/admin/settings" className="flex flex-col items-center gap-2 rounded-xl border bg-background p-4 text-sm font-medium transition hover:border-primary hover:text-primary">
            <Settings className="h-5 w-5" /> Настройки
          </Link>
        </div>
      </section>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof UserPlus; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border bg-background p-4 text-sm font-medium transition hover:border-primary hover:text-primary"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
