import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const phoneSchema = z.object({ phone: z.string().min(5).max(40) });
const verifySchema = z.object({ phone: z.string().min(5).max(40), code: z.string().min(4).max(8) });

export const requestOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => phoneSchema.parse(data))
  .handler(async ({ data }) => {
    const { sendOtp } = await import("@/lib/otp.server");
    return sendOtp(data.phone);
  });

/** Проверка кода без входа — используется при подписании договора. */
export const confirmOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const { verifyOtp } = await import("@/lib/otp.server");
    return verifyOtp(data.phone, data.code);
  });

/** Проверка кода + создание клиентской сессии для личного кабинета. */
export const loginWithOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const { verifyOtp } = await import("@/lib/otp.server");
    const result = await verifyOtp(data.phone, data.code);
    if (!result.ok) return result;

    const { findOrCreateClientByPhone } = await import("@/lib/clientsRepo.server");
    const { setClientSession } = await import("@/lib/clientSession.server");
    const clientId = (await findOrCreateClientByPhone(data.phone)) ?? "local";
    await setClientSession(clientId, data.phone);
    return { ok: true as const };
  });

export const getClientSessionStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { getClientSession } = await import("@/lib/clientSession.server");
  const session = await getClientSession();
  return { authenticated: Boolean(session.clientId), phone: session.phone ?? null };
});

export const clientLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { clearClientSession } = await import("@/lib/clientSession.server");
  await clearClientSession();
  return { ok: true as const };
});

/** Брони текущего залогиненного клиента. */
export const getMyBookings = createServerFn({ method: "GET" }).handler(async () => {
  const { getClientSession } = await import("@/lib/clientSession.server");
  const session = await getClientSession();
  if (!session.phone) return { authenticated: false as const, bookings: [] };

  const { fetchBookingsByPhone } = await import("@/lib/bookingsRepo.server");
  return { authenticated: true as const, bookings: await fetchBookingsByPhone(session.phone) };
});

export const yandexEnabled = createServerFn({ method: "GET" }).handler(async () => ({
  enabled: Boolean(process.env["YANDEX_CLIENT_ID"]),
}));
