import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Wallet, TrendingUp, Hash } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { payments } from "@/mocks/payments";
import { getClientById } from "@/mocks/clients";
import { getCarById } from "@/mocks/cars";
import { exportPaymentsToExcel } from "@/lib/exportExcel";
import { toast } from "sonner";
import type { Payment } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/finance")({
  head: () => ({ meta: [{ title: "Финансы — Панель управления" }] }),
  component: AdminFinancePage,
});

const methodLabel = { card: "Карта", sbp: "СБП" } as const;
const statusMap: Record<Payment["status"], { label: string; cls: string }> = {
  success: { label: "Успешно", cls: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Ожидает", cls: "bg-amber-100 text-amber-700" },
  refunded: { label: "Возврат", cls: "bg-sky-100 text-sky-700" },
  failed: { label: "Ошибка", cls: "bg-rose-100 text-rose-700" },
};

const fmt = (iso: string) => new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function AdminFinancePage() {
  const success = payments.filter((p) => p.status === "success");
  const revenue = success.reduce((s, p) => s + p.amount, 0);
  const avg = success.length ? Math.round(revenue / success.length) : 0;

  const handleExport = () => {
    try {
      exportPaymentsToExcel();
      toast.success("Файл payments.xlsx готов");
    } catch {
      toast.error("Не удалось сгенерировать файл");
    }
  };

  return (
    <div>
      <PageHeader
        title="Финансы"
        description="История платежей и экспорт отчёта"
        actions={
          <Button onClick={handleExport}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Экспорт в Excel
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Всего платежей" value={String(payments.length)} icon={Hash} iconTone="bg-slate-100 text-slate-700" />
        <StatCard label="Оборот" value={`${revenue.toLocaleString("ru-RU")} ₽`} icon={Wallet} iconTone="bg-emerald-100 text-emerald-700" />
        <StatCard label="Средний чек" value={`${avg.toLocaleString("ru-RU")} ₽`} icon={TrendingUp} iconTone="bg-sky-100 text-sky-700" />
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>№ брони</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Авто</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead>Метод</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => {
              const client = getClientById(p.clientId);
              const car = getCarById(p.carId);
              const s = statusMap[p.status];
              return (
                <TableRow key={p.id}>
                  <TableCell className="text-sm whitespace-nowrap">{fmt(p.date)}</TableCell>
                  <TableCell className="text-sm font-mono">{p.bookingId}</TableCell>
                  <TableCell className="text-sm">{client?.name ?? p.clientId}</TableCell>
                  <TableCell className="text-sm">{car ? `${car.brand} ${car.model}` : p.carId}</TableCell>
                  <TableCell className="text-right text-sm font-semibold whitespace-nowrap">{p.amount.toLocaleString("ru-RU")} ₽</TableCell>
                  <TableCell className="text-sm">{methodLabel[p.method]}</TableCell>
                  <TableCell><Badge className={`border-0 font-medium ${s.cls}`}>{s.label}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
