import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/** Каталог статики: в проде — рядом с .output/public, локально — public/. */
function publicDir(): string {
  const custom = process.env["PUBLIC_ASSETS_DIR"];
  if (custom) return custom;
  return path.join(process.cwd(), ".output", "public");
}

export async function saveCarPhoto(
  fileName: string,
  contentBase64: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED.has(ext)) return { ok: false, error: "Разрешены только JPG, PNG и WEBP" };

  const payload = contentBase64.includes(",") ? contentBase64.split(",").pop()! : contentBase64;
  const buffer = Buffer.from(payload, "base64");
  if (buffer.length > 6 * 1024 * 1024) return { ok: false, error: "Файл больше 6 МБ" };

  const dir = path.join(publicDir(), "assets", "cars");
  const safeName = `${randomUUID()}${ext}`;
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), buffer);
  } catch (error) {
    console.error("[uploads] failed", error);
    return { ok: false, error: "Не удалось сохранить файл на сервере" };
  }

  return { ok: true, url: `/assets/cars/${safeName}` };
}
