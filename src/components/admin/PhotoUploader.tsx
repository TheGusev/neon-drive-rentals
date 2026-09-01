import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Star, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadCarPhoto } from "@/lib/admin.functions";
import { prepareImage } from "@/lib/imageCompress";
import { CarImage } from "@/components/car/CarImage";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 12;

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export function PhotoUploader({ images, onChange }: Props) {
  const upload = useServerFn(uploadCarPhoto);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [url, setUrl] = useState("");

  const addUrls = (next: string[]) => {
    const merged = Array.from(new Set([...images, ...next])).slice(0, MAX_PHOTOS);
    onChange(merged);
  };

  /** Проверяем, что сохранённый файл реально отдаётся сервером. */
  const verify = (src: string) =>
    new Promise<boolean>((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(true);
      probe.onerror = () => resolve(false);
      probe.src = src;
    });


  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = MAX_PHOTOS - images.length;
    if (room <= 0) {
      toast.error(`Максимум ${MAX_PHOTOS} фото на автомобиль`);
      return;
    }
    setBusy(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, room)) {
        try {
          const prepared = await prepareImage(file);
          const res = await upload({
            data: { fileName: prepared.fileName, contentBase64: prepared.contentBase64 },
          });
          if (res.ok && res.url) {
            const ok = await verify(res.url);
            if (ok) added.push(res.url);
            else toast.error(`${file.name}: файл сохранён, но недоступен по ссылке`);
          } else toast.error(res.error ?? `${file.name}: не удалось загрузить`);

      }
      if (added.length) {
        addUrls(added);
        toast.success(`Загружено фото: ${added.length}`);
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/40",
        )}
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">Перетащите фото сюда</p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · до 5 МБ · до {MAX_PHOTOS} фото</p>
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          <Button type="button" variant="soft" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            Выбрать файлы
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            className="sm:hidden"
            onClick={() => cameraRef.current?.click()}
          >
            Снять на камеру
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <div className="flex gap-2">
        <Input
          value={url}
          placeholder="…или вставьте ссылку на фото"
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          type="button"
          variant="soft"
          onClick={() => {
            const v = url.trim();
            if (!v) return;
            addUrls([v]);
            setUrl("");
          }}
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src, i) => (
            <li
              key={`${src}-${i}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted"
            >
              <CarImage src={src} alt={`Фото ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> обложка
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/85 px-1 py-0.5 backdrop-blur">
                <button
                  type="button"
                  aria-label="Левее"
                  className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Удалить фото"
                  className="rounded p-1 hover:bg-muted"
                  onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                </button>
                <button
                  type="button"
                  aria-label="Правее"
                  className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  disabled={i === images.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
