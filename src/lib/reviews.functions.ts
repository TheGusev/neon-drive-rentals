import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CarReview } from "@/types/domain";

const submitSchema = z.object({
  bookingId: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(2000).optional(),
  serviceComment: z.string().max(2000).optional(),
});

/** Публичные отзывы по автомобилю — используются на карточке /cars/:slug. */
export const getCarReviews = createServerFn({ method: "GET" })
  .inputValidator((data: { carId: string }) => ({ carId: String(data?.carId ?? "").slice(0, 200) }))
  .handler(async ({ data }): Promise<CarReview[]> => {
    const { fetchCarReviews } = await import("@/lib/reviewsRepo.server");
    return fetchCarReviews(data.carId);
  });

/** Отзывы текущего клиента (по каким броням отзыв уже оставлен). */
export const getMyReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<CarReview[]> => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const { clientId } = await getClientSession();
    if (!clientId) return [];
    const { fetchMyReviews } = await import("@/lib/reviewsRepo.server");
    return fetchMyReviews(clientId);
  },
);

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const { clientId } = await getClientSession();
    if (!clientId) return { ok: false as const, reason: "unauthorized" as const };

    const { insertReview } = await import("@/lib/reviewsRepo.server");
    return insertReview({
      bookingId: data.bookingId,
      clientId,
      rating: data.rating,
      text: (data.text ?? "").trim(),
      serviceComment: (data.serviceComment ?? "").trim(),
    });
  });

/* ---------------------------- админ-модерация ---------------------------- */

export const getReviewsAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<CarReview[]> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { fetchAllReviews } = await import("@/lib/reviewsRepo.server");
    return fetchAllReviews();
  },
);

export const setReviewVisibility = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().min(1).max(100), hidden: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { setReviewHidden } = await import("@/lib/reviewsRepo.server");
    return { ok: await setReviewHidden(data.id, data.hidden) };
  });
