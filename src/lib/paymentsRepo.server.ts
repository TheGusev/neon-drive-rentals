import type { Payment } from "@/types/domain";
import { hasDatabase, query } from "@/lib/db.server";
import { payments as mockPayments } from "@/mocks/payments";

export type AdminPayment = Payment & { clientName: string; clientPhone: string; carName: string };

type PaymentRow = {
  id: string;
  created_at: Date | string;
  booking_id: string | null;
  client_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  car_slug: string | null;
  brand: string | null;
  model: string | null;
  plate: string | null;
  amount: string | number | null;
  status: string | null;
  provider: string | null;
};

function mapStatus(value: string | null): Payment["status"] {
  const key = String(value ?? "").toLowerCase();
  if (key === "succeeded" || key === "success" || key === "paid") return "success";
  if (key === "refunded" || key === "refund") return "refunded";
  if (key === "canceled" || key === "cancelled" || key === "failed") return "failed";
  return "pending";
}

function mapPayment(row: PaymentRow): AdminPayment {
  return {
    id: String(row.id),
    date: new Date(row.created_at).toISOString(),
    bookingId: String(row.booking_id ?? ""),
    clientId: String(row.client_id ?? ""),
    carId: String(row.car_slug ?? ""),
    amount: Number(row.amount ?? 0),
    method: "card",
    status: mapStatus(row.status),
    clientName: row.client_name?.trim() || "Клиент",
    clientPhone: row.client_phone ?? "",
    carName: [row.brand, row.model].filter(Boolean).join(" ") || "—",
  };
}

async function ready(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const { ensureMigrations } = await import("@/lib/migrations.server");
  await ensureMigrations();
  return true;
}

const SELECT_PAYMENTS = `
  select p.id, p.created_at, p.booking_id, p.amount, p.status, p.provider,
         b.client_id, cl.name as client_name, cl.phone as client_phone,
         c.slug as car_slug, c.brand, c.model, c.plate
  from payments p
  left join bookings b on b.id = p.booking_id
  left join clients cl on cl.id = b.client_id
  left join cars c on c.id = b.car_id
`;

export async function fetchPaymentsAdmin(range?: { from?: string; to?: string }): Promise<AdminPayment[]> {
  if (!(await ready())) {
    return mockPayments.map((p) => ({ ...p, clientName: p.clientId, clientPhone: "", carName: p.carId }));
  }
  const params: unknown[] = [];
  const where: string[] = [];
  if (range?.from) {
    params.push(range.from);
    where.push(`p.created_at >= $${params.length}::timestamptz`);
  }
  if (range?.to) {
    params.push(range.to);
    where.push(`p.created_at <= $${params.length}::timestamptz`);
  }
  const sql = `${SELECT_PAYMENTS} ${where.length ? `where ${where.join(" and ")}` : ""} order by p.created_at desc`;
  const rows = await query<PaymentRow>(sql, params);
  return rows.map(mapPayment);
}

export async function insertPayment(input: {
  bookingId: string;
  amount: number;
  provider: string;
  providerId?: string;
  status?: string;
}): Promise<string | null> {
  if (!(await ready())) return null;
  const rows = await query<{ id: string }>(
    `insert into payments (booking_id, provider, provider_id, amount, status)
     values ($1::uuid, $2, $3, $4, $5) returning id`,
    [input.bookingId, input.provider, input.providerId ?? null, input.amount, input.status ?? "pending"],
  );
  return rows.length ? String(rows[0].id) : null;
}

export async function updatePaymentByProviderId(
  providerId: string,
  status: string,
): Promise<{ bookingId: string | null } | null> {
  if (!(await ready())) return null;
  const rows = await query<{ booking_id: string | null }>(
    `update payments set status = $2, updated_at = now() where provider_id = $1 returning booking_id`,
    [providerId, status],
  );
  return rows.length ? { bookingId: rows[0].booking_id ? String(rows[0].booking_id) : null } : null;
}

export type BookingPaymentRow = {
  id: string;
  amount: number;
  status: string;
  provider: string;
  providerId: string | null;
  createdAt: string;
};

/** Последний платёж по брони — для страницы счёта. */
export async function fetchLatestPaymentByBooking(
  bookingId: string,
): Promise<BookingPaymentRow | null> {
  if (!(await ready())) return null;
  const rows = await query<{
    id: string;
    amount: string | number | null;
    status: string | null;
    provider: string | null;
    provider_id: string | null;
    created_at: Date | string;
  }>(
    `select id, amount, status, provider, provider_id, created_at
       from payments where booking_id = $1::uuid
      order by created_at desc limit 1`,
    [bookingId],
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: String(row.id),
    amount: Number(row.amount ?? 0),
    status: String(row.status ?? "pending"),
    provider: String(row.provider ?? "stub"),
    providerId: row.provider_id ? String(row.provider_id) : null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function updatePaymentStatusById(id: string, status: string): Promise<void> {
  if (!(await ready())) return;
  await query(`update payments set status = $2, updated_at = now() where id = $1::uuid`, [id, status]);
}
