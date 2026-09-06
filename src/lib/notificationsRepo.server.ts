import { hasDatabase, query } from "@/lib/db.server";
import { sendPushToAdmins } from "@/lib/push.server";
import type { AdminNotification, AdminNotificationKind } from "@/types/domain";

type Row = {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  entity_id: string | null;
  read_at: Date | null;
  created_at: Date;
};

function mapRow(row: Row): AdminNotification {
  return {
    id: row.id,
    kind: row.kind as AdminNotificationKind,
    title: row.title,
    body: row.body,
    link: row.link,
    entityId: row.entity_id,
    unread: !row.read_at,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export type NotifyInput = {
  kind: AdminNotificationKind;
  title: string;
  body: string;
  link?: string | null;
  entityId?: string | null;
  /** Повторные события с тем же ключом создаются один раз. */
  dedupeKey?: string | null;
  push?: boolean;
};

/** Создаёт оповещение в базе и отправляет push администратору. Никогда не бросает исключение. */
export async function notifyAdmins(input: NotifyInput): Promise<void> {
  if (!hasDatabase()) return;
  try {
    const rows = await query<{ id: string }>(
      `insert into admin_notifications (kind, title, body, link, entity_id, dedupe_key)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (dedupe_key) do nothing
       returning id`,
      [input.kind, input.title, input.body, input.link ?? null, input.entityId ?? null, input.dedupeKey ?? null],
    );
    // Дубликат — второй раз не тревожим телефон.
    if (!rows.length) return;

    if (input.push !== false) {
      await sendPushToAdmins({
        title: input.title,
        body: input.body,
        link: input.link ?? "/admin",
        tag: rows[0].id,
      });
    }
  } catch (error) {
    console.error("[notifications] notifyAdmins failed", error);
  }
}

export async function fetchAdminNotifications(limit = 30): Promise<AdminNotification[]> {
  if (!hasDatabase()) return [];
  try {
    // Ротация: старше 90 дней не храним.
    await query(`delete from admin_notifications where created_at < now() - interval '90 days'`);
    const rows = await query<Row>(
      `select id, kind, title, body, link, entity_id, read_at, created_at
         from admin_notifications order by created_at desc limit $1`,
      [Math.min(Math.max(limit, 1), 100)],
    );
    return rows.map(mapRow);
  } catch (error) {
    console.error("[notifications] fetch failed", error);
    return [];
  }
}

export async function markNotificationReadInDb(id: string): Promise<void> {
  if (!hasDatabase()) return;
  await query(`update admin_notifications set read_at = now() where id = $1::uuid and read_at is null`, [id]).catch(
    () => undefined,
  );
}

export async function markAllNotificationsReadInDb(): Promise<void> {
  if (!hasDatabase()) return;
  await query(`update admin_notifications set read_at = now() where read_at is null`).catch(() => undefined);
}
