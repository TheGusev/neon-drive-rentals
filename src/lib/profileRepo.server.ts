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
            0 as rating,
            (select count(*) from car_reviews r where r.client_id = cl.id) as reviews_count
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

export type IdentityDocument = ClientDocument & { comment?: string };

export async function fetchDocuments(clientId: string): Promise<IdentityDocument[]> {
  if (!(await ready())) return [];
  const rows = await query<{
    id: string;
    type: string;
    number: string | null;
    status: string;
    comment: string | null;
    uploaded_at: Date | string;
    birth_date: Date | string | null;
    issued_by: string | null;
    issue_date: Date | string | null;
    department_code: string | null;
    registration_address: string | null;
    expiry_date: Date | string | null;
  }>(
    `select id, type, number, status, comment, uploaded_at, birth_date, issued_by,
            issue_date, department_code, registration_address, expiry_date
     from client_documents where client_id::text = $1 order by uploaded_at desc`,
    [clientId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    type: (r.type === "license" ? "license" : "passport") as ClientDocument["type"],
    number: r.number ?? "",
    status: (["verified", "rejected"].includes(r.status) ? r.status : "pending") as ClientDocument["status"],
    uploadedAt: iso(r.uploaded_at),
    comment: r.comment ?? undefined,
    birthDate: r.birth_date ? iso(r.birth_date).slice(0, 10) : undefined,
    issuedBy: r.issued_by ?? undefined,
    issueDate: r.issue_date ? iso(r.issue_date).slice(0, 10) : undefined,
    departmentCode: r.department_code ?? undefined,
    registrationAddress: r.registration_address ?? undefined,
    expiryDate: r.expiry_date ? iso(r.expiry_date).slice(0, 10) : undefined,
  }));
}

export async function upsertIdentityDocument(input: {
  clientId: string;
  type: "passport" | "license";
  number: string;
  birthDate?: string;
  issuedBy?: string;
  issueDate: string;
  departmentCode?: string;
  registrationAddress?: string;
  expiryDate?: string;
}): Promise<boolean> {
  if (!(await ready())) return false;
  const rows = await query<{ id: string }>(
    `insert into client_documents
       (client_id, type, number, birth_date, issued_by, issue_date, department_code,
        registration_address, expiry_date, file_url, status, comment, reviewed_at, uploaded_at)
     values ($1, $2, $3, $4::date, $5, $6::date, $7, $8, $9::date, null, 'pending', null, null, now())
     on conflict (client_id, type) do update set
       number = excluded.number, birth_date = excluded.birth_date, issued_by = excluded.issued_by,
       issue_date = excluded.issue_date, department_code = excluded.department_code,
       registration_address = excluded.registration_address, expiry_date = excluded.expiry_date,
       file_url = null, status = 'pending', comment = null, reviewed_at = null, uploaded_at = now()
     returning id`,
    [input.clientId, input.type, input.number, input.birthDate ?? null, input.issuedBy ?? null,
      input.issueDate, input.departmentCode ?? null, input.registrationAddress ?? null,
      input.expiryDate ?? null],
  );
  return rows.length > 0;
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
  comment?: string;
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
    status: string;
    uploaded_at: Date | string;
    birth_date: Date | string | null;
    issued_by: string | null;
    issue_date: Date | string | null;
    department_code: string | null;
    registration_address: string | null;
    expiry_date: Date | string | null;
    comment: string | null;
  }>(
    `select d.id, d.client_id, cl.name, cl.phone, d.type, d.number, d.status, d.uploaded_at,
            d.birth_date, d.issued_by, d.issue_date, d.department_code,
            d.registration_address, d.expiry_date, d.comment
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
    birthDate: r.birth_date ? iso(r.birth_date).slice(0, 10) : undefined,
    issuedBy: r.issued_by ?? undefined,
    issueDate: r.issue_date ? iso(r.issue_date).slice(0, 10) : undefined,
    departmentCode: r.department_code ?? undefined,
    registrationAddress: r.registration_address ?? undefined,
    expiryDate: r.expiry_date ? iso(r.expiry_date).slice(0, 10) : undefined,
    comment: r.comment ?? undefined,
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
    `select r.id, coalesce(cl.name, 'Вы') as author, r.rating, r.text, r.created_at
       from car_reviews r left join clients cl on cl.id = r.client_id
      where r.client_id::text = $1 order by r.created_at desc limit 20`,
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

export async function fetchContractData(bookingId: string, clientId: string) {
  if (!(await ready())) return null;
  const bookings = await query<{
    id: string; date_from: Date | string; date_to: Date | string; total: string | number;
    tariff: string; signed_at: Date | string | null; name: string | null; phone: string | null;
    email: string | null; brand: string; model: string; year: number; color: string | null; plate: string | null;
  }>(
    `select b.id, b.date_from, b.date_to, b.total, b.tariff, b.signed_at,
            cl.name, cl.phone, cl.email, c.brand, c.model, c.year, c.plate, c.specs->>'color' as color
       from bookings b join clients cl on cl.id = b.client_id join cars c on c.id = b.car_id
      where b.id = $1::uuid and b.client_id::text = $2 limit 1`, [bookingId, clientId],
  );
  if (!bookings.length) return null;
  const documents = await fetchDocuments(clientId);
  const row = bookings[0];
  return {
    id: String(row.id), startDate: iso(row.date_from), endDate: iso(row.date_to), totalPrice: Number(row.total), tariff: row.tariff,
    signed: Boolean(row.signed_at), client: { name: row.name ?? "Клиент", phone: row.phone ?? "", email: row.email ?? "" },
    car: { brand: row.brand, model: row.model, year: Number(row.year), color: row.color ?? "—", plate: row.plate ?? "—" }, documents,
  };
}
