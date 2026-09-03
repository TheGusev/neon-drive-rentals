import { hasDatabase, query } from "@/lib/db.server";

export type ConsentKind = "pdn_registration" | "pdn_booking" | "offer" | "cookie";

export type ConsentInput = {
  kind: ConsentKind;
  docVersion?: string;
  clientId?: string | null;
  phone?: string | null;
  email?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  page?: string | null;
  payload?: Record<string, unknown>;
};

async function ready(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const { ensureMigrations } = await import("@/lib/migrations.server");
  await ensureMigrations();
  return true;
}

/** Фиксирует факт согласия пользователя (152-ФЗ: подтверждаемость согласия). */
export async function recordConsentRow(input: ConsentInput): Promise<boolean> {
  if (!(await ready())) return false;
  try {
    await query(
      `insert into consents (kind, doc_version, client_id, phone, email, ip, user_agent, page, payload)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
      [
        input.kind,
        input.docVersion ?? "1.0",
        input.clientId ?? null,
        input.phone ?? null,
        input.email ?? null,
        input.ip ?? null,
        (input.userAgent ?? "").slice(0, 500) || null,
        input.page ?? null,
        JSON.stringify(input.payload ?? {}),
      ],
    );
    return true;
  } catch (error) {
    console.error("[consents] insert failed", error);
    return false;
  }
}

export type ConsentRow = {
  id: string;
  kind: string;
  docVersion: string;
  phone: string | null;
  email: string | null;
  ip: string | null;
  createdAt: string;
};

export async function fetchConsents(limit = 200): Promise<ConsentRow[]> {
  if (!(await ready())) return [];
  const rows = await query<{
    id: string;
    kind: string;
    doc_version: string;
    phone: string | null;
    email: string | null;
    ip: string | null;
    created_at: Date | string;
  }>(
    `select id, kind, doc_version, phone, email, ip, created_at
       from consents order by created_at desc limit $1`,
    [limit],
  );
  return rows.map((r) => ({
    id: String(r.id),
    kind: r.kind,
    docVersion: r.doc_version,
    phone: r.phone,
    email: r.email,
    ip: r.ip,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}
