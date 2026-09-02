import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Booking, BookingStatus } from "@/types/domain";

const createBookingSchema = z.object({
  carId: z.string().min(1).max(200),
  clientPhone: z.string().min(5).max(40),
  clientName: z.string().max(120).optional(),
  clientEmail: z.string().max(160).optional(),
  startDate: z.string().min(4).max(40),
  endDate: z.string().min(4).max(40),
  totalPrice: z.number().int().nonnegative().max(10_000_000),
  signed: z.boolean().optional(),
});

const statusSchema = z.object({
  id: z.string().min(1).max(100),
  status: z.enum(["paid", "pending", "active", "completed", "cancelled"]),
});

/** Availability-safe list (no client ids, no amounts). Used by public pages. */
export const getPublicBookings = createServerFn({ method: "GET" }).handler(async (): Promise<Booking[]> => {
  const { fetchPublicBookings } = await import("@/lib/bookingsRepo.server");
  return fetchPublicBookings();
});

export const getBookings = createServerFn({ method: "GET" }).handler(async (): Promise<Booking[]> => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { fetchBookings } = await import("@/lib/bookingsRepo.server");
  return fetchBookings();
});

export const getBookingsByPhone = createServerFn({ method: "GET" })
  .inputValidator((data: { phone: string }) => ({ phone: String(data?.phone ?? "").slice(0, 40) }))
  .handler(async ({ data }): Promise<Booking[]> => {
    const { fetchBookingsByPhone } = await import("@/lib/bookingsRepo.server");
    return fetchBookingsByPhone(data.phone);
  });

export const getBookingById = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => ({ id: String(data?.id ?? "").slice(0, 100) }))
  .handler(async ({ data }): Promise<Booking | null> => {
    const { fetchBookingById } = await import("@/lib/bookingsRepo.server");
    return fetchBookingById(data.id);
  });

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createBookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { resolveCarDbId } = await import("@/lib/carsRepo.server");
    const { insertBooking } = await import("@/lib/bookingsRepo.server");
    const { getRequestIP } = await import("@tanstack/react-start/server");

    const carDbId = await resolveCarDbId(data.carId);
    if (!carDbId) return { ok: false as const, reason: "car_not_found" as const };

    // Код из SMS подтверждает договор — фиксируем подпись сразу при создании брони.
    return insertBooking({
      ...data,
      carDbId,
      signatureIp: data.signed ? (getRequestIP({ xForwardedFor: true }) ?? "") : undefined,
    });
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => statusSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean; booking: Booking | null }> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { updateBookingStatusInDb } = await import("@/lib/bookingsRepo.server");
    const booking = await updateBookingStatusInDb(data.id, data.status as BookingStatus);
    return { ok: Boolean(booking), booking };
  });
