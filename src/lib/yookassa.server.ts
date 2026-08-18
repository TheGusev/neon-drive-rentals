const API = "https://api.yookassa.ru/v3/payments";

export function yookassaConfigured(): boolean {
  return Boolean(process.env["YOOKASSA_SHOP_ID"] && process.env["YOOKASSA_SECRET_KEY"]);
}

function authHeader(): string {
  const shopId = process.env["YOOKASSA_SHOP_ID"]!;
  const secret = process.env["YOOKASSA_SECRET_KEY"]!;
  return `Basic ${Buffer.from(`${shopId}:${secret}`).toString("base64")}`;
}

export type CreatePaymentResult =
  | { ok: true; mode: "live"; paymentId: string; confirmationUrl: string }
  | { ok: true; mode: "stub"; paymentId: string; confirmationUrl: string }
  | { ok: false; error: string };

/** Создаёт платёж в ЮKassa. Без ключей возвращает заглушку для демо-режима. */
export async function createYookassaPayment(input: {
  bookingId: string;
  amount: number;
  description: string;
  returnUrl: string;
  idempotenceKey: string;
}): Promise<CreatePaymentResult> {
  if (!yookassaConfigured()) {
    return {
      ok: true,
      mode: "stub",
      paymentId: `stub-${input.idempotenceKey}`,
      confirmationUrl: input.returnUrl,
    };
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Idempotence-Key": input.idempotenceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { value: input.amount.toFixed(2), currency: "RUB" },
        capture: true,
        confirmation: { type: "redirect", return_url: input.returnUrl },
        description: input.description.slice(0, 128),
        metadata: { bookingId: input.bookingId },
      }),
    });

    const body = (await res.json()) as {
      id?: string;
      confirmation?: { confirmation_url?: string };
      description?: string;
    };
    if (!res.ok || !body.id || !body.confirmation?.confirmation_url) {
      console.error("[yookassa] create failed", res.status, body);
      return { ok: false, error: "Не удалось создать платёж" };
    }
    return { ok: true, mode: "live", paymentId: body.id, confirmationUrl: body.confirmation.confirmation_url };
  } catch (error) {
    console.error("[yookassa] network error", error);
    return { ok: false, error: "Платёжный сервис недоступен" };
  }
}
