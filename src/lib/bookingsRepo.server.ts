import type { Booking, BookingStatus } from "@/types/domain";
import { hasDatabase, query, withTransaction } from "@/lib/db.server";
import { mockBookings } from "@/data/mockBookings";
import { PICKUP_POINT } from "@/mocks/pickupPoints";

type BookingRow = {
  id: string;
  car_slug: string | null;
  car_id: string;
  client_id: string | null;
  date_from: Date | string;
  date_to: Date | string;
  total: number | string | null;
  status: string | null;
  signed_at?: Date | string | null;
  keys_issued_at?: Date | string | null;
  returned_at?: Date | string | null;
  handled_by?: string | null;
};

const BOOKING_STATUSES: BookingStatus[] = ["paid", "pending", "active", "completed", "cancelled"];
const BOOKING_SYNONYMS: Record<string, BookingStatus> = {
  new: "pending",
  created: "pending",
  confirmed: "paid",
  success: "paid",
  in_progress: "active",
  ongoing: "active",
  done: "completed",
  finished: "completed",
  canceled: "cancelled",
  rejected: "cancelled",
};

export function normalizeBookingStatus(value: unknown): BookingStatus {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  if ((BOOKING_STATUSES as string[]).includes(key)) return key as BookingStatus;
  return BOOKING_SYNONYMS[key] ?? "pending";
}

const iso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

function mapBookingRow(row: BookingRow): Booking {
  return {
    id: String(row.id),
    carId: String(row.car_slug ?? row.car_id),
    clientId: String(row.client_id ?? ""),
    startDate: iso(row.date_from),
    endDate: iso(row.date_to),
    totalPrice: Number(row.total ?? 0),
    status: normalizeBookingStatus(row.status),
    pickupAddress: PICKUP_POINT.address,
    contractStatus: row.signed_at ? "signed" : "pending",
    keysIssuedAt: row.keys_issued_at ? iso(row.keys_issued_at) : undefined,
    returnedAt: row.returned_at ? iso(row.returned_at) : undefined,
    handledBy: row.handled_by ?? undefined,
  };
}

const SELECT_BOOKINGS = `
  select b.id, b.car_id, c.slug as car_slug, b.client_id,
         b.date_from, b.date_to, b.total, b.status, b.signed_at,
         b.keys_issued_at, b.returned_at, b.handled_by
  from bookings b
  left join cars c on c.id = b.car_id
`;

/** Availability-only view: no client ids, no amounts. Safe for public pages. */
export async function fetchPublicBookings(): Promise<Booking[]> {
  if (!hasDatabase()) return [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<Booking[]>((resolve) => {
      timer = setTimeout(() => resolve([]), 4_500);
    });
    const task = query<BookingRow>(`${SELECT_BOOKINGS} order by b.date_from desc`).then((rows) =>
      rows.map(mapBookingRow).map((booking) => ({ ...booking, clientId: "", totalPrice: 0 })),
    );
    return await Promise.race([task, timeout]);
  } catch (error) {
    console.error("[public-data] bookings failed; serving empty availability", error);
    return [];
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Автопереводы статусов брони по календарю (без участия менеджера):
 *  - оплаченная бронь, у которой наступила дата выдачи → «Активна», авто «занято»;
 *  - активная бронь, у которой прошла дата возврата более чем на сутки и авто
 *    принято (returned_at) → «Завершена».
 * Вызывается перед чтением списков, чтобы админка и кабинет видели актуальное.
 */
export async function autoAdvanceBookings(): Promise<void> {
  if (!hasDatabase()) return;
  try {
    await query(
      `update bookings set status = 'active'
        where status = 'confirmed' and date_from <= now() and date_to > now()`,
    );
    await query(
      `update bookings set status = 'completed'
        where status = 'active' and returned_at is not null`,
    );
    // Авто освобождается, если по нему не осталось действующих броней.
    await query(
      `update cars c set status = 'available'
        where c.status = 'busy'
          and not exists (
            select 1 from bookings b
             where b.car_id = c.id and b.status in ('confirmed','active')
          )`,
    );
    await query(
      `update cars c set status = 'busy'
        where c.status = 'available'
          and exists (
            select 1 from bookings b
             where b.car_id = c.id and b.status = 'active'
          )`,
    );
  } catch (error) {
    console.error("[bookings] autoAdvance failed", error);
  }
}

export async function fetchBookings(): Promise<Booking[]> {
  if (!hasDatabase()) return mockBookings;
  const rows = await query<BookingRow>(`${SELECT_BOOKINGS} order by b.date_from desc`);
  return rows.map(mapBookingRow);
}

export async function fetchBookingById(id: string): Promise<Booking | null> {
  if (!hasDatabase()) return mockBookings.find((b) => b.id === id) ?? null;
  const rows = await query<BookingRow>(`${SELECT_BOOKINGS} where b.id::text = $1 limit 1`, [id]);
  return rows.length ? mapBookingRow(rows[0]) : null;
}

export async function fetchBookingsByPhone(phone: string): Promise<Booking[]> {
  if (!hasDatabase()) return mockBookings;
  await autoAdvanceBookings();
  const rows = await query<BookingRow>(
    `${SELECT_BOOKINGS} join clients cl on cl.id = b.client_id
     where regexp_replace(cl.phone, '\\D', '', 'g') = regexp_replace($1, '\\D', '', 'g')
     order by b.date_from desc`,
    [phone],
  );
  return rows.map(mapBookingRow);
}

/** Доменный статус → значение в БД (в базе confirmed, в UI paid). */
export function toDbBookingStatus(status: BookingStatus): string {
  return status === "paid" ? "confirmed" : status;
}

export type AdminBookingRow = Booking & {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  carName: string;
  carPlate: string;
  signedAt?: string;
};

export async function fetchBookingsAdmin(filters?: {
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AdminBookingRow[]> {
  await autoAdvanceBookings();
  if (!hasDatabase()) {
    return mockBookings.map((b) => ({
      ...b,
      clientName: "Клиент",
      clientPhone: "",
      carName: b.carId,
      carPlate: "",
    }));
  }

  const params: unknown[] = [];
  const where: string[] = [];
  if (filters?.status) {
    params.push(toDbBookingStatus(filters.status));
    where.push(`b.status = $${params.length}`);
  }
  if (filters?.dateFrom) {
    params.push(filters.dateFrom);
    where.push(`b.date_to >= $${params.length}::timestamptz`);
  }
  if (filters?.dateTo) {
    params.push(filters.dateTo);
    where.push(`b.date_from <= $${params.length}::timestamptz`);
  }

  const rows = await query<
    BookingRow & {
      client_name: string | null;
      client_phone: string | null;
      client_email: string | null;
      brand: string | null;
      model: string | null;
      plate: string | null;
      signed_at: Date | string | null;
    }
  >(
    `select b.id, b.car_id, c.slug as car_slug, b.client_id, b.date_from, b.date_to, b.total, b.status,
            b.signed_at, b.keys_issued_at, b.returned_at, b.handled_by, cl.name as client_name, cl.phone as client_phone,
            cl.email as client_email, c.brand, c.model, c.plate
     from bookings b
     left join cars c on c.id = b.car_id
     left join clients cl on cl.id = b.client_id
     ${where.length ? `where ${where.join(" and ")}` : ""}
     order by b.date_from desc`,
    params,
  );

  return rows.map((row) => ({
    ...mapBookingRow(row),
    clientName: row.client_name?.trim() || "Клиент",
    clientPhone: row.client_phone ?? "",
    clientEmail: row.client_email?.trim() || undefined,
    carName: [row.brand, row.model].filter(Boolean).join(" ") || String(row.car_slug ?? ""),
    carPlate: row.plate ?? "",
    signedAt: row.signed_at ? new Date(row.signed_at).toISOString() : undefined,
  }));
}

/** Синхронизирует статус авто с состоянием его броней. */
async function syncCarStatus(carDbId: string): Promise<void> {
  const active = await query<{ id: string }>(
    `select id from bookings where car_id = $1 and status in ('confirmed','active') limit 1`,
    [carDbId],
  );
  const next = active.length ? "busy" : "available";
  await query(`update cars set status = $2 where id = $1 and status in ('available','busy')`, [
    carDbId,
    next,
  ]);
}

export async function updateBookingStatusInDb(
  id: string,
  status: BookingStatus,
): Promise<Booking | null> {
  if (!hasDatabase()) {
    const found = mockBookings.find((b) => b.id === id);
    return found ? { ...found, status } : null;
  }
  const rows = await query<{ id: string; car_id: string }>(
    `update bookings set status = $2 where id::text = $1 returning id, car_id`,
    [id, toDbBookingStatus(status)],
  );
  if (!rows.length) return null;
  await syncCarStatus(String(rows[0].car_id));
  return fetchBookingById(id);
}

export async function markBookingSigned(id: string, ip: string): Promise<Booking | null> {
  if (!hasDatabase()) return fetchBookingById(id);
  const rows = await query<{ id: string; car_id: string }>(
    `update bookings set status = 'confirmed', signed_at = now(), signature_ip = $2
     where id::text = $1 returning id, car_id`,
    [id, ip],
  );
  if (!rows.length) return null;
  await syncCarStatus(String(rows[0].car_id));
  return fetchBookingById(id);
}

export type CreateBookingInput = {
  carId: string; // public slug
  carDbId: string; // primary key in cars
  clientPhone: string;
  clientName?: string;
  clientEmail?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  /** Договор подписан кодом из SMS прямо в чекауте. */
  signed?: boolean;
  signatureIp?: string;
};

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: "conflict" | "car_not_found" };

const BLOCKING = ["pending", "paid", "active"];
const BLOCKING_DB = ["pending", "confirmed", "active"];

export async function insertBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  if (!hasDatabase()) {
    const conflict = mockBookings.some(
      (b) =>
        b.carId === input.carId &&
        BLOCKING.includes(b.status) &&
        new Date(input.startDate) < new Date(b.endDate) &&
        new Date(b.startDate) < new Date(input.endDate),
    );
    if (conflict) return { ok: false, reason: "conflict" };
    return {
      ok: true,
      booking: {
        id: `bk-local-${Date.now()}`,
        carId: input.carId,
        clientId: "local",
        startDate: input.startDate,
        endDate: input.endDate,
        totalPrice: input.totalPrice,
        status: "pending",
        pickupAddress: PICKUP_POINT.address,
      },
    };
  }

  return withTransaction(async (run) => {
    const conflicts = await run<{ id: string }>(
      `select id from bookings
       where car_id = $1
         and status = any($4::text[])
         and date_from < $3::timestamptz
         and $2::timestamptz < date_to
       for update`,
      [input.carDbId, input.startDate, input.endDate, BLOCKING_DB],
    );
    if (conflicts.length) return { ok: false as const, reason: "conflict" as const };

    const existing = await run<{ id: string }>(
      `select id from clients where regexp_replace(phone, '\\D', '', 'g') = regexp_replace($1, '\\D', '', 'g') limit 1`,
      [input.clientPhone],
    );
    const clientId = existing.length
      ? existing[0].id
      : (
          await run<{ id: string }>(
            `insert into clients (phone, name, email) values ($1, $2, $3) returning id`,
            [input.clientPhone, input.clientName ?? "Клиент", input.clientEmail ?? null],
          )
        )[0].id;

    const inserted = await run<BookingRow>(
      `insert into bookings (car_id, client_id, date_from, date_to, total, status, signed_at, signature_ip)
       values ($1, $2, $3::timestamptz, $4::timestamptz, $5, $6,
               case when $7::boolean then now() else null end, $8)
       returning id, car_id, client_id, date_from, date_to, total, status, signed_at`,
      [
        input.carDbId,
        clientId,
        input.startDate,
        input.endDate,
        input.totalPrice,
        input.signed ? "confirmed" : "pending",
        Boolean(input.signed),
        input.signatureIp ?? null,
      ],
    );

    return {
      ok: true as const,
      booking: mapBookingRow({ ...inserted[0], car_slug: input.carId }),
    };
  });
}

/**
 * Выдача ключей: фиксируем время и менеджера, бронь переводим в active.
 * Только администратор — вызывается из защищённой server function.
 */
export async function markKeysIssued(id: string, manager: string): Promise<Booking | null> {
  if (!hasDatabase()) return fetchBookingById(id);
  const rows = await query<{ id: string; car_id: string }>(
    `update bookings
        set keys_issued_at = coalesce(keys_issued_at, now()),
            handled_by = $2,
            status = 'active'
      where id::text = $1 and status in ('confirmed', 'active', 'pending')
      returning id, car_id`,
    [id, manager],
  );
  if (!rows.length) return null;
  await syncCarStatus(String(rows[0].car_id));
  return fetchBookingById(id);
}

/** Приём возврата: бронь завершается, авто освобождается. */
export async function markReturned(id: string, manager: string): Promise<Booking | null> {
  if (!hasDatabase()) return fetchBookingById(id);
  const rows = await query<{ id: string; car_id: string }>(
    `update bookings
        set returned_at = coalesce(returned_at, now()),
            handled_by = $2,
            status = 'completed'
      where id::text = $1
      returning id, car_id`,
    [id, manager],
  );
  if (!rows.length) return null;
  await syncCarStatus(String(rows[0].car_id));
  return fetchBookingById(id);
}
