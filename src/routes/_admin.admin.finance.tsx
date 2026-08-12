import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Wallet, TrendingUp, Hash } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { AdminPaymentCard } from "@/components/admin/AdminPaymentCard";
import { EntityGrid, EmptyState } from "@/components/admin/EntityCard";
import { Button } from "@/components/ui/button";
import { payments } from "@/mocks/payments";
import { getClientById } from "@/mocks/clients";
import { getCarById } from "@/mocks/cars";
import { exportPaymentsToExcel } from "@/lib/exportExcel";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/finance")({
  head: () => ({ meta: [{ title: "Финансы — Панель управления" }] }),
  component: AdminFinancePage,
});

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
    <div className="w-full">
      <PageHeader
        title="Финансы"
        description="История платежей и экспорт отчёта"
        actions={
          <Button onClick={handleExport}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Экспорт в Excel
          </Button>
        }
      />

      <div className="mb-6 grid w-full grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Всего платежей"
          value={String(payments.length)}
          icon={Hash}
          iconTone="bg-muted text-muted-foreground"
        />
        <StatCard
          label="Оборот"
          value={`${revenue.toLocaleString("ru-RU")} ₽`}
          icon={Wallet}
          iconTone="bg-emerald-500/15 text-emerald-600 public-dark:text-emerald-400"
        />
        <StatCard
          label="Средний чек"
          value={`${avg.toLocaleString("ru-RU")} ₽`}
          icon={TrendingUp}
          iconTone="bg-sky-500/15 text-sky-600 public-dark:text-sky-400"
        />
      </div>

      {payments.length === 0 ? (
        <EmptyState text="Платежей пока нет" />
      ) : (
        <EntityGrid>
          {payments.map((p, i) => (
            <AdminPaymentCard
              key={p.id}
              payment={p}
              car={getCarById(p.carId)}
              client={getClientById(p.clientId)}
              index={i}
            />
          ))}
        </EntityGrid>
      )}
    </div>
  );
}
