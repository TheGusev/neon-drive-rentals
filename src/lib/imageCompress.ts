export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type PreparedImage = { fileName: string; contentBase64: string; previewUrl: string };

const MAX_SIDE = 1600;
const QUALITY = 0.82;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось открыть изображение"));
    img.src = src;
  });
}

/** Уменьшает большую сторону до 1600px и жмёт в JPEG. При сбое отдаёт исходник. */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`${file.name}: поддерживаются только JPG, PNG и WEBP`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name}: файл больше 5 МБ`);
  }

  const dataUrl = await readAsDataUrl(file);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-60) || "photo.jpg";

  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale >= 1 && file.size < 900_000) {
      return { fileName: safeName, contentBase64: dataUrl, previewUrl: dataUrl };
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no ctx");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = canvas.toDataURL("image/jpeg", QUALITY);
    const name = safeName.replace(/\.(png|webp|jpeg|jpg)$/i, "") + ".jpg";
    return { fileName: name, contentBase64: out, previewUrl: out };
  } catch {
    return { fileName: safeName, contentBase64: dataUrl, previewUrl: dataUrl };
  }
}
