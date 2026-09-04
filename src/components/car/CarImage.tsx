import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type CarImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  /** Подпись на заглушке, когда файл недоступен. */
  placeholderLabel?: string;
};

/**
 * Для статики парка (`/assets/cars/*.jpg|png`) рядом лежит WebP-версия —
 * она в 3-4 раза легче. Загруженные админом файлы конвертации не имеют.
 */
function webpVariant(src: string): string | null {
  if (!src.startsWith("/assets/cars/")) return null;
  if (src.includes("/uploads/")) return null;
  if (!/\.(jpe?g|png)$/i.test(src)) return null;
  return src.replace(/\.(jpe?g|png)$/i, ".webp");
}

function Placeholder({ className, label }: { className?: string; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-1 bg-muted text-muted-foreground",
        className,
      )}
    >
      <ImageOff className="h-5 w-5 opacity-70" />
      <span className="px-2 text-center text-[10px] leading-tight opacity-80">{label}</span>
    </span>
  );
}

/**
 * Изображение авто. Если файла нет — показываем нейтральную заглушку,
 * а не фото другого автомобиля.
 */
export function CarImage({
  src,
  placeholderLabel = "Фото недоступно",
  onError,
  onLoad,
  className,
  loading = "lazy",
  decoding = "async",
  ...props
}: CarImageProps) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
    setReady(false);
  }, [src]);

  // Cached images can finish before hydration, so `load` never fires here.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setReady(true);
  }, [src]);

  if (!src || failed) return <Placeholder className={className} label={placeholderLabel} />;

  const webp = webpVariant(src);

  const img = (
    <img
      {...props}
      ref={ref}
      src={src}
      loading={loading}
      decoding={decoding}
      className={cn(
        "transition-opacity duration-500 motion-reduce:transition-none",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={(event) => {
        onLoad?.(event);
        setReady(true);
      }}
      onError={(event) => {
        onError?.(event);
        setFailed(true);
      }}
    />
  );

  if (!webp) return img;

  return (
    <picture className="contents">
      <source srcSet={webp} type="image/webp" />
      {img}
    </picture>
  );
}
