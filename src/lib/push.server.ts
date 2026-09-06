import { hasDatabase, query } from "@/lib/db.server";

export type PushPayload = {
  title: string;
  body: string;
  link?: string | null;
  tag?: string;
};

type SubRow = { id: string; endpoint: string; p256dh: string; auth: string };

export function pushConfigured(): boolean {
  return Boolean(process.env["VAPID_PUBLIC_KEY"] && process.env["VAPID_PRIVATE_KEY"]);
}

export function vapidPublicKey(): string {
  return process.env["VAPID_PUBLIC_KEY"] ?? "";
}

/** Отправляет push всем подписанным устройствам администратора. */
export async function sendPushToAdmins(payload: PushPayload): Promise<void> {
  if (!hasDatabase() || !pushConfigured()) return;

  let subs: SubRow[] = [];
  try {
    subs = await query<SubRow>(`select id, endpoint, p256dh, auth from push_subscriptions`);
  } catch (error) {
    console.error("[push] cannot read subscriptions", error);
    return;
  }
  if (!subs.length) return;

  let webpush: typeof import("web-push");
  try {
    const mod = await import("web-push");
    webpush = (mod.default ?? mod) as typeof import("web-push");
  } catch (error) {
    console.error("[push] web-push unavailable", error);
    return;
  }

  webpush.setVapidDetails(
    process.env["VAPID_SUBJECT"] || "mailto:info@rentsib.ru",
    process.env["VAPID_PUBLIC_KEY"]!,
    process.env["VAPID_PRIVATE_KEY"]!,
  );

  const body = JSON.stringify(payload);
  const stale: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
          { TTL: 3600, urgency: "high" },
        );
        await query(`update push_subscriptions set last_used_at = now() where id = $1`, [sub.id]);
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) stale.push(sub.id);
        else console.error("[push] send failed", status, error);
      }
    }),
  );

  if (stale.length) {
    await query(`delete from push_subscriptions where id = any($1::uuid[])`, [stale]).catch(() => undefined);
  }
}

export async function savePushSubscriptionInDb(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  label?: string;
}): Promise<boolean> {
  if (!hasDatabase()) return false;
  await query(
    `insert into push_subscriptions (endpoint, p256dh, auth, label)
     values ($1, $2, $3, $4)
     on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth, label = excluded.label`,
    [input.endpoint, input.p256dh, input.auth, input.label ?? null],
  );
  return true;
}

export async function removePushSubscriptionInDb(endpoint: string): Promise<boolean> {
  if (!hasDatabase()) return false;
  await query(`delete from push_subscriptions where endpoint = $1`, [endpoint]);
  return true;
}
