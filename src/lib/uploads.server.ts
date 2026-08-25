import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const IMAGE_SIGNATURES: Array<{ ext: string[]; matches: (buffer: Buffer) => boolean }> = [
  { ext: [".jpg", ".jpeg"], matches: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: [".png"], matches: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  { ext: [".webp"], matches: (b) => b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
];

/** Каталог статики: в проде — рядом с .output/public, локально — public/. */
function publicDir(): string {
  const custom = process.env["PUBLIC_ASSETS_DIR"];
  if (custom) return custom;
  return path.join(process.cwd(), ".output", "public");
}

export function carUploadsDir(): string {
  const custom = process.env["CAR_UPLOADS_DIR"];
  return custom || path.join(publicDir(), "assets", "cars", "uploads");
}

export async function inspectUploadStorage(): Promise<{ writable: boolean; pathConfigured: boolean }> {
  const dir = carUploadsDir();
  try {
    await mkdir(dir, { recursive: true });
    await access(dir, constants.W_OK);
    return { writable: true, pathConfigured: Boolean(process.env["CAR_UPLOADS_DIR"] || process.env["PUBLIC_ASSETS_DIR"]) };
  } catch {
    return { writable: false, pathConfigured: Boolean(process.env["CAR_UPLOADS_DIR"] || process.env["PUBLIC_ASSETS_DIR"]) };
  }
}

export async function saveCarPhoto(
  fileName: string,
  contentBase64: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED.has(ext)) return { ok: false, error: "Разрешены только JPG, PNG и WEBP" };

  const comma = contentBase64.indexOf(",");
  const payload = comma >= 0 ? contentBase64.slice(comma + 1) : contentBase64;
  const buffer = Buffer.from(payload, "base64");
  if (buffer.length > 6 * 1024 * 1024) return { ok: false, error: "Файл больше 6 МБ" };
  if (buffer.length === 0) return { ok: false, error: "Файл пустой или повреждён" };
  const signature = IMAGE_SIGNATURES.find((item) => item.ext.includes(ext));
  if (!signature?.matches(buffer)) return { ok: false, error: "Содержимое файла не соответствует формату изображения" };

  const dir = carUploadsDir();
  const safeName = `${randomUUID()}${ext}`;
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), buffer);
  } catch (error) {
    console.error("[uploads] failed", error);
    return { ok: false, error: "Не удалось сохранить файл на сервере" };
  }

  return { ok: true, url: `/assets/cars/uploads/${safeName}` };
}
