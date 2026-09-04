import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Wallet, TrendingUp, Hash } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { AdminPaymentCard } from "@/components/admin/AdminPaymentCard";
import { EntityGrid, EmptyState } from "@/components/admin/EntityCard";
import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminPaymentsQueryOptions } from "@/lib/queries";
import { refundPayment } from "@/lib/payments.functions";
import { useCarLookup } from "@/state/AppDataContext";
import { exportPaymentsToExcel } from "@/lib/exportExcel";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/finance")({
  head: () => ({ meta: [{ title: "Финансы — Панель управления" }] }),
  component: AdminFinancePage,
});

function AdminFinancePage() {
  const getCarById = useCarLookup();
  const { data: payments } = useSuspenseQuery(adminPaymentsQueryOptions());
  const queryClient = useQueryClient();
  const doRefund = useServerFn(refundPayment);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const handleRefund = async (paymentId: string, amount: number) => {
    if (!window.confirm(`Вернуть клиенту ${amount.toLocaleString("ru-RU")} ₽?`)) return;
    setRefundingId(paymentId);
    try {
      const res = await doRefund({ data: { paymentId, reason: "Возврат по решению администратора" } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Возврат оформлен: ${res.amount.toLocaleString("ru-RU")} ₽`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch {
      toast.error("Не удалось оформить возврат");
    } finally {
      setRefundingId(null);
    }
  };
  const success = payments.filter((p) => p.status === "success");
  const revenue = success.reduce((s, p) => s + p.amount, 0);
  const avg = success.length ? Math.round(revenue / success.length) : 0;

  const handleExport = () => {
    try {
      exportPaymentsToExcel(getCarById);
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
              client={{ id: p.clientId, name: p.clientName, phone: p.clientPhone, ordersCount: 0, rating: 5 }}
              index={i}
              refunding={refundingId === p.id}
              onRefund={(payment) => void handleRefund(payment.id, payment.amount)}
            />
          ))}
        </EntityGrid>
      )}
    </div>
  );
}
