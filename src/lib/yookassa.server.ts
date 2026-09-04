const API = "https://api.yookassa.ru/v3";

export function yookassaConfigured(): boolean {
  return Boolean(process.env["YOOKASSA_SHOP_ID"] && process.env["YOOKASSA_SECRET_KEY"]);
}

function authHeader(): string {
  const shopId = process.env["YOOKASSA_SHOP_ID"]!;
  const secret = process.env["YOOKASSA_SECRET_KEY"]!;
  return `Basic ${Buffer.from(`${shopId}:${secret}`).toString("base64")}`;
}

/** Система налогообложения продавца (54-ФЗ). По умолчанию — УСН «доходы». */
function taxSystemCode(): number {
  const value = Number(process.env["YOOKASSA_TAX_SYSTEM_CODE"] ?? 2);
  return Number.isFinite(value) && value >= 1 && value <= 6 ? value : 2;
}

/** Ставка НДС. По умолчанию 1 — «без НДС». */
function vatCode(): number {
  const value = Number(process.env["YOOKASSA_VAT_CODE"] ?? 1);
  return Number.isFinite(value) && value >= 1 && value <= 6 ? value : 1;
}

function normalizePhone(phone?: string | null): string | undefined {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  const tail = digits.slice(-10);
  return `+7${tail}`;
}

function normalizeEmail(email?: string | null): string | undefined {
  const value = String(email ?? "").trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? value : undefined;
}

export type ReceiptCustomer = { email?: string | null; phone?: string | null };

/** Чек по 54-ФЗ: одна позиция — услуга аренды. */
export function buildReceipt(input: {
  amount: number;
  itemName: string;
  customer: ReceiptCustomer;
}): Record<string, unknown> | null {
  const email = normalizeEmail(input.customer.email);
  const phone = normalizePhone(input.customer.phone);
  if (!email && !phone) return null; // ЮKassa требует контакт покупателя

  return {
    customer: { ...(email ? { email } : {}), ...(phone ? { phone } : {}) },
    tax_system_code: taxSystemCode(),
    items: [
      {
        description: input.itemName.slice(0, 128),
        quantity: "1.00",
        amount: { value: input.amount.toFixed(2), currency: "RUB" },
        vat_code: vatCode(),
        payment_mode: "full_payment",
        payment_subject: "service",
      },
    ],
  };
}

export type CreatePaymentResult =
  | { ok: true; mode: "live"; paymentId: string; confirmationUrl: string; receipt: boolean }
  | { ok: true; mode: "stub"; paymentId: string; confirmationUrl: string; receipt: boolean }
  | { ok: false; error: string };

/** Создаёт платёж в ЮKassa. Без ключей возвращает заглушку для демо-режима. */
export async function createYookassaPayment(input: {
  bookingId: string;
  amount: number;
  description: string;
  returnUrl: string;
  idempotenceKey: string;
  customer?: ReceiptCustomer;
  itemName?: string;
}): Promise<CreatePaymentResult> {
  const receipt = buildReceipt({
    amount: input.amount,
    itemName: input.itemName ?? input.description,
    customer: input.customer ?? {},
  });

  const payload = {
    amount: { value: input.amount.toFixed(2), currency: "RUB" },
    capture: true,
    confirmation: { type: "redirect", return_url: input.returnUrl },
    description: input.description.slice(0, 128),
    metadata: { bookingId: input.bookingId },
    ...(receipt ? { receipt } : {}),
  };

  if (!yookassaConfigured()) {
    // Демо-режим: ключи ещё не выданы. Логируем ровно тот payload, который уйдёт в бой.
    console.info("[yookassa][stub] payment payload", JSON.stringify(payload));
    return {
      ok: true,
      mode: "stub",
      paymentId: `stub-${input.idempotenceKey}`,
      confirmationUrl: input.returnUrl,
      receipt: Boolean(receipt),
    };
  }

  try {
    const res = await fetch(`${API}/payments`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Idempotence-Key": input.idempotenceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = (await res.json()) as {
      id?: string;
      confirmation?: { confirmation_url?: string };
    };
    if (!res.ok || !body.id || !body.confirmation?.confirmation_url) {
      console.error("[yookassa] create failed", res.status, body);
      return { ok: false, error: "Не удалось создать платёж" };
    }
    return {
      ok: true,
      mode: "live",
      paymentId: body.id,
      confirmationUrl: body.confirmation.confirmation_url,
      receipt: Boolean(receipt),
    };
  } catch (error) {
    console.error("[yookassa] network error", error);
    return { ok: false, error: "Платёжный сервис недоступен" };
  }
}

export type ProviderPayment = { status: string; amount: number; paid: boolean; refundable?: boolean };

/** Сверка статуса платежа напрямую в ЮKassa (если webhook не дошёл). */
export async function fetchYookassaPayment(providerId: string): Promise<ProviderPayment | null> {
  if (!yookassaConfigured()) return null;
  try {
    const res = await fetch(`${API}/payments/${encodeURIComponent(providerId)}`, {
      headers: { Authorization: authHeader() },
    });
    if (!res.ok) {
      console.error("[yookassa] status failed", res.status);
      return null;
    }
    const body = (await res.json()) as {
      status?: string;
      paid?: boolean;
      refundable?: boolean;
      amount?: { value?: string };
    };
    return {
      status: String(body.status ?? "pending"),
      amount: Number(body.amount?.value ?? 0),
      paid: Boolean(body.paid),
      refundable: Boolean(body.refundable),
    };
  } catch (error) {
    console.error("[yookassa] status network error", error);
    return null;
  }
}

export type RefundResult = { ok: true; refundId: string; mode: "live" | "stub" } | { ok: false; error: string };

/** Возврат платежа. Без боевых ключей — демо-режим. */
export async function refundYookassaPayment(input: {
  providerId: string;
  amount: number;
  idempotenceKey: string;
  description?: string;
}): Promise<RefundResult> {
  if (!yookassaConfigured()) {
    console.info("[yookassa][stub] refund", input.providerId, input.amount);
    return { ok: true, refundId: `stub-refund-${input.idempotenceKey}`, mode: "stub" };
  }
  try {
    const res = await fetch(`${API}/refunds`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Idempotence-Key": input.idempotenceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_id: input.providerId,
        amount: { value: input.amount.toFixed(2), currency: "RUB" },
        ...(input.description ? { description: input.description.slice(0, 250) } : {}),
      }),
    });
    const body = (await res.json()) as { id?: string; description?: string };
    if (!res.ok || !body.id) {
      console.error("[yookassa] refund failed", res.status, body);
      return { ok: false, error: "Не удалось оформить возврат" };
    }
    return { ok: true, refundId: body.id, mode: "live" };
  } catch (error) {
    console.error("[yookassa] refund network error", error);
    return { ok: false, error: "Платёжный сервис недоступен" };
  }
}
