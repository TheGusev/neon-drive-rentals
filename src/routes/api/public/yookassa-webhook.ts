import { createFileRoute } from "@tanstack/react-router";

type Notification = {
  event?: string;
  object?: { id?: string; status?: string; metadata?: { bookingId?: string } };
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

        const providerId = payload.object?.id;
        const status = payload.object?.status;
        if (!providerId || !status) return new Response("Bad request", { status: 400 });

        const { updatePaymentByProviderId } = await import("@/lib/paymentsRepo.server");
        const updated = await updatePaymentByProviderId(providerId, status);
        const bookingId = updated?.bookingId ?? payload.object?.metadata?.bookingId ?? null;

        if (bookingId) {
          const { updateBookingStatusInDb } = await import("@/lib/bookingsRepo.server");
          if (status === "succeeded") await updateBookingStatusInDb(bookingId, "paid");
          if (status === "canceled") await updateBookingStatusInDb(bookingId, "cancelled");
        }

        return new Response("ok");
      },
    },
  },
});
