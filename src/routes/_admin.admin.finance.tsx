import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, CreditCard, FileSpreadsheet, Wallet, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { AdminPaymentCard } from "@/components/admin/AdminPaymentCard";
import { EntityGrid, EmptyState } from "@/components/admin/EntityCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
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

const fmtRub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;

function AdminFinancePage() {
  const getCarById = useCarLookup();
  const { data: payments } = useSuspenseQuery(adminPaymentsQueryOptions());
  const queryClient = useQueryClient();
  const doRefund = useServerFn(refundPayment);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "online" | "cash">("all");

  const handleRefund = async (paymentId: string, amount: number) => {
    if (!window.confirm(`Вернуть клиенту ${fmtRub(amount)}?`)) return;
    setRefundingId(paymentId);
    try {
      const res = await doRefund({ data: { paymentId, reason: "Возврат по решению администратора" } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Возврат оформлен: ${fmtRub(res.amount)}`);
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
  const cash = success.filter((p) => p.method === "cash");
  const online = success.filter((p) => p.method !== "cash");
  const cashRevenue = cash.reduce((s, p) => s + p.amount, 0);
  const onlineRevenue = online.reduce((s, p) => s + p.amount, 0);

  const visible = useMemo(() => {
    if (tab === "cash") return payments.filter((p) => p.method === "cash");
    if (tab === "online") return payments.filter((p) => p.method !== "cash");
    return payments;
  }, [payments, tab]);

  const handleExport = () => {
    try {
      exportPaymentsToExcel(visible, getCarById);
      toast.success("Файл с платежами готов");
    } catch {
      toast.error("Не удалось сгенерировать файл");
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Финансы"
        description="История платежей, наличные и экспорт отчёта"
        actions={
          <Button onClick={handleExport}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Экспорт в Excel
          </Button>
        }
      />

      <div className="mb-4 grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Оборот"
          value={fmtRub(revenue)}
          icon={Wallet}
          iconTone="bg-emerald-500/15 text-emerald-600 public-dark:text-emerald-400"
        />
        <StatCard
          label={`Онлайн · ${online.length}`}
          value={fmtRub(onlineRevenue)}
          icon={CreditCard}
          iconTone="bg-sky-500/15 text-sky-600 public-dark:text-sky-400"
        />
        <StatCard
          label={`Наличные · ${cash.length}`}
          value={fmtRub(cashRevenue)}
          icon={Banknote}
          iconTone="bg-amber-500/15 text-amber-600 public-dark:text-amber-400"
        />
        <StatCard
          label="Средний чек"
          value={fmtRub(avg)}
          icon={TrendingUp}
          iconTone="bg-violet-500/15 text-violet-600 public-dark:text-violet-400"
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-card p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          Наличные вносятся в брони: откройте бронь → «Оплата наличными» → сумма → «Принять».
        </p>
        <Button asChild variant="soft" size="sm">
          <Link to="/admin/bookings">
            <Banknote className="mr-2 h-4 w-4" /> Внести наличные
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-4">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="all">Все · {payments.length}</TabsTrigger>
          <TabsTrigger value="online">Онлайн · {payments.filter((p) => p.method !== "cash").length}</TabsTrigger>
          <TabsTrigger value="cash">Наличные · {payments.filter((p) => p.method === "cash").length}</TabsTrigger>
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <EmptyState text="Платежей пока нет" />
      ) : (
        <EntityGrid key={tab}>
          {visible.map((p, i) => (
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
