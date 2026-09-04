import type { CarReview } from "@/types/domain";
import { hasDatabase, query } from "@/lib/db.server";

type ReviewRow = {
  id: string;
  booking_id: string;
  car_slug: string | null;
  car_id: string;
  author: string | null;
  rating: number | string;
  text: string | null;
  service_comment: string | null;
  hidden: boolean;
  created_at: Date | string;
};

const iso = (v: Date | string) => (v instanceof Date ? v.toISOString() : new Date(v).toISOString());

function map(row: ReviewRow): CarReview {
  return {
    id: String(row.id),
    bookingId: String(row.booking_id),
    carId: String(row.car_slug ?? row.car_id),
    author: row.author?.trim() || "Клиент",
    rating: Number(row.rating ?? 0),
    text: row.text ?? "",
    serviceComment: row.service_comment ?? "",
    hidden: Boolean(row.hidden),
    date: iso(row.created_at),
  };
}

const SELECT = `
  select r.id, r.booking_id, r.car_id, c.slug as car_slug, cl.name as author,
         r.rating, r.text, r.service_comment, r.hidden, r.created_at
  from car_reviews r
  left join cars c on c.id = r.car_id
  left join clients cl on cl.id = r.client_id
`;

/** Публичные отзывы по автомобилю (по slug или id). */
export async function fetchCarReviews(carSlug: string): Promise<CarReview[]> {
  if (!hasDatabase()) return [];
  try {
    const rows = await query<ReviewRow>(
      `${SELECT} where r.hidden = false and (c.slug = $1 or r.car_id::text = $1)
       order by r.created_at desc limit 50`,
      [carSlug],
    );
    return rows.map(map).map((r) => ({ ...r, serviceComment: undefined }));
  } catch (error) {
    console.error("[reviews] fetchCarReviews failed", error);
    return [];
  }
}

/** Агрегат по всем авто: средний рейтинг и количество отзывов. */
export async function fetchReviewAggregates(): Promise<
  Record<string, { rating: number; count: number }>
> {
  if (!hasDatabase()) return {};
  try {
    const rows = await query<{ slug: string | null; avg: string; cnt: string }>(
      `select c.slug, avg(r.rating)::numeric(3,2) as avg, count(*) as cnt
       from car_reviews r join cars c on c.id = r.car_id
       where r.hidden = false
       group by c.slug`,
    );
    const out: Record<string, { rating: number; count: number }> = {};
    for (const row of rows) {
      if (!row.slug) continue;
      out[row.slug] = { rating: Number(row.avg ?? 0), count: Number(row.cnt ?? 0) };
    }
    return out;
  } catch (error) {
    console.error("[reviews] aggregates failed", error);
    return {};
  }
}

export async function fetchMyReviews(clientId: string): Promise<CarReview[]> {
  if (!hasDatabase()) return [];
  const rows = await query<ReviewRow>(
    `${SELECT} where r.client_id = $1 order by r.created_at desc`,
    [clientId],
  );
  return rows.map(map);
}

export async function fetchAllReviews(): Promise<CarReview[]> {
  if (!hasDatabase()) return [];
  const rows = await query<ReviewRow>(`${SELECT} order by r.created_at desc limit 300`);
  return rows.map(map);
}

export type SubmitReviewResult =
  | { ok: true; review: CarReview }
  | { ok: false; reason: "not_found" | "not_completed" | "already_reviewed" };

/**
 * Отзыв можно оставить только по своей завершённой брони и только один раз.
 */
export async function insertReview(input: {
  bookingId: string;
  clientId: string;
  rating: number;
  text: string;
  serviceComment: string;
}): Promise<SubmitReviewResult> {
  if (!hasDatabase()) return { ok: false, reason: "not_found" };

  const booking = await query<{ car_id: string; status: string; returned_at: Date | null }>(
    `select car_id, status, returned_at from bookings
      where id::text = $1 and client_id = $2 limit 1`,
    [input.bookingId, input.clientId],
  );
  if (!booking.length) return { ok: false, reason: "not_found" };
  const row = booking[0];
  if (row.status !== "completed" && !row.returned_at) {
    return { ok: false, reason: "not_completed" };
  }

  const existing = await query<{ id: string }>(
    `select id from car_reviews where booking_id = $1 limit 1`,
    [input.bookingId],
  );
  if (existing.length) return { ok: false, reason: "already_reviewed" };

  const inserted = await query<{ id: string }>(
    `insert into car_reviews (booking_id, car_id, client_id, rating, text, service_comment)
     values ($1, $2, $3, $4, $5, $6) returning id`,
    [
      input.bookingId,
      row.car_id,
      input.clientId,
      input.rating,
      input.text,
      input.serviceComment,
    ],
  );

  const created = await query<ReviewRow>(`${SELECT} where r.id = $1`, [inserted[0].id]);
  return created.length
    ? { ok: true, review: map(created[0]) }
    : { ok: false, reason: "not_found" };
}

export async function setReviewHidden(id: string, hidden: boolean): Promise<boolean> {
  if (!hasDatabase()) return false;
  const rows = await query<{ id: string }>(
    `update car_reviews set hidden = $2 where id::text = $1 returning id`,
    [id, hidden],
  );
  return rows.length > 0;
}
