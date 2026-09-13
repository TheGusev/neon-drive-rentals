import { hasDatabase, query } from "@/lib/db.server";

export type ChatMessage = {
  id: string;
  clientId: string;
  sender: "client" | "admin";
  body: string;
  createdAt: string;
  unread: boolean;
};

export type ChatThread = {
  clientId: string;
  clientName: string;
  clientPhone: string;
  lastBody: string;
  lastAt: string;
  unread: number;
};

type Row = {
  id: string;
  client_id: string;
  sender: string;
  body: string;
  created_at: Date | string;
  read_at: Date | string | null;
};

async function ready(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const { ensureMigrations } = await import("@/lib/migrations.server");
  await ensureMigrations();
  return true;
}

function mapRow(row: Row): ChatMessage {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    sender: row.sender === "admin" ? "admin" : "client",
    body: row.body,
    createdAt: new Date(row.created_at).toISOString(),
    unread: !row.read_at,
  };
}

export async function fetchThreadMessages(clientId: string, limit = 200): Promise<ChatMessage[]> {
  if (!(await ready())) return [];
  const rows = await query<Row>(
    `select id, client_id, sender, body, created_at, read_at
       from messages where client_id = $1::integer
       order by created_at asc limit $2`,
    [clientId, Math.min(Math.max(limit, 1), 500)],
  );
  return rows.map(mapRow);
}

export async function sendMessage(input: {
  clientId: string;
  sender: "client" | "admin";
  body: string;
}): Promise<ChatMessage | null> {
  if (!(await ready())) return null;
  const rows = await query<Row>(
    `insert into messages (client_id, sender, body) values ($1::integer, $2, $3)
     returning id, client_id, sender, body, created_at, read_at`,
    [input.clientId, input.sender, input.body],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

/** Помечает прочитанными сообщения собеседника. */
export async function markThreadRead(clientId: string, reader: "client" | "admin"): Promise<void> {
  if (!(await ready())) return;
  const other = reader === "admin" ? "client" : "admin";
  await query(
    `update messages set read_at = now() where client_id = $1::integer and sender = $2 and read_at is null`,
    [clientId, other],
  ).catch(() => undefined);
}

export async function countUnreadFor(clientId: string, reader: "client" | "admin"): Promise<number> {
  if (!(await ready())) return 0;
  const other = reader === "admin" ? "client" : "admin";
  const rows = await query<{ n: string }>(
    `select count(*)::text as n from messages where client_id = $1::integer and sender = $2 and read_at is null`,
    [clientId, other],
  );
  return Number(rows[0]?.n ?? 0);
}

export async function fetchThreads(): Promise<ChatThread[]> {
  if (!(await ready())) return [];
  const rows = await query<{
    client_id: string;
    name: string | null;
    phone: string | null;
    last_body: string;
    last_at: Date | string;
    unread: string;
  }>(
    `select m.client_id,
            cl.name, cl.phone,
            (array_agg(m.body order by m.created_at desc))[1] as last_body,
            max(m.created_at) as last_at,
            count(*) filter (where m.sender = 'client' and m.read_at is null)::text as unread
       from messages m
       join clients cl on cl.id = m.client_id
      group by m.client_id, cl.name, cl.phone
      order by max(m.created_at) desc
      limit 100`,
  );
  return rows.map((r) => ({
    clientId: String(r.client_id),
    clientName: r.name?.trim() || "Клиент",
    clientPhone: r.phone ?? "",
    lastBody: r.last_body,
    lastAt: new Date(r.last_at).toISOString(),
    unread: Number(r.unread ?? 0),
  }));
}
