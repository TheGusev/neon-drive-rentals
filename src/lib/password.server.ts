import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LEN, (err, key) => {
      if (err) reject(err);
      else resolve(key as Buffer);
    });
  });
}

/** Формат хеша: scrypt$<salt-hex>$<key-hex> */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  try {
    const expected = Buffer.from(keyHex, "hex");
    const actual = await derive(password, Buffer.from(saltHex, "hex"));
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

type Bucket = { count: number; resetAt: number };
type Holder = { __nskLoginThrottle?: Map<string, Bucket> };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function buckets(): Map<string, Bucket> {
  const holder = globalThis as unknown as Holder;
  if (!holder.__nskLoginThrottle) holder.__nskLoginThrottle = new Map();
  return holder.__nskLoginThrottle;
}

/** Простое ограничение попыток входа по ключу (e-mail/ip). */
export function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const map = buckets();
  const bucket = map.get(key);
  if (!bucket || bucket.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_ATTEMPTS;
}

export function resetAttempts(key: string): void {
  buckets().delete(key);
}
