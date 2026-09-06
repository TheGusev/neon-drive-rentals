import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AdminNotification } from "@/types/domain";

export const listAdminNotifications = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminNotification[]> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { fetchAdminNotifications } = await import("@/lib/notificationsRepo.server");
    return fetchAdminNotifications(30);
  },
);

export const markNotificationRead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1).max(80) }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { markNotificationReadInDb } = await import("@/lib/notificationsRepo.server");
    await markNotificationReadInDb(data.id);
    return { ok: true as const };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { markAllNotificationsReadInDb } = await import("@/lib/notificationsRepo.server");
  await markAllNotificationsReadInDb();
  return { ok: true as const };
});

export const getPushPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { vapidPublicKey } = await import("@/lib/push.server");
  return { key: vapidPublicKey() };
});

const subscriptionSchema = z.object({
  endpoint: z.string().min(10).max(1000),
  p256dh: z.string().min(10).max(300),
  auth: z.string().min(4).max(300),
  label: z.string().max(120).optional(),
});

export const savePushSubscription = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscriptionSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { savePushSubscriptionInDb } = await import("@/lib/push.server");
    return { ok: await savePushSubscriptionInDb(data) };
  });

export const removePushSubscription = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ endpoint: z.string().min(10).max(1000) }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { removePushSubscriptionInDb } = await import("@/lib/push.server");
    return { ok: await removePushSubscriptionInDb(data.endpoint) };
  });

/** Проверка: отправляет тестовое уведомление на подписанные устройства. */
export const sendTestPush = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { notifyAdmins } = await import("@/lib/notificationsRepo.server");
  await notifyAdmins({
    kind: "booking_created",
    title: "Проверка оповещений",
    body: "Если вы видите это сообщение — push работает.",
    link: "/admin",
  });
  return { ok: true as const };
});
