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
  if (!session.phone) return { authenticated: false, phone: null, name: null, email: null };
  const { fetchClientByPhone } = await import("@/lib/clientsRepo.server");
  const client = await fetchClientByPhone(session.phone);
  return {
    authenticated: Boolean(session.clientId),
    phone: session.phone,
    name: client?.name ?? null,
    email: client?.email ?? null,
  };
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

const emailField = z.string().trim().email().max(160);
const passwordField = z.string().min(8).max(200);

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailField,
  phone: z.string().trim().min(5).max(40),
  password: passwordField,
});

const loginSchema = z.object({ email: emailField, password: z.string().min(1).max(200) });

/** Регистрация клиента по e-mail и паролю. */
export const registerWithPassword = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registerSchema.parse(data))
  .handler(async ({ data }) => {
    const { hashPassword } = await import("@/lib/password.server");
    const { registerClientAccount } = await import("@/lib/clientsRepo.server");
    const { setClientSession } = await import("@/lib/clientSession.server");

    const passwordHash = await hashPassword(data.password);
    const result = await registerClientAccount({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
    });

    if (!result.ok) return { ok: false as const, reason: result.reason };
    await setClientSession(result.client.id, result.client.phone || data.phone);
    return { ok: true as const };
  });

/** Вход по e-mail и паролю. */
export const loginWithPassword = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const { verifyPassword, tooManyAttempts, resetAttempts } = await import("@/lib/password.server");
    const key = data.email.toLowerCase();
    if (tooManyAttempts(key)) return { ok: false as const, reason: "rate_limited" as const };

    const { findAccountByEmail, markLogin } = await import("@/lib/clientsRepo.server");
    const account = await findAccountByEmail(data.email);
    if (!account || !(await verifyPassword(data.password, account.passwordHash))) {
      return { ok: false as const, reason: "invalid" as const };
    }

    resetAttempts(key);
    const { setClientSession } = await import("@/lib/clientSession.server");
    await setClientSession(account.id, account.phone);
    await markLogin(account.id);
    return { ok: true as const };
  });

/** Создание пароля для уже вошедшего клиента (после оплаты брони). */
export const createPasswordForSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ email: emailField, password: passwordField, name: z.string().trim().max(120).optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { getClientSession } = await import("@/lib/clientSession.server");
    const session = await getClientSession();
    if (!session.clientId) return { ok: false as const, reason: "unauthenticated" as const };

    const { hashPassword } = await import("@/lib/password.server");
    const { setClientPassword } = await import("@/lib/clientsRepo.server");
    const saved = await setClientPassword({
      clientId: session.clientId,
      passwordHash: await hashPassword(data.password),
      email: data.email,
      ...(data.name ? { name: data.name } : {}),
    });
    return saved ? { ok: true as const } : { ok: false as const, reason: "email_taken" as const };
  });

/** Сброс пароля по SMS-коду на телефон аккаунта. */
export const resetPasswordWithOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        phone: z.string().trim().min(5).max(40),
        code: z.string().min(4).max(8),
        password: passwordField,
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { verifyOtp } = await import("@/lib/otp.server");
    const check = await verifyOtp(data.phone, data.code);
    if (!check.ok) return { ok: false as const, reason: "invalid_code" as const };

    const { findAccountByPhone, setClientPassword } = await import("@/lib/clientsRepo.server");
    const account = await findAccountByPhone(data.phone);
    if (!account) return { ok: false as const, reason: "not_found" as const };

    const { hashPassword } = await import("@/lib/password.server");
    await setClientPassword({ clientId: account.id, passwordHash: await hashPassword(data.password) });

    const { setClientSession } = await import("@/lib/clientSession.server");
    await setClientSession(account.id, account.phone);
    return { ok: true as const };
  });
