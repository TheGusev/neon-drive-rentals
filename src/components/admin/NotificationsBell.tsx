import { useState } from "react";
import { Bell, BellRing, Check, Smartphone } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  getPushPublicKey,
  listAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  savePushSubscription,
} from "@/lib/notifications.functions";
import { currentPushStatus, isIos, subscribeToPush } from "@/lib/adminPush";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.round(hours / 24);
  if (days === 1) return "вчера";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

export function NotificationsBell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  const list = useServerFn(listAdminNotifications);
  const readOne = useServerFn(markNotificationRead);
  const readAll = useServerFn(markAllNotificationsRead);
  const publicKey = useServerFn(getPushPublicKey);
  const saveSub = useServerFn(savePushSubscription);

  const { data = [] } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () => list(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const unread = data.filter((n) => n.unread).length;

  const markAll = useMutation({
    mutationFn: () => readAll({}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  async function openItem(id: string, link: string | null) {
    setOpen(false);
    await readOne({ data: { id } }).catch(() => undefined);
    void queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    if (link) void navigate({ to: link });
  }

  async function enablePush() {
    setPushBusy(true);
    try {
      const { key } = await publicKey();
      const result = await subscribeToPush(key);
      if (result.status === "subscribed" && result.subscription?.endpoint) {
        const keys = (result.subscription as { keys?: { p256dh?: string; auth?: string } }).keys;
        await saveSub({
          data: {
            endpoint: result.subscription.endpoint,
            p256dh: keys?.p256dh ?? "",
            auth: keys?.auth ?? "",
            label: navigator.userAgent.slice(0, 100),
          },
        });
        toast.success("Оповещения на телефон включены");
      } else if (result.status === "needs-standalone") {
        toast.info("Откройте сайт как приложение", {
          description: "На iPhone: «Поделиться» → «На экран Домой», затем откройте значок и нажмите кнопку снова.",
        });
      } else if (result.status === "denied") {
        toast.error("Уведомления запрещены", {
          description: "Разрешите их в настройках телефона для этого приложения.",
        });
      } else if (result.status === "not-configured") {
        toast.error("Push не настроен на сервере");
      } else {
        toast.error("Устройство не поддерживает push");
      }
    } catch (error) {
      toast.error("Не удалось включить оповещения", { description: String(error) });
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void currentPushStatus();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unread > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Уведомления</span>
          {unread > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3.5 w-3.5" /> Прочитать все
            </button>
          )}
        </div>

        <ul className="max-h-80 divide-y overflow-y-auto">
          {data.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">Пока нет событий</li>
          )}
          {data.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => void openItem(n.id, n.link)}
                className="flex w-full gap-3 px-4 py-3 text-left text-sm transition hover:bg-muted"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-sky-500" : "bg-transparent"}`}
                />
                <span className="min-w-0">
                  <span className="block font-medium">{n.title}</span>
                  <span className="block text-xs text-muted-foreground">{n.body}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {relativeTime(n.createdAt)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            disabled={pushBusy}
            onClick={() => void enablePush()}
          >
            <Smartphone className="h-4 w-4" />
            {pushBusy ? "Подключаем…" : "Оповещения на телефон"}
          </Button>
          {isIos() && (
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              На iPhone добавьте сайт на экран «Домой» и включите оповещения из значка приложения.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
