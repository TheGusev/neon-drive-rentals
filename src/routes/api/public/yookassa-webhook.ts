import { createFileRoute } from "@tanstack/react-router";

type Notification = {
  type?: string;
  event?: string;
  object?: {
    id?: string;
    status?: string;
    paid?: boolean;
    amount?: { value?: string };
    payment_id?: string;
    metadata?: { bookingId?: string };
  };
};

/** Разрешённые адреса уведомлений ЮKassa. */
const ALLOWED_PREFIXES = ["185.71.76.", "185.71.77.", "77.75.153.", "77.75.156.", "77.75.154.", "77.75.155."];

function allowedIp(request: Request): boolean {
  if (process.env["YOOKASSA_SKIP_IP_CHECK"] === "1") return true;
  const raw = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "";
  const ip = raw.split(",")[0]?.trim() ?? "";
  if (!ip) return false;
  if (ip === "77.75.156.11" || ip === "77.75.156.35") return true;
  return ALLOWED_PREFIXES.some((prefix) => ip.startsWith(prefix));
}

export const Route = createFileRoute("/api/public/yookassa-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!allowedIp(request)) return new Response("Forbidden", { status: 403 });

        let payload: Notification;
        try {
          payload = (await request.json()) as Notification;
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const event = payload.event ?? payload.type ?? "unknown";
        const isRefund = event.startsWith("refund.");
        // Для возврата привязка идёт к исходному платежу.
        const providerId = isRefund ? payload.object?.payment_id : payload.object?.id;
        const status = payload.object?.status;
        if (!providerId || !status) return new Response("Bad request", { status: 400 });

        const amount = Number(payload.object?.amount?.value ?? 0) || null;
        const {
          updatePaymentByProviderId,
          logPaymentEvent,
          fetchLatestPaymentByBooking,
          markPaymentRefunded,
          fetchPaymentById,
        } = await import("@/lib/paymentsRepo.server");

        const fresh = await logPaymentEvent({
          providerId,
          bookingId: payload.object?.metadata?.bookingId ?? null,
          event,
          status,
          amount,
          raw: payload,
        });
        // Повторное уведомление — подтверждаем приём и ничего не меняем.
        if (!fresh) return new Response("ok");

        if (isRefund) {
          const updated = await updatePaymentByProviderId(providerId, "refunded");
          const bookingId = updated?.bookingId ?? payload.object?.metadata?.bookingId ?? null;
          if (bookingId) {
            const payment = await fetchLatestPaymentByBooking(bookingId);
            if (payment && amount) await markPaymentRefunded(payment.id, amount);
            const { updateBookingStatusInDb } = await import("@/lib/bookingsRepo.server");
            await updateBookingStatusInDb(bookingId, "cancelled");
          }
          return new Response("ok");
        }

        const updated = await updatePaymentByProviderId(providerId, status);
        const bookingId = updated?.bookingId ?? payload.object?.metadata?.bookingId ?? null;

        if (bookingId) {
          const { updateBookingStatusInDb } = await import("@/lib/bookingsRepo.server");
          if (status === "succeeded") {
            // Сверяем сумму уведомления с суммой сохранённого платежа.
            const payment = await fetchLatestPaymentByBooking(bookingId);
            const stored = payment ? await fetchPaymentById(payment.id) : null;
            const expected = stored?.amount ?? payment?.amount ?? 0;
            if (amount && expected && Math.abs(amount - expected) > 1) {
              console.error("[yookassa] amount mismatch", { providerId, amount, expected });
              return new Response("ok");
            }
            await updateBookingStatusInDb(bookingId, "active");
          }
          if (status === "canceled") await updateBookingStatusInDb(bookingId, "cancelled");
        }

        return new Response("ok");
      },
    },
  },
});
