import type { Client } from "@/types/domain";
import { hasDatabase, query } from "@/lib/db.server";
import { clients as mockClients } from "@/mocks/clients";

type ClientRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  blocked: boolean | null;
  created_at: Date | string | null;
  orders_count: string | number | null;
  last_booking_at: Date | string | null;
  paid_total: string | number | null;
};

const iso = (value: Date | string | null): string | undefined =>
  value ? new Date(value).toISOString() : undefined;

function mapClient(row: ClientRow): Client & { paidTotal: number } {
  return {
    id: String(row.id),
    name: row.name?.trim() || "Клиент",
    phone: row.phone ?? "",
    email: row.email ?? undefined,
    ordersCount: Number(row.orders_count ?? 0),
    rating: 5,
    blacklisted: Boolean(row.blocked),
    createdAt: iso(row.created_at),
    lastBookingAt: iso(row.last_booking_at),
    paidTotal: Number(row.paid_total ?? 0),
  };
}

async function ready(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const { ensureMigrations } = await import("@/lib/migrations.server");
  await ensureMigrations();
  return true;
}

export type AdminClient = Client & { paidTotal: number };

export async function fetchClientsAdmin(): Promise<AdminClient[]> {
  if (!(await ready())) return mockClients.map((c) => ({ ...c, paidTotal: 0 }));
  const rows = await query<ClientRow>(
    `select cl.id, cl.name, cl.phone, cl.email, cl.blocked, cl.created_at,
            count(b.id) as orders_count,
            max(b.date_from) as last_booking_at,
            coalesce(sum(p.amount) filter (where p.status in ('succeeded','success')), 0) as paid_total
     from clients cl
     left join bookings b on b.client_id = cl.id
     left join payments p on p.booking_id = b.id
     group by cl.id
     order by max(b.date_from) desc nulls last, cl.created_at desc`,
  );
  return rows.map(mapClient);
}

export async function setClientBlocked(id: string, blocked: boolean): Promise<boolean> {
  if (!(await ready())) return false;
  const rows = await query<{ id: string }>(
    `update clients set blocked = $2 where id::text = $1 returning id`,
    [id, blocked],
  );
  return rows.length > 0;
}

const digits = (value: string) => value.replace(/\D/g, "");

export async function findOrCreateClientByPhone(
  phone: string,
  name?: string,
  email?: string,
): Promise<string | null> {
  if (!(await ready())) return null;
  const existing = await query<{ id: string }>(
    `select id from clients where regexp_replace(phone, '\\D', '', 'g') = $1 limit 1`,
    [digits(phone)],
  );
  if (existing.length) return String(existing[0].id);

  const inserted = await query<{ id: string }>(
    `insert into clients (phone, name, email) values ($1, $2, $3) returning id`,
    [phone, name ?? "Клиент", email ?? null],
  );
  return inserted.length ? String(inserted[0].id) : null;
}

export async function fetchClientByPhone(phone: string): Promise<Client | null> {
  if (!(await ready())) return null;
  const rows = await query<ClientRow>(
    `select cl.id, cl.name, cl.phone, cl.email, cl.blocked, cl.created_at,
            0 as orders_count, null as last_booking_at, 0 as paid_total
     from clients cl
     where regexp_replace(cl.phone, '\\D', '', 'g') = $1 limit 1`,
    [digits(phone)],
  );
  return rows.length ? mapClient(rows[0]) : null;
}

export async function linkYandexAccount(input: {
  yandexId: string;
  phone?: string;
  email?: string;
  name?: string;
}): Promise<{ id: string; phone: string } | null> {
  if (!(await ready())) return null;

  const byYandex = await query<{ id: string; phone: string }>(
    `select id, phone from clients where yandex_id = $1 limit 1`,
    [input.yandexId],
  );
  if (byYandex.length) return byYandex[0];

  if (input.phone) {
    const byPhone = await query<{ id: string; phone: string }>(
      `update clients set yandex_id = $2, email = coalesce(email, $3)
       where regexp_replace(phone, '\\D', '', 'g') = $1 returning id, phone`,
      [digits(input.phone), input.yandexId, input.email ?? null],
    );
    if (byPhone.length) return byPhone[0];
  }

  if (input.email) {
    const byEmail = await query<{ id: string; phone: string }>(
      `update clients set yandex_id = $2 where lower(email) = lower($1) returning id, phone`,
      [input.email, input.yandexId],
    );
    if (byEmail.length) return byEmail[0];
  }

  const created = await query<{ id: string; phone: string }>(
    `insert into clients (phone, name, email, yandex_id) values ($1, $2, $3, $4) returning id, phone`,
    [input.phone ?? `yandex:${input.yandexId}`, input.name ?? "Клиент", input.email ?? null, input.yandexId],
  );
  return created.length ? created[0] : null;
}

export type ClientAccount = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  passwordHash: string | null;
};

type AccountRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  password_hash: string | null;
};

const mapAccount = (row: AccountRow): ClientAccount => ({
  id: String(row.id),
  name: row.name?.trim() || "Клиент",
  phone: row.phone ?? "",
  email: row.email,
  passwordHash: row.password_hash,
});

/** Аккаунт с паролем по e-mail. */
export async function findAccountByEmail(email: string): Promise<ClientAccount | null> {
  if (!(await ready())) return null;
  const rows = await query<AccountRow>(
    `select id, name, phone, email, password_hash from clients
     where lower(email) = lower($1) and password_hash is not null
     order by created_at asc limit 1`,
    [email.trim()],
  );
  return rows.length ? mapAccount(rows[0]) : null;
}

export async function findAccountByPhone(phone: string): Promise<ClientAccount | null> {
  if (!(await ready())) return null;
  const rows = await query<AccountRow>(
    `select id, name, phone, email, password_hash from clients
     where regexp_replace(phone, '\\D', '', 'g') = $1
     order by (password_hash is null), created_at asc limit 1`,
    [digits(phone)],
  );
  return rows.length ? mapAccount(rows[0]) : null;
}

export type RegisterResult =
  | { ok: true; client: ClientAccount }
  | { ok: false; reason: "email_taken" | "no_db" };

/**
 * Регистрация: если по телефону уже есть гостевая запись (бронировал без
 * аккаунта) — привязываем пароль к ней, чтобы история броней сохранилась.
 */
export async function registerClientAccount(input: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
}): Promise<RegisterResult> {
  if (!(await ready())) return { ok: false, reason: "no_db" };

  const taken = await query<{ id: string }>(
    `select id from clients where lower(email) = lower($1) and password_hash is not null limit 1`,
    [input.email],
  );
  if (taken.length) return { ok: false, reason: "email_taken" };

  const guest = await query<{ id: string }>(
    `select id from clients
     where regexp_replace(phone, '\\D', '', 'g') = $1 and password_hash is null
     order by created_at asc limit 1`,
    [digits(input.phone)],
  );

  const rows = guest.length
    ? await query<AccountRow>(
        `update clients
         set name = coalesce(nullif($2, ''), name),
             email = $3,
             password_hash = $4
         where id = $1
         returning id, name, phone, email, password_hash`,
        [guest[0].id, input.name, input.email, input.passwordHash],
      )
    : await query<AccountRow>(
        `insert into clients (name, email, phone, password_hash)
         values ($1, $2, $3, $4)
         returning id, name, phone, email, password_hash`,
        [input.name, input.email, input.phone, input.passwordHash],
      );

  return rows.length
    ? { ok: true, client: mapAccount(rows[0]) }
    : { ok: false, reason: "no_db" };
}

/** Установка/смена пароля существующему клиенту (после оплаты или сброса). */
export async function setClientPassword(input: {
  clientId: string;
  passwordHash: string;
  email?: string;
  name?: string;
}): Promise<boolean> {
  if (!(await ready())) return false;
  if (input.email) {
    const taken = await query<{ id: string }>(
      `select id from clients
       where lower(email) = lower($1) and password_hash is not null and id::text <> $2 limit 1`,
      [input.email, input.clientId],
    );
    if (taken.length) return false;
  }
  const rows = await query<{ id: string }>(
    `update clients
     set password_hash = $2,
         email = coalesce(nullif($3, ''), email),
         name = coalesce(nullif($4, ''), name)
     where id::text = $1 returning id`,
    [input.clientId, input.passwordHash, input.email ?? "", input.name ?? ""],
  );
  return rows.length > 0;
}

export async function markLogin(clientId: string): Promise<void> {
  if (!(await ready())) return;
  await query(`update clients set last_login_at = now() where id::text = $1`, [clientId]);
}
