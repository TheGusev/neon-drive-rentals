import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  bookingId: z.string().min(1).max(80),
  amount: z.number().int().min(1).max(5_000_000),
  description: z.string().max(200).optional(),
});

export const startPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { createYookassaPayment } = await import("@/lib/yookassa.server");
    const { insertPayment } = await import("@/lib/paymentsRepo.server");
    const { randomUUID } = await import("node:crypto");

    const origin = process.env["SITE_ORIGIN"] ?? "https://nsk-rent.ru";
    const result = await createYookassaPayment({
      bookingId: data.bookingId,
      amount: data.amount,
      description: data.description ?? `Аренда автомобиля, бронь ${data.bookingId}`,
      returnUrl: `${origin}/profile?payment=${data.bookingId}`,
      idempotenceKey: randomUUID(),
    });

    if (!result.ok) return result;

    await insertPayment({
      bookingId: data.bookingId,
      amount: data.amount,
      provider: result.mode === "live" ? "yookassa" : "stub",
      providerId: result.paymentId,
      status: result.mode === "live" ? "pending" : "succeeded",
    });

    if (result.mode === "stub") {
      const { updateBookingStatusInDb } = await import("@/lib/bookingsRepo.server");
      await updateBookingStatusInDb(data.bookingId, "paid");
    }

    return result;
  });
