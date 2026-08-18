import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, ArrowDown, ExternalLink, ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CarCard } from "@/components/catalog/CarCard";
import { CarGallery } from "@/components/car/CarGallery";
import { adminCarsQueryOptions } from "@/lib/queries";
import { updateCarImages, uploadCarPhoto } from "@/lib/admin.functions";
import { noindexMeta } from "@/lib/seo";
import type { Car } from "@/types/domain";

export const Route = createFileRoute("/_admin/admin/car-photos/$carId")({
  head: () => ({ meta: [{ title: "Фотографии авто — Панель управления" }, noindexMeta] }),
  component: CarPhotosPage,
});

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read_error"));
    reader.readAsDataURL(file);
  });

function CarPhotosPage() {
  const { carId } = Route.useParams();
  const { data: cars } = useSuspenseQuery(adminCarsQueryOptions());
  const queryClient = useQueryClient();

  const car = useMemo(() => cars.find((c) => c.id === carId || c.slug === carId), [cars, carId]);

  const initial = useMemo(() => car?.gallery ?? (car?.image ? [car.image] : []), [car]);
  const [images, setImages] = useState<string[]>(initial);
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setImages(initial), [initial]);

  const saveFn = useServerFn(updateCarImages);
  const uploadFn = useServerFn(uploadCarPhoto);

  const saveMutation = useMutation({
    mutationFn: () => saveFn({ data: { id: carId, images } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error("Не удалось сохранить: база данных недоступна");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "cars"] });
      await queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Фотографии обновлены");
    },
    onError: () => toast.error("Сервис временно недоступен"),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const contentBase64 = await fileToBase64(file);
      return uploadFn({ data: { fileName: file.name, contentBase64 } });
    },
    onSuccess: (res) => {
      if (!res.ok || !res.url) {
        toast.error(res.error ?? "Не удалось загрузить файл");
        return;
      }
      setImages((prev) => [...prev, res.url!]);
      toast.success("Фото загружено — не забудьте сохранить");
    },
    onError: () => toast.error("Не удалось загрузить файл"),
  });

  if (!car) {
    return (
      <div className="w-full">
        <PageHeader title="Автомобиль не найден" description={carId} />
        <Button asChild variant="soft">
          <Link to="/admin/cars">
            <ArrowLeft className="mr-2 h-4 w-4" /> К автопарку
          </Link>
        </Button>
      </div>
    );
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const addUrl = () => {
    const value = url.trim();
    if (!value) return;
    if (images.includes(value)) {
      toast.error("Такое фото уже есть в галерее");
      return;
    }
    setImages((prev) => [...prev, value]);
    setUrl("");
  };

  const dirty = JSON.stringify(images) !== JSON.stringify(initial);
  const previewCar: Car = { ...car, image: images[0], gallery: images.length ? images : undefined };

  return (
    <div className="w-full">
      <PageHeader
        title={`Фото · ${car.brand} ${car.model}`}
        description={`${car.year} · ${car.color} · ${images.length} фото в галерее`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="soft">
              <Link to="/admin/cars">
                <ArrowLeft className="mr-2 h-4 w-4" /> К автопарку
              </Link>
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!dirty || saveMutation.isPending}>
              Сохранить
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Галерея</h2>
            {images.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Фотографий пока нет — добавьте ссылку или загрузите файл.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {images.map((src, i) => (
                  <li key={`${src}-${i}`} className="overflow-hidden rounded-xl border border-border bg-background">
                    <div className="relative aspect-[4/3] bg-muted">
                      <img src={src} alt={`${car.brand} ${car.model} — фото ${i + 1}`} className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                          <Star className="h-3 w-3" /> Обложка
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2">
                      <span className="truncate text-[11px] text-muted-foreground" title={src}>
                        {src}
                      </span>
                      <div className="flex shrink-0 gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Выше" onClick={() => move(i, i - 1)}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ниже" onClick={() => move(i, i + 1)}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Удалить фото"
                          onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Добавить фото</h2>
            <div className="space-y-1.5">
              <Label htmlFor="photo-url">Ссылка на изображение</Label>
              <div className="flex gap-2">
                <Input
                  id="photo-url"
                  placeholder="/assets/cars/honda-n-wgn-grey.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addUrl();
                  }}
                />
                <Button variant="soft" onClick={addUrl}>
                  <ImagePlus className="mr-2 h-4 w-4" /> Добавить
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadMutation.mutate(file);
                  e.target.value = "";
                }}
              />
              <Button variant="soft" onClick={() => fileRef.current?.click()} disabled={uploadMutation.isPending}>
                <Upload className="mr-2 h-4 w-4" />
                {uploadMutation.isPending ? "Загрузка…" : "Загрузить файл (JPG, PNG, WEBP до 6 МБ)"}
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Предпросмотр · каталог /cars</h2>
              <Button asChild variant="ghost" size="sm">
                <a href="/cars" target="_blank" rel="noreferrer">
                  Открыть <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
            <CarCard car={previewCar} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Предпросмотр · страница авто</h2>
              <Button asChild variant="ghost" size="sm">
                <a href={`/cars/${car.slug}`} target="_blank" rel="noreferrer">
                  Открыть <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
            <CarGallery alt={`${car.brand} ${car.model}`} images={images} />
            {dirty && (
              <p className="mt-3 text-xs text-muted-foreground">
                Изменения ещё не сохранены — на сайте показывается прежняя галерея.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
