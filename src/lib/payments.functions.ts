import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  bookingId: z.string().min(1).max(80),
  amount: z.number().int().min(1).max(5_000_000),
  description: z.string().max(200).optional(),
  customerEmail: z.string().max(160).optional(),
  customerPhone: z.string().max(40).optional(),
  itemName: z.string().max(160).optional(),
});

export const startPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { createYookassaPayment } = await import("@/lib/yookassa.server");
    const { insertPayment, savePaymentCustomer } = await import("@/lib/paymentsRepo.server");
    const { randomUUID } = await import("node:crypto");

    const origin = process.env["SITE_ORIGIN"] ?? "https://nsk-rent.ru";
    const result = await createYookassaPayment({
      bookingId: data.bookingId,
      amount: data.amount,
      description: data.description ?? `Аренда автомобиля, бронь ${data.bookingId}`,
      itemName: data.itemName ?? data.description ?? "Аренда автомобиля",
      returnUrl: `${origin}/invoice/${data.bookingId}`,
      idempotenceKey: randomUUID(),
      customer: { email: data.customerEmail ?? null, phone: data.customerPhone ?? null },
    });

    if (!result.ok) return result;

    const paymentId = await insertPayment({
      bookingId: data.bookingId,
      amount: data.amount,
      provider: result.mode === "live" ? "yookassa" : "stub",
      providerId: result.paymentId,
      status: result.mode === "live" ? "pending" : "succeeded",
    });

    if (paymentId) {
      await savePaymentCustomer(paymentId, {
        email: data.customerEmail ?? null,
        phone: data.customerPhone ?? null,
        receiptRegistered: result.receipt,
      });
    }

    // В демо-режиме платёж подтверждается сразу, как после webhook ЮKassa.
    if (result.mode === "stub") {
      const { updateBookingStatusInDb } = await import("@/lib/bookingsRepo.server");
      await updateBookingStatusInDb(data.bookingId, "active");
    }

    return result;
  });

const bookingIdSchema = z.object({ bookingId: z.string().min(1).max(80) });

export const getBookingPayment = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => bookingIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { fetchLatestPaymentByBooking } = await import("@/lib/paymentsRepo.server");
    return fetchLatestPaymentByBooking(data.bookingId);
  });

/** Сверка статуса напрямую в ЮKassa — на случай, если webhook не дошёл. */
export const syncBookingPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { fetchLatestPaymentByBooking, updatePaymentStatusById } = await import(
      "@/lib/paymentsRepo.server"
    );
    const payment = await fetchLatestPaymentByBooking(data.bookingId);
    if (!payment?.providerId) return { ok: false as const, reason: "no_payment" as const };

    const { fetchYookassaPayment } = await import("@/lib/yookassa.server");
    const remote = await fetchYookassaPayment(payment.providerId);
    if (!remote) return { ok: false as const, reason: "unavailable" as const };

    if (remote.status !== payment.status) {
      await updatePaymentStatusById(payment.id, remote.status);
      const { updateBookingStatusInDb } = await import("@/lib/bookingsRepo.server");
      if (remote.status === "succeeded") await updateBookingStatusInDb(data.bookingId, "active");
      if (remote.status === "canceled") await updateBookingStatusInDb(data.bookingId, "cancelled");
    }
    return { ok: true as const, status: remote.status, amount: remote.amount };
  });

const refundSchema = z.object({
  paymentId: z.string().min(1).max(40),
  amount: z.number().int().min(1).max(5_000_000).optional(),
  reason: z.string().max(200).optional(),
});

/** Возврат средств из админки. */
export const refundPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => refundSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();

    const { fetchPaymentById, markPaymentRefunded, logPaymentEvent } = await import(
      "@/lib/paymentsRepo.server"
    );
    const payment = await fetchPaymentById(data.paymentId);
    if (!payment) return { ok: false as const, error: "Платёж не найден" };
    if (!payment.providerId) return { ok: false as const, error: "У платежа нет идентификатора провайдера" };

    const available = Math.max(0, payment.amount - payment.refundedAmount);
    const amount = Math.min(data.amount ?? available, available);
    if (amount <= 0) return { ok: false as const, error: "Сумма уже возвращена полностью" };

    const { refundYookassaPayment } = await import("@/lib/yookassa.server");
    const { randomUUID } = await import("node:crypto");
    const result = await refundYookassaPayment({
      providerId: payment.providerId,
      amount,
      idempotenceKey: randomUUID(),
      description: data.reason ?? "Возврат по аренде",
    });
    if (!result.ok) return result;

    await markPaymentRefunded(payment.id, amount);
    await logPaymentEvent({
      providerId: payment.providerId,
      bookingId: payment.bookingId,
      event: "refund.succeeded",
      status: "succeeded",
      amount,
      raw: { refundId: result.refundId, mode: result.mode, initiator: "admin" },
    });

    if (payment.bookingId) {
      const { updateBookingStatusInDb } = await import("@/lib/bookingsRepo.server");
      await updateBookingStatusInDb(payment.bookingId, "cancelled");
    }

    return { ok: true as const, refundId: result.refundId, amount, mode: result.mode };
  });

/** Журнал уведомлений платёжного провайдера — для админки. */
export const getPaymentEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/adminGuard.server");
  await requireAdmin();
  const { fetchPaymentEvents } = await import("@/lib/paymentsRepo.server");
  return fetchPaymentEvents();
});
