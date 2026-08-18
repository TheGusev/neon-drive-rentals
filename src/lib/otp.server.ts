import { createHash, randomInt } from "node:crypto";
import { hasDatabase, query } from "@/lib/db.server";

const MAX_ATTEMPTS = 5;
const TTL_MINUTES = 5;

const digits = (value: string) => value.replace(/\D/g, "");
const hash = (code: string, phone: string) =>
  createHash("sha256").update(`${digits(phone)}:${code}`, "utf8").digest("hex");

type MemoryEntry = { hash: string; expires: number; attempts: number };
type Holder = { __nskOtp?: Map<string, MemoryEntry> };

function memory(): Map<string, MemoryEntry> {
  const holder = globalThis as unknown as Holder;
  if (!holder.__nskOtp) holder.__nskOtp = new Map();
  return holder.__nskOtp;
}

async function ready(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const { ensureMigrations } = await import("@/lib/migrations.server");
  await ensureMigrations();
  return true;
}

/** Отправка SMS через SMSC.ru. Без ключа работает как заглушка. */
async function sendSms(phone: string, text: string): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env["SMS_API_KEY"];
  const login = process.env["SMS_LOGIN"];
  const sender = process.env["SMS_SENDER"];
  if (!apiKey && !login) return { sent: false, error: "SMS_API_KEY не настроен" };

  const params = new URLSearchParams({
    phones: digits(phone),
    mes: text,
    fmt: "3",
    charset: "utf-8",
    ...(sender ? { sender } : {}),
    ...(apiKey ? { apikey: apiKey } : { login: login!, psw: process.env["SMS_PASSWORD"] ?? "" }),
  });

  try {
    const res = await fetch(`https://smsc.ru/sys/send.php?${params.toString()}`);
    const body = (await res.json()) as { error?: string };
    if (body?.error) return { sent: false, error: body.error };
    return { sent: true };
  } catch (error) {
    console.error("[sms] send failed", error);
    return { sent: false, error: "Сервис SMS недоступен" };
  }
}

export type SendOtpResult = { ok: boolean; devCode?: string; error?: string };

export async function sendOtp(phone: string): Promise<SendOtpResult> {
  if (digits(phone).length < 10) return { ok: false, error: "Некорректный номер телефона" };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = hash(code, phone);
  const expires = Date.now() + TTL_MINUTES * 60_000;

  if (await ready()) {
    await query(
      `insert into otp_codes (phone, code_hash, expires_at) values ($1, $2, to_timestamp($3 / 1000.0))`,
      [digits(phone), codeHash, expires],
    );
  } else {
    memory().set(digits(phone), { hash: codeHash, expires, attempts: 0 });
  }

  const sms = await sendSms(phone, `NSK-RENT: код подтверждения ${code}`);
  // Пока SMS-провайдер не подключён, код возвращается в ответе (dev-режим).
  return sms.sent ? { ok: true } : { ok: true, devCode: code, error: sms.error };
}

export type VerifyOtpResult = { ok: boolean; error?: string };

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  const codeHash = hash(code.trim(), phone);

  if (!(await ready())) {
    const entry = memory().get(digits(phone));
    if (!entry) return { ok: false, error: "Код не запрашивался" };
    if (entry.expires < Date.now()) return { ok: false, error: "Срок действия кода истёк" };
    if (entry.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Слишком много попыток" };
    if (entry.hash !== codeHash) {
      entry.attempts += 1;
      return { ok: false, error: "Неверный код" };
    }
    memory().delete(digits(phone));
    return { ok: true };
  }

  const rows = await query<{ id: string; code_hash: string; attempts: number }>(
    `select id, code_hash, attempts from otp_codes
     where phone = $1 and consumed_at is null and expires_at > now()
     order by created_at desc limit 1`,
    [digits(phone)],
  );
  if (!rows.length) return { ok: false, error: "Код не найден или истёк" };

  const row = rows[0];
  if (Number(row.attempts) >= MAX_ATTEMPTS) return { ok: false, error: "Слишком много попыток, запросите новый код" };

  if (row.code_hash !== codeHash) {
    await query(`update otp_codes set attempts = attempts + 1 where id = $1`, [row.id]);
    return { ok: false, error: "Неверный код" };
  }

  await query(`update otp_codes set consumed_at = now() where id = $1`, [row.id]);
  return { ok: true };
}
