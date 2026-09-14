import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const extensionSchema = z.object({ bookingId: z.string().uuid(), newEndDate: z.string().datetime() });

export const quoteExtension = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => extensionSchema.parse(data))
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const session = await getClientSession();
    if (!session.phone) return { ok: false as const, reason: "unauthorized" as const };
    const { createPendingExtension } = await import("@/lib/bookingsRepo.server");
    return createPendingExtension(data.bookingId, session.phone, data.newEndDate);
  });

export const startExtensionPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => extensionSchema.parse(data))
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const session = await getClientSession();
    if (!session.phone) return { ok: false as const, error: "Требуется вход" };
    const { createPendingExtension, linkExtensionPayment, applyBookingExtension } = await import("@/lib/bookingsRepo.server");
    const prepared = await createPendingExtension(data.bookingId, session.phone, data.newEndDate);
    if (!prepared.ok) return { ok: false as const, reason: prepared.reason, error: prepared.reason === "conflict" ? "Выбранные даты уже заняты" : "Не удалось подготовить продление" };
    const { createYookassaPayment } = await import("@/lib/yookassa.server");
    const { randomUUID } = await import("node:crypto");
    const origin = process.env["SITE_ORIGIN"] ?? "https://nsk-rent.ru";
    const result = await createYookassaPayment({ bookingId: data.bookingId, extensionId: prepared.extension.id, amount: prepared.extension.amount, description: `Продление аренды, бронь ${data.bookingId}`, itemName: "Продление аренды автомобиля", returnUrl: `${origin}/profile/rentals`, idempotenceKey: randomUUID(), customer: { phone: session.phone } });
    if (!result.ok) return result;
    const { insertPayment } = await import("@/lib/paymentsRepo.server");
    const paymentId = await insertPayment({ bookingId: data.bookingId, amount: prepared.extension.amount, provider: result.mode === "live" ? "yookassa" : "stub", providerId: result.paymentId, status: result.mode === "live" ? "pending" : "succeeded", purpose: "extension", extensionId: prepared.extension.id });
    if (!paymentId) return { ok: false as const, error: "Не удалось сохранить платёж" };
    await linkExtensionPayment(prepared.extension.id, paymentId);
    if (result.mode === "stub") await applyBookingExtension(prepared.extension.id);
    return { ...result, amount: prepared.extension.amount, extensionId: prepared.extension.id };
  });