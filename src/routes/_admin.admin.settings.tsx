import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BellRing, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getPushPublicKey,
  removePushSubscription,
  savePushSubscription,
  sendTestPush,
} from "@/lib/notifications.functions";
import {
  currentPushStatus,
  isIos,
  isStandalone,
  subscribeToPush,
  unsubscribeFromPush,
  type PushStatus,
} from "@/lib/adminPush";

export const Route = createFileRoute("/_admin/admin/settings")({
  head: () => ({
    meta: [
      { title: "Настройки — Админ NSK-RENT" },
      { name: "description", content: "Оповещения на телефон, интеграции NSK-RENT." },
      { property: "og:title", content: "Настройки — Админ NSK-RENT" },
      { property: "og:description", content: "Push-оповещения администратора и интеграции." },
    ],
  }),
  component: SettingsPage,
});

const HINTS: Record<PushStatus, string> = {
  unsupported: "Этот браузер не поддерживает push-уведомления.",
  "needs-standalone":
    "На iPhone добавьте сайт на экран «Домой» (Поделиться → «На экран Домой») и откройте его оттуда — только так Apple разрешает уведомления.",
  denied: "Уведомления запрещены в настройках браузера — разрешите их для сайта и повторите.",
  "not-configured": "На сервере не заданы ключи VAPID — push пока отключён, оповещения видны в колокольчике.",
  subscribed: "Это устройство подключено: оповещения будут приходить даже при закрытом приложении.",
  idle: "Устройство ещё не подключено.",
};

function SettingsPage() {
  const publicKey = useServerFn(getPushPublicKey);
  const saveSub = useServerFn(savePushSubscription);
  const removeSub = useServerFn(removePushSubscription);
  const testPush = useServerFn(sendTestPush);
  const [status, setStatus] = useState<PushStatus>("idle");
  const [standaloneHint, setStandaloneHint] = useState(false);

  const { data: keyData } = useQuery({ queryKey: ["push", "key"], queryFn: () => publicKey() });

  useEffect(() => {
    void currentPushStatus().then(setStatus);
    setStandaloneHint(isIos() && !isStandalone());
  }, []);

  const enable = useMutation({
    mutationFn: async () => {
      const result = await subscribeToPush(keyData?.key ?? "");
      if (result.status !== "subscribed" || !result.subscription?.endpoint) return result.status;
      const keys = (result.subscription as PushSubscriptionJSON).keys ?? {};
      await saveSub({
        data: {
          endpoint: result.subscription.endpoint,
          p256dh: keys["p256dh"] ?? "",
          auth: keys["auth"] ?? "",
          label: navigator.userAgent.slice(0, 100),
        },
      });
      return "subscribed" as const;
    },
    onSuccess: (next) => {
      setStatus(next);
      toast[next === "subscribed" ? "success" : "error"](HINTS[next]);
    },
    onError: () => toast.error("Не удалось включить оповещения"),
  });

  const disable = useMutation({
    mutationFn: async () => {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) await removeSub({ data: { endpoint } });
    },
    onSuccess: () => {
      setStatus("idle");
      toast.success("Оповещения на этом устройстве отключены");
    },
  });

  const test = useMutation({
    mutationFn: () => testPush(),
    onSuccess: () => toast.success("Тестовое оповещение отправлено"),
    onError: () => toast.error("Не удалось отправить тест"),
  });

  return (
    <div className="space-y-4 pb-24">
      <PageHeader title="Настройки" description="Оповещения администратора и интеграции" />

      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Оповещения на телефон</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Приходят при новой брони, оплате, возврате, отмене, просрочке и сообщении клиента — даже когда приложение
          закрыто.
        </p>
        <p className="text-sm text-muted-foreground">{HINTS[status]}</p>
        {standaloneHint && (
          <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
            Откройте сайт как приложение с экрана «Домой» — тогда кнопка ниже сработает.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => enable.mutate()} disabled={enable.isPending || status === "subscribed"}>
            Включить на этом устройстве
          </Button>
          <Button variant="outline" onClick={() => disable.mutate()} disabled={status !== "subscribed"}>
            Отключить
          </Button>
          <Button variant="soft" onClick={() => test.mutate()} disabled={test.isPending}>
            Отправить тест
          </Button>
        </div>
      </Card>
    </div>
  );
}
