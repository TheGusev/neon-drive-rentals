import type { Booking, BookingStatus, ClientDocument } from "@/types/domain";
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
  return_mileage?: number | string | null;
  return_mileage_source?: string | null;
  start_mileage?: number | string | null;
  tariff?: string | null;
  extension_status?: string | null;
  extension_end_date?: Date | string | null;
  extension_amount?: number | string | null;
};

async function ready(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const { ensureMigrations } = await import("@/lib/migrations.server");
  await ensureMigrations();
  return true;
}

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
    ...(row.return_mileage === null || row.return_mileage === undefined
      ? {}
      : { returnMileage: Number(row.return_mileage) }),
    ...(row.return_mileage_source === "client" || row.return_mileage_source === "admin"
      ? { returnMileageSource: row.return_mileage_source }
      : {}),
    ...(row.start_mileage === null || row.start_mileage === undefined ? {} : { startMileage: Number(row.start_mileage) }),
    tariff: row.tariff === "region" || row.tariff === "outside" ? row.tariff : "city",
    extensionStatus: (["pending", "paid", "conflict"].includes(String(row.extension_status))
      ? row.extension_status : "none") as Booking["extensionStatus"],
    ...(row.extension_end_date ? { extensionEndDate: iso(row.extension_end_date) } : {}),
    ...(row.extension_amount === null || row.extension_amount === undefined ? {} : { extensionAmount: Number(row.extension_amount) }),
  };
}

const SELECT_BOOKINGS = `
  select b.id, b.car_id, c.slug as car_slug, b.client_id,
         b.date_from, b.date_to, b.total, b.status, b.signed_at,
         b.keys_issued_at, b.returned_at, b.handled_by,
         b.return_mileage, b.return_mileage_source, b.start_mileage, b.tariff,
         b.extension_status, b.extension_end_date, b.extension_amount
  from bookings b
  left join cars c on c.id = b.car_id
`;

/** Availability-only view: no client ids, no amounts. Safe for public pages. */
export async function fetchPublicBookings(): Promise<Booking[]> {
  if (!hasDatabase()) return [];
  await ready();
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
  await ready();
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

    // Не возвращённые вовремя авто — по одному оповещению на бронь.
    const overdue = await query<{ id: string; title: string }>(
      `select b.id, coalesce(c.brand || ' ' || c.model, 'Автомобиль') as title
         from bookings b join cars c on c.id = b.car_id
        where b.status = 'active' and b.returned_at is null and b.date_to < now()`,
    );
    if (overdue.length) {
      const { notifyAdmins } = await import("@/lib/notificationsRepo.server");
      for (const row of overdue) {
        await notifyAdmins({
          kind: "return_overdue",
          title: "Авто не возвращено вовремя",
          body: `${row.title} · бронь ${row.id}`,
          link: "/admin/bookings",
          entityId: row.id,
          dedupeKey: `overdue:${row.id}`,
        });
      }
    }
  } catch (error) {
    console.error("[bookings] autoAdvance failed", error);
  }
}

export async function fetchBookings(): Promise<Booking[]> {
  if (!hasDatabase()) return mockBookings;
  await ready();
  const rows = await query<BookingRow>(`${SELECT_BOOKINGS} order by b.date_from desc`);
  return rows.map(mapBookingRow);
}

export async function fetchBookingById(id: string): Promise<Booking | null> {
  if (!hasDatabase()) return mockBookings.find((b) => b.id === id) ?? null;
  await ready();
  const rows = await query<BookingRow>(`${SELECT_BOOKINGS} where b.id::text = $1 limit 1`, [id]);
  return rows.length ? mapBookingRow(rows[0]) : null;
}

export async function fetchBookingsByPhone(phone: string): Promise<Booking[]> {
  if (!hasDatabase()) return mockBookings;
  await ready();
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

export type { AdminBookingRow } from "@/types/domain";
import type { AdminBookingRow } from "@/types/domain";

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
      documents: [],
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
      documents: ClientDocument[] | null;
    }
  >(
    `select b.id, b.car_id, c.slug as car_slug, b.client_id, b.date_from, b.date_to, b.total, b.status,
            b.signed_at, b.keys_issued_at, b.returned_at, b.handled_by,
            b.return_mileage, b.return_mileage_source,
            cl.name as client_name, cl.phone as client_phone,
            cl.email as client_email, c.brand, c.model, c.plate,
            b.start_mileage, b.tariff, b.extension_status, b.extension_end_date, b.extension_amount,
            coalesce(d.documents, '[]'::jsonb) as documents
     from bookings b
     left join cars c on c.id = b.car_id
     left join clients cl on cl.id = b.client_id
     left join lateral (
       select jsonb_agg(jsonb_build_object(
         'id', cd.id::text, 'type', cd.type, 'number', coalesce(cd.number, ''),
         'status', cd.status, 'uploadedAt', cd.uploaded_at,
         'birthDate', cd.birth_date, 'issuedBy', cd.issued_by, 'issueDate', cd.issue_date,
         'departmentCode', cd.department_code, 'registrationAddress', cd.registration_address,
         'expiryDate', cd.expiry_date
       ) order by cd.uploaded_at desc) as documents
       from client_documents cd where cd.client_id::text = b.client_id::text
     ) d on true
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
    documents: Array.isArray(row.documents) ? row.documents : [],
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
  await ready();
  const rows = await query<{ id: string; car_id: string }>(
    `update bookings set status = $2 where id::text = $1 returning id, car_id`,
    [id, toDbBookingStatus(status)],
  );
  if (!rows.length) return null;
  await syncCarStatus(String(rows[0].car_id));
  return fetchBookingById(id);
}

/** Полное удаление брони: исчезает из админки, кабинета клиента и календаря авто. */
export async function deleteBookingInDb(id: string): Promise<boolean> {
  if (!hasDatabase()) return false;
  await ready();
  const found = await query<{ id: string; car_id: string }>(
    `select id, car_id from bookings where id::text = $1`,
    [id],
  );
  if (!found.length) return false;
  const carDbId = String(found[0].car_id);

  // Связанные записи без каскада чистим вручную.
  await query(`delete from payments where booking_id::text = $1`, [id]).catch(() => undefined);
  await query(`delete from payment_events where booking_id = $1`, [id]).catch(() => undefined);
  await query(`delete from bookings where id::text = $1`, [id]);
  await syncCarStatus(carDbId);
  return true;
}

export async function markBookingSigned(id: string, ip: string): Promise<Booking | null> {
  if (!hasDatabase()) return fetchBookingById(id);
  await ready();
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
  tariff?: "city" | "region" | "outside";
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
  await ready();

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
      `insert into bookings (car_id, client_id, date_from, date_to, total, status, signed_at, signature_ip, tariff)
       values ($1, $2, $3::timestamptz, $4::timestamptz, $5, $6,
                case when $7::boolean then now() else null end, $8, $9)
       returning id, car_id, client_id, date_from, date_to, total, status, signed_at, tariff, start_mileage, extension_status, extension_end_date, extension_amount`,
      [
        input.carDbId,
        clientId,
        input.startDate,
        input.endDate,
        input.totalPrice,
        input.signed ? "confirmed" : "pending",
        Boolean(input.signed),
        input.signatureIp ?? null,
        input.tariff ?? "city",
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
  await ready();
  const rows = await query<{ id: string; car_id: string }>(
    `update bookings
        set keys_issued_at = coalesce(keys_issued_at, now()),
            start_mileage = coalesce(start_mileage, c.mileage, 0),
            handled_by = $2,
            status = 'active'
       from cars c
      where bookings.id::text = $1 and bookings.status in ('confirmed', 'active', 'pending')
        and c.id = bookings.car_id
      returning bookings.id, bookings.car_id`,
    [id, manager],
  );
  if (!rows.length) return null;
  await syncCarStatus(String(rows[0].car_id));
  return fetchBookingById(id);
}

/** Приём возврата: бронь завершается, авто освобождается, пробег фиксируется. */
export async function markReturned(
  id: string,
  manager: string,
  mileage?: number,
): Promise<Booking | null> {
  if (!hasDatabase()) return fetchBookingById(id);
  await ready();
  const rows = await query<{ id: string; car_id: string }>(
    `update bookings
        set returned_at = coalesce(returned_at, now()),
            handled_by = $2,
            return_mileage = coalesce($3::integer, return_mileage),
            return_mileage_source = case when $3::integer is null
                                         then return_mileage_source else 'admin' end,
            status = 'completed'
      where id::text = $1 and ($3::integer is null or $3::integer >= coalesce(start_mileage, 0))
      returning id, car_id`,
    [id, manager, mileage ?? null],
  );
  if (!rows.length) return null;
  await syncCarStatus(String(rows[0].car_id));
  await syncCarMileage(String(rows[0].car_id), id);
  return fetchBookingById(id);
}

/** Пересчитывает текущий пробег авто по всем принятым возвратам. */
async function syncCarMileage(carDbId: string, bookingId: string): Promise<void> {
  await query(
    `update cars c
        set mileage = greatest(coalesce((
          select max(b.return_mileage) from bookings b
           where b.car_id = $1 and b.returned_at is not null and b.return_mileage is not null
        ), 0), coalesce((select b.start_mileage from bookings b where b.id::text = $2), 0))
      where c.id = $1`,
    [carDbId, bookingId],
  ).catch(() => undefined);
}

/** Клиент вносит и исправляет показания до приёмки возврата. */
export async function submitClientMileage(
  bookingId: string,
  phone: string,
  mileage: number,
): Promise<{ ok: boolean; reason?: "not_found" | "locked" | "below_start" }> {
  if (!hasDatabase()) return { ok: false, reason: "not_found" };
  await ready();
  const rows = await query<{ id: string; returned_at: Date | null; status: string; start_mileage: number | null }>(
    `select b.id, b.returned_at, b.status, b.start_mileage
       from bookings b join clients cl on cl.id = b.client_id
      where b.id::text = $1
        and regexp_replace(cl.phone, '\\D', '', 'g') = regexp_replace($2, '\\D', '', 'g')
      limit 1`,
    [bookingId, phone],
  );
  if (!rows.length) return { ok: false, reason: "not_found" };
  if (rows[0].returned_at || rows[0].status === "completed") return { ok: false, reason: "locked" };
  if (mileage < Number(rows[0].start_mileage ?? 0)) return { ok: false, reason: "below_start" };
  await query(
    `update bookings set return_mileage = $2, return_mileage_source = 'client' where id::text = $1`,
    [bookingId, mileage],
  );
  return { ok: true };
}

/** Администратор вносит или исправляет пробег. */
export async function setAdminMileage(bookingId: string, mileage: number): Promise<Booking | null> {
  if (!hasDatabase()) return null;
  await ready();
  const rows = await query<{ id: string; car_id: string }>(
    `update bookings set return_mileage = $2, return_mileage_source = 'admin'
      where id::text = $1 and $2 >= coalesce(start_mileage, 0) returning id, car_id`,
    [bookingId, mileage],
  );
  if (!rows.length) return null;
  await syncCarMileage(String(rows[0].car_id), bookingId);
  return fetchBookingById(bookingId);
}

export type BookingExtension = { id: string; bookingId: string; previousEndDate: string; newEndDate: string; amount: number; status: string; appliedAt?: string };
type ExtensionRow = { id: string; booking_id: string; previous_date_to: Date | string; new_date_to: Date | string; amount: number | string; status: string; applied_at: Date | string | null };
const mapExtension = (row: ExtensionRow): BookingExtension => ({ id: String(row.id), bookingId: String(row.booking_id), previousEndDate: iso(row.previous_date_to), newEndDate: iso(row.new_date_to), amount: Number(row.amount), status: row.status, ...(row.applied_at ? { appliedAt: iso(row.applied_at) } : {}) });

export async function createPendingExtension(bookingId: string, phone: string, newEndDate: string): Promise<{ ok: true; extension: BookingExtension } | { ok: false; reason: "not_found" | "invalid_date" | "conflict" }> {
  if (!hasDatabase()) return { ok: false, reason: "not_found" };
  await ready();
  return withTransaction(async (run) => {
    const bookingRows = await run<{ id: string; car_id: string; date_to: Date | string; price_city: string | number; tariff: string }>(
      `select b.id, b.car_id, b.date_to, c.price_city, b.tariff
         from bookings b join cars c on c.id = b.car_id join clients cl on cl.id = b.client_id
        where b.id::text = $1 and regexp_replace(cl.phone, '\\D', '', 'g') = regexp_replace($2, '\\D', '', 'g')
          and b.status in ('confirmed','active') and b.returned_at is null for update`, [bookingId, phone],
    );
    if (!bookingRows.length) return { ok: false as const, reason: "not_found" as const };
    const booking = bookingRows[0]; const currentEnd = new Date(booking.date_to); const requestedEnd = new Date(newEndDate);
    if (!Number.isFinite(requestedEnd.getTime()) || requestedEnd <= currentEnd) return { ok: false as const, reason: "invalid_date" as const };
    const conflicts = await run<{ id: string }>(
      `select id from bookings where car_id = $1 and id <> $2::uuid and status = any($5::text[])
         and date_from < $4::timestamptz and $3::timestamptz < date_to for update`,
      [booking.car_id, bookingId, currentEnd.toISOString(), requestedEnd.toISOString(), BLOCKING_DB],
    );
    if (conflicts.length) return { ok: false as const, reason: "conflict" as const };
    const days = Math.ceil((requestedEnd.getTime() - currentEnd.getTime()) / 86_400_000);
    const multiplier = booking.tariff === "outside" ? 1.25 : booking.tariff === "region" ? 1.12 : 1;
    const amount = Math.round(days * Number(booking.price_city) * multiplier);
    await run(`update booking_extensions set status = 'cancelled' where booking_id = $1::uuid and status = 'pending'`, [bookingId]);
    const rows = await run<ExtensionRow>(`insert into booking_extensions (booking_id, previous_date_to, new_date_to, amount) values ($1::uuid, $2::timestamptz, $3::timestamptz, $4) returning *`, [bookingId, currentEnd.toISOString(), requestedEnd.toISOString(), amount]);
    await run(`update bookings set extension_status = 'pending', extension_end_date = $2::timestamptz, extension_amount = $3 where id = $1::uuid`, [bookingId, requestedEnd.toISOString(), amount]);
    return { ok: true as const, extension: mapExtension(rows[0]) };
  });
}

export async function linkExtensionPayment(extensionId: string, paymentId: string): Promise<void> {
  if (!hasDatabase()) return;
  await ready();
  await query(`update booking_extensions set payment_id = $2::bigint where id = $1::uuid`, [extensionId, paymentId]);
}

export async function applyBookingExtension(extensionId: string): Promise<{ ok: boolean; bookingId?: string; conflict?: boolean }> {
  if (!hasDatabase()) return { ok: false };
  await ready();
  return withTransaction(async (run) => {
    const rows = await run<ExtensionRow & { car_id: string }>(`select e.*, b.car_id from booking_extensions e join bookings b on b.id = e.booking_id where e.id = $1::uuid for update`, [extensionId]);
    if (!rows.length) return { ok: false };
    const extension = rows[0];
    if (extension.applied_at) return { ok: true, bookingId: extension.booking_id };
    const conflicts = await run<{ id: string }>(`select id from bookings where car_id = $1 and id <> $2::uuid and status = any($5::text[]) and date_from < $4::timestamptz and $3::timestamptz < date_to for update`, [extension.car_id, extension.booking_id, extension.previous_date_to, extension.new_date_to, BLOCKING_DB]);
    if (conflicts.length) { await run(`update booking_extensions set status = 'conflict' where id = $1::uuid`, [extensionId]); await run(`update bookings set extension_status = 'conflict' where id = $1::uuid`, [extension.booking_id]); return { ok: false, bookingId: extension.booking_id, conflict: true }; }
    await run(`update booking_extensions set status = 'paid', applied_at = now() where id = $1::uuid and applied_at is null`, [extensionId]);
    await run(`update bookings set date_to = $2::timestamptz, total = total + $3, extension_status = 'paid', extension_end_date = $2::timestamptz, extension_amount = $3 where id = $1::uuid`, [extension.booking_id, extension.new_date_to, extension.amount]);
    return { ok: true, bookingId: extension.booking_id };
  });
}
