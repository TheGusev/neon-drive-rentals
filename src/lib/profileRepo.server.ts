import { hasDatabase, query } from "@/lib/db.server";
import type { ClientDocument, ClientProfile, ClientReview } from "@/types/domain";

async function ready(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const { ensureMigrations } = await import("@/lib/migrations.server");
  await ensureMigrations();
  return true;
}

const iso = (value: Date | string | null | undefined): string =>
  value ? new Date(value).toISOString() : new Date().toISOString();

export type ProfileSummary = ClientProfile & { createdAt?: string; ordersCount: number };

export async function fetchProfileByClientId(clientId: string): Promise<ProfileSummary | null> {
  if (!(await ready())) return null;
  const rows = await query<{
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    created_at: Date | string | null;
    orders_count: string;
    rating: string | null;
    reviews_count: string;
  }>(
    `select cl.id, cl.name, cl.phone, cl.email, cl.created_at,
            (select count(*) from bookings b where b.client_id = cl.id) as orders_count,
            (select avg(r.rating) from client_reviews r where r.client_id = cl.id) as rating,
            (select count(*) from client_reviews r where r.client_id = cl.id) as reviews_count
     from clients cl where cl.id::text = $1 limit 1`,
    [clientId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name?.trim() || "Клиент",
    phone: row.phone ?? "",
    email: row.email ?? "",
    rating: row.rating ? Number(row.rating) : 0,
    reviewsCount: Number(row.reviews_count ?? 0),
    ordersCount: Number(row.orders_count ?? 0),
    createdAt: row.created_at ? iso(row.created_at) : undefined,
  };
}

export async function updateProfileName(clientId: string, name: string, email?: string): Promise<boolean> {
  if (!(await ready())) return false;
  const rows = await query<{ id: string }>(
    `update clients set name = $2, email = coalesce(nullif($3, ''), email) where id::text = $1 returning id`,
    [clientId, name, email ?? ""],
  );
  return rows.length > 0;
}

export async function fetchDocuments(clientId: string): Promise<Array<ClientDocument & { fileUrl?: string; comment?: string }>> {
  if (!(await ready())) return [];
  const rows = await query<{
    id: string;
    type: string;
    number: string | null;
    file_url: string | null;
    status: string;
    comment: string | null;
    uploaded_at: Date | string;
  }>(
    `select id, type, number, file_url, status, comment, uploaded_at
     from client_documents where client_id::text = $1 order by uploaded_at desc`,
    [clientId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    type: (r.type === "license" ? "license" : "passport") as ClientDocument["type"],
    number: r.number ?? "",
    status: (["verified", "rejected"].includes(r.status) ? r.status : "pending") as ClientDocument["status"],
    uploadedAt: iso(r.uploaded_at),
    fileUrl: r.file_url ?? undefined,
    comment: r.comment ?? undefined,
  }));
}

export async function insertDocument(input: {
  clientId: string;
  type: "passport" | "license";
  number?: string;
  fileUrl?: string;
}): Promise<boolean> {
  if (!(await ready())) return false;
  await query(
    `insert into client_documents (client_id, type, number, file_url, status)
     values ($1, $2, $3, $4, 'pending')`,
    [input.clientId, input.type, input.number ?? null, input.fileUrl ?? null],
  );
  return true;
}

export async function setDocumentStatus(
  id: string,
  status: "pending" | "verified" | "rejected",
  comment?: string,
): Promise<boolean> {
  if (!(await ready())) return false;
  const rows = await query<{ id: string }>(
    `update client_documents set status = $2, comment = $3, reviewed_at = now()
     where id::text = $1 returning id`,
    [id, status, comment ?? null],
  );
  return rows.length > 0;
}

export type AdminDocument = ClientDocument & {
  clientId: string;
  clientName: string;
  clientPhone: string;
  fileUrl?: string;
};

export async function fetchAllDocuments(): Promise<AdminDocument[]> {
  if (!(await ready())) return [];
  const rows = await query<{
    id: string;
    client_id: string;
    name: string | null;
    phone: string | null;
    type: string;
    number: string | null;
    file_url: string | null;
    status: string;
    uploaded_at: Date | string;
  }>(
    `select d.id, d.client_id, cl.name, cl.phone, d.type, d.number, d.file_url, d.status, d.uploaded_at
     from client_documents d join clients cl on cl.id = d.client_id
     order by (d.status = 'pending') desc, d.uploaded_at desc`,
  );
  return rows.map((r) => ({
    id: String(r.id),
    clientId: String(r.client_id),
    clientName: r.name?.trim() || "Клиент",
    clientPhone: r.phone ?? "",
    type: (r.type === "license" ? "license" : "passport") as ClientDocument["type"],
    number: r.number ?? "",
    status: (["verified", "rejected"].includes(r.status) ? r.status : "pending") as ClientDocument["status"],
    uploadedAt: iso(r.uploaded_at),
    fileUrl: r.file_url ?? undefined,
  }));
}

export async function fetchReviews(clientId: string): Promise<ClientReview[]> {
  if (!(await ready())) return [];
  const rows = await query<{
    id: string;
    author: string;
    rating: number | string;
    text: string;
    created_at: Date | string;
  }>(
    `select id, author, rating, text, created_at from client_reviews
     where client_id::text = $1 order by created_at desc limit 20`,
    [clientId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    author: r.author,
    rating: Number(r.rating),
    text: r.text,
    date: iso(r.created_at),
  }));
}

export async function fetchFavorites(clientId: string): Promise<string[]> {
  if (!(await ready())) return [];
  const rows = await query<{ car_id: string }>(
    `select car_id from client_favorites where client_id::text = $1`,
    [clientId],
  );
  return rows.map((r) => String(r.car_id));
}

export async function toggleFavoriteInDb(clientId: string, carId: string): Promise<string[]> {
  if (!(await ready())) return [];
  const existing = await query<{ car_id: string }>(
    `select car_id from client_favorites where client_id::text = $1 and car_id::text = $2`,
    [clientId, carId],
  );
  if (existing.length) {
    await query(`delete from client_favorites where client_id::text = $1 and car_id::text = $2`, [
      clientId,
      carId,
    ]);
  } else {
    await query(
      `insert into client_favorites (client_id, car_id) values ($1, $2) on conflict do nothing`,
      [clientId, carId],
    );
  }
  return fetchFavorites(clientId);
}
