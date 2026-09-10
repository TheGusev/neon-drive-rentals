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
    const result = await insertBooking({
      ...data,
      carDbId,
      signatureIp: data.signed ? (getRequestIP({ xForwardedFor: true }) ?? "") : undefined,
    });

    if (result.ok) {
      const { notifyAdmins } = await import("@/lib/notificationsRepo.server");
      const period = `${new Date(data.startDate).toLocaleDateString("ru-RU")} — ${new Date(data.endDate).toLocaleDateString("ru-RU")}`;
      await notifyAdmins({
        kind: "booking_created",
        title: "Новая бронь",
        body: `${data.clientName?.trim() || data.clientPhone} · ${data.carId} · ${period} · ${data.totalPrice.toLocaleString("ru-RU")} ₽`,
        link: "/admin/bookings",
        entityId: result.booking.id,
      });
    }

    return result;
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => statusSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean; booking: Booking | null }> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { updateBookingStatusInDb } = await import("@/lib/bookingsRepo.server");
    const booking = await updateBookingStatusInDb(data.id, data.status as BookingStatus);
    if (booking && data.status === "cancelled") {
      const { notifyAdmins } = await import("@/lib/notificationsRepo.server");
      await notifyAdmins({
        kind: "booking_cancelled",
        title: "Бронь отменена",
        body: `Бронь ${booking.id} · ${booking.carId}`,
        link: "/admin/bookings",
        entityId: booking.id,
      });
    }
    return { ok: Boolean(booking), booking };
  });

const journeySchema = z.object({ id: z.string().min(1).max(100), manager: z.string().max(80).optional() });

/** Админ подтверждает выдачу ключей — маршрут аренды в кабинете двигается сам. */
export const issueKeys = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => journeySchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean; booking: Booking | null }> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { markKeysIssued } = await import("@/lib/bookingsRepo.server");
    const booking = await markKeysIssued(data.id, data.manager?.trim() || "Менеджер NSK-RENT");
    return { ok: Boolean(booking), booking };
  });

const returnSchema = journeySchema.extend({
  mileage: z.number().int().min(0).max(3_000_000).optional(),
});

/** Админ принимает возврат авто — аренда завершается, пробег фиксируется. */
export const acceptReturn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => returnSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean; booking: Booking | null }> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { markReturned } = await import("@/lib/bookingsRepo.server");
    const booking = await markReturned(
      data.id,
      data.manager?.trim() || "Менеджер NSK-RENT",
      data.mileage,
    );
    return { ok: Boolean(booking), booking };
  });

const mileageSchema = z.object({
  id: z.string().min(1).max(100),
  mileage: z.number().int().min(0).max(3_000_000),
});

/** Клиент вносит показания одометра при завершении аренды (один раз). */
export const submitReturnMileage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => mileageSchema.parse(data))
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const session = await getClientSession();
    if (!session.phone) return { ok: false as const, reason: "unauthorized" as const };
    const { submitClientMileage } = await import("@/lib/bookingsRepo.server");
    const result = await submitClientMileage(data.id, session.phone, data.mileage);
    return result.ok
      ? { ok: true as const }
      : { ok: false as const, reason: result.reason ?? ("not_found" as const) };
  });

/** Админ вносит или исправляет пробег по брони. */
export const setBookingMileage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => mileageSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean; booking: Booking | null }> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { setAdminMileage } = await import("@/lib/bookingsRepo.server");
    const booking = await setAdminMileage(data.id, data.mileage);
    return { ok: Boolean(booking), booking };
  });

/** Полное удаление брони администратором. */
export const deleteBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1).max(100) }).parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();
    const { deleteBookingInDb } = await import("@/lib/bookingsRepo.server");
    return { ok: await deleteBookingInDb(data.id) };
  });
