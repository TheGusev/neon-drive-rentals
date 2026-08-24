import type { Car, CarClass, CarFleetStatus, Transmission } from "@/types/domain";
import { hasDatabase, query } from "@/lib/db.server";
import { mockCars } from "@/data/mockCars";

type Specs = Record<string, unknown>;

type CarRow = {
  id: string;
  slug: string | null;
  brand: string | null;
  model: string | null;
  year: number | string | null;
  class: string | null;
  transmission: string | null;
  seats: number | string | null;
  price_city: number | string | null;
  price_out: number | string | null;
  status: string | null;
  images: unknown;
  specs: unknown;
  plate: string | null;
};

const num = (value: unknown, fallback: number): number => {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(n) ? n : fallback;
};

const str = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim() ? value : fallback;

function toSpecs(value: unknown): Specs {
  if (!value) return {};
  if (typeof value === "object") return value as Specs;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? (parsed as Specs) : {};
    } catch {
      return {};
    }
  }
  return {};
}

function toImages(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter((v): v is string => typeof v === "string" && v.length > 0);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === "string");
    } catch {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

const STABLE_IMAGE_BY_SLUG: Record<string, string> = {
  "honda-n-wgn-grey-1": "/assets/cars/honda-n-wgn-grey.jpg",
  "honda-n-wgn-blue-1": "/assets/cars/real/honda-n-wgn-blue-real.jpg",
  "honda-n-wgn-blue-2": "/assets/cars/honda-n-wgn-blue.jpg",
  "honda-n-wgn-black-1": "/assets/cars/honda-n-wgn-black.jpg",
  "nissan-dayz-green-1": "/assets/cars/nissan-dayz-green.jpg",
  "nissan-dayz-brown-1": "/assets/cars/real/nissan-dayz-brown-real.jpg",
  "mitsubishi-ek-wagon-blue-1": "/assets/cars/real/mitsubishi-ek-wagon-black-real.jpg",
  "daihatsu-mira-es-black-1": "/assets/cars/daihatsu-mira-es-black.jpg",
  "nissan-dayz-grey-1": "/assets/cars/nissan-dayz-grey.jpg",
  "nissan-dayz-white-1": "/assets/cars/nissan-dayz-white.jpg",
  "daihatsu-move-white-1": "/assets/cars/daihatsu-move-white.jpg",
  "honda-n-wgn-white-1": "/assets/cars/honda-n-wgn-white.jpg",
  "honda-n-wgn-turbo-white-1": "/assets/cars/honda-n-wgn-turbo-white.jpg",
  "honda-n-wgn-white-2": "/assets/cars/real/honda-n-wgn-white-real.jpg",
  "nissan-dayz-grey-2": "/assets/cars/nissan-dayz-grey.jpg",
  "honda-n-box-black-1": "/assets/cars/real/honda-n-box-black-real-3.jpg",
  "nissan-dayz-black-1": "/assets/cars/real/nissan-dayz-black-real.jpg",
  "daihatsu-mira-white-1": "/assets/cars/daihatsu-mira-white.jpg",
  "suzuki-alto-white-1": "/assets/cars/suzuki-alto-white.jpg",
  "daihatsu-mira-es-white-1": "/assets/cars/daihatsu-mira-es-white.jpg",
  "suzuki-alto-white-2": "/assets/cars/suzuki-alto-works.jpg",
  "honda-n-wgn-grey-2": "/assets/cars/honda-n-wgn-grey-2018.jpg",
  "honda-n-wgn-blue": "/assets/cars/real/honda-n-wgn-blue-real.jpg",
  "honda-n-wgn-black": "/assets/cars/honda-n-wgn-black.jpg",
  "honda-n-wgn-white": "/assets/cars/honda-n-wgn-white.jpg",
  "honda-n-wgn-turbo-white": "/assets/cars/honda-n-wgn-turbo-white.jpg",
  "nissan-dayz-green": "/assets/cars/nissan-dayz-green.jpg",
  "nissan-dayz-brown": "/assets/cars/real/nissan-dayz-brown-real.jpg",
  "nissan-dayz-grey": "/assets/cars/nissan-dayz-grey.jpg",
  "nissan-dayz-white-2": "/assets/cars/nissan-dayz-highway-star-white.jpg",
  "nissan-dayz-black": "/assets/cars/real/nissan-dayz-black-real.jpg",
  "mitsubishi-ek-wagon-blue": "/assets/cars/real/mitsubishi-ek-wagon-black-real.jpg",
  "daihatsu-mira-es-black-2": "/assets/cars/daihatsu-mira-es-black-2018.jpg",
  "daihatsu-mira-es-white": "/assets/cars/daihatsu-mira-es-white.jpg",
  "daihatsu-move-white": "/assets/cars/daihatsu-move-white.jpg",
  "honda-n-box-black": "/assets/cars/real/honda-n-box-black-real-3.jpg",
  "daihatsu-mira-white": "/assets/cars/daihatsu-mira-white.jpg",
  "suzuki-alto-white": "/assets/cars/suzuki-alto-white.jpg",
  "honda-n-wgn-black-2": "/assets/cars/honda-n-wgn-black-2020.jpg",
};

const isStableAssetUrl = (url: string) =>
  url.startsWith("/assets/cars/") || url.startsWith("http://") || url.startsWith("https://");

function normalizedImages(slug: string, value: unknown): string[] {
  const valid = Array.from(new Set(toImages(value).filter(isStableAssetUrl)));
  if (valid.length) return valid;
  const fallback = STABLE_IMAGE_BY_SLUG[slug];
  return fallback ? [fallback] : [];
}

async function withPublicFallback<T>(label: string, task: Promise<T>, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<T>((resolve) => {
      timer = setTimeout(() => resolve(fallback), 4_500);
    });
    const result = await Promise.race([task, timeout]);
    if (result === fallback) console.error(`[public-data] ${label} timed out; serving fallback`);
    return result;
  } catch (error) {
    console.error(`[public-data] ${label} failed; serving fallback`, error);
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const FLEET_STATUSES: CarFleetStatus[] = ["free", "busy", "maintenance"];
const FLEET_SYNONYMS: Record<string, CarFleetStatus> = {
  available: "free",
  ready: "free",
  rented: "busy",
  booked: "busy",
  service: "maintenance",
  repair: "maintenance",
  wash: "maintenance",
};

export function normalizeFleetStatus(value: unknown): CarFleetStatus {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  if ((FLEET_STATUSES as string[]).includes(key)) return key as CarFleetStatus;
  return FLEET_SYNONYMS[key] ?? "free";
}

const CAR_CLASSES: CarClass[] = ["econom", "sport", "premium"];
const TRANSMISSIONS: Transmission[] = ["AT", "MT", "CVT"];

function normalizeClass(value: unknown): CarClass {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  return (CAR_CLASSES as string[]).includes(key) ? (key as CarClass) : "econom";
}

function normalizeTransmission(value: unknown): Transmission {
  const key = String(value ?? "")
    .trim()
    .toUpperCase();
  return (TRANSMISSIONS as string[]).includes(key) ? (key as Transmission) : "AT";
}

export function mapCarRow(row: CarRow): Car {
  const specs = toSpecs(row.specs);
  const brand = str(row.brand, "");
  const model = str(row.model, "");
  const id = str(row.slug, String(row.id));
  const images = normalizedImages(id, row.images);

  return {
    id,
    slug: id,
    brand,
    model,
    displayName: `${brand} ${model}`.trim(),
    color: str(specs["color"], "—"),
    year: num(row.year, new Date().getFullYear()),
    class: normalizeClass(row.class),
    power: num(specs["power"], 0),
    torque: num(specs["torque"], 0),
    consumption: num(specs["consumption"], 0),
    transmission: normalizeTransmission(row.transmission),
    drive: str(specs["drive"], "передний"),
    pricePerDay: num(row.price_city, num(specs["pricePerDay"], 0)),
    image: images[0],
    gallery: images.length ? images : undefined,
    rating: num(specs["rating"], 5),
    reviewsCount: num(specs["reviewsCount"], 0),
    engineVolume: num(specs["engineVolume"], 0.66),
    bodyType: str(specs["bodyType"], "хэтчбек"),
    seats: num(row.seats, num(specs["seats"], 4)),
    deposit: num(specs["deposit"], 2000),
    mileageLimit: num(specs["mileageLimit"], 300),
    fuelPolicy: str(specs["fuelPolicy"], "полный → полный"),
    vin: typeof specs["vin"] === "string" ? (specs["vin"] as string) : undefined,
    plate: str(row.plate, ""),
    status: normalizeFleetStatus(row.status),
    bookedDates: [],
  };
}

const SELECT_CARS = `
  select id, slug, brand, model, year, class, transmission, seats,
         price_city, price_out, status, images, specs, plate
  from cars
`;

/** Госномер — служебные данные, наружу не отдаём. */
const withoutPlate = (car: Car): Car => ({ ...car, plate: undefined });

/** Доменный статус → значение в БД (available / busy / wash / maintenance). */
export function toDbFleetStatus(status: CarFleetStatus): string {
  if (status === "free") return "available";
  return status;
}

async function ready(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const { ensureMigrations } = await import("@/lib/migrations.server");
  await ensureMigrations();
  return true;
}

export async function fetchCars(): Promise<Car[]> {
  const fallback = mockCars.map(withoutPlate);
  if (!hasDatabase()) return fallback;
  return withPublicFallback(
    "catalog",
    (async () => {
      if (!(await ready())) return fallback;
      const rows = await query<CarRow>(`${SELECT_CARS} order by brand asc, model asc, year desc`);
      return rows.map(mapCarRow).map(withoutPlate);
    })(),
    fallback,
  );
}

export async function fetchCarBySlug(slug: string): Promise<Car | null> {
  const found = mockCars.find((c) => c.id === slug || c.slug === slug);
  const fallback = found ? withoutPlate(found) : null;
  if (!hasDatabase()) return fallback;
  return withPublicFallback(
    `car:${slug}`,
    (async () => {
      if (!(await ready())) return fallback;
      const rows = await query<CarRow>(`${SELECT_CARS} where slug = $1 or id::text = $1 limit 1`, [
        slug,
      ]);
      return rows.length ? withoutPlate(mapCarRow(rows[0])) : null;
    })(),
    fallback,
  );
}

/** Полные данные автопарка вместе с госномерами — только для админки. */
export async function fetchCarsAdmin(): Promise<Car[]> {
  if (!(await ready())) return mockCars;
  const rows = await query<CarRow>(`${SELECT_CARS} order by brand asc, model asc, year desc`);
  return rows.map(mapCarRow);
}

export async function fetchCarAdminBySlug(slug: string): Promise<Car | null> {
  if (!(await ready())) return mockCars.find((c) => c.id === slug) ?? null;
  const rows = await query<CarRow>(`${SELECT_CARS} where slug = $1 or id::text = $1 limit 1`, [
    slug,
  ]);
  return rows.length ? mapCarRow(rows[0]) : null;
}

export type CarInput = {
  slug?: string;
  brand: string;
  model: string;
  year: number;
  transmission: Transmission;
  seats: number;
  priceCity: number;
  priceOut: number;
  status: CarFleetStatus;
  plate: string;
  color: string;
  power?: number;
  consumption?: number;
  engineVolume?: number;
  deposit?: number;
  vin?: string;
  image?: string;
  images?: string[];
};

const translit: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function specsFrom(input: CarInput): Record<string, unknown> {
  return {
    color: input.color,
    power: input.power ?? 52,
    consumption: input.consumption ?? 4,
    engineVolume: input.engineVolume ?? 0.66,
    deposit: input.deposit ?? 2000,
    mileageLimit: 300,
    fuelPolicy: "полный → полный",
    drive: "передний",
    bodyType: "хэтчбек",
    rating: 5,
    reviewsCount: 0,
    ...(input.vin ? { vin: input.vin } : {}),
  };
}

/** Галерея из формы: массив images, иначе одиночная ссылка image. */
function inputImages(input: CarInput): string[] {
  const list = (input.images ?? []).map((v) => v.trim()).filter(Boolean);
  if (list.length) return Array.from(new Set(list));
  const single = input.image?.trim();
  return single ? [single] : [];
}

export async function insertCar(input: CarInput): Promise<Car | null> {
  if (!(await ready())) return null;
  const baseSlug =
    input.slug?.trim() || slugify(`${input.brand}-${input.model}-${input.color}-${input.year}`);
  let slug = baseSlug;
  for (let i = 2; i < 50; i += 1) {
    const taken = await query<{ id: string }>(`select id from cars where slug = $1 limit 1`, [
      slug,
    ]);
    if (!taken.length) break;
    slug = `${baseSlug}-${i}`;
  }

  const rows = await query<CarRow>(
    `insert into cars (slug, brand, model, year, class, transmission, seats, price_city, price_out, status, images, specs, plate)
     values ($1,$2,$3,$4,'Econom',$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12)
     returning id, slug, brand, model, year, class, transmission, seats, price_city, price_out, status, images, specs, plate`,
    [
      slug,
      input.brand,
      input.model,
      input.year,
      input.transmission,
      input.seats,
      input.priceCity,
      input.priceOut,
      toDbFleetStatus(input.status),
      JSON.stringify(inputImages(input)),
      JSON.stringify(specsFrom(input)),
      input.plate,
    ],
  );
  return rows.length ? mapCarRow(rows[0]) : null;
}

export async function updateCarInDb(slug: string, input: CarInput): Promise<Car | null> {
  if (!(await ready())) return null;
  const current = await fetchCarAdminBySlug(slug);
  if (!current) return null;

  const provided = inputImages(input);
  const images = provided.length
    ? provided
    : (current.gallery ?? (current.image ? [current.image] : []));
  const rows = await query<CarRow>(
    `update cars set brand=$2, model=$3, year=$4, transmission=$5, seats=$6,
            price_city=$7, price_out=$8, status=$9, images=$10::jsonb,
            specs = coalesce(specs, '{}'::jsonb) || $11::jsonb, plate=$12
     where slug = $1 or id::text = $1
     returning id, slug, brand, model, year, class, transmission, seats, price_city, price_out, status, images, specs, plate`,
    [
      slug,
      input.brand,
      input.model,
      input.year,
      input.transmission,
      input.seats,
      input.priceCity,
      input.priceOut,
      toDbFleetStatus(input.status),
      JSON.stringify(images),
      JSON.stringify(specsFrom(input)),
      input.plate,
    ],
  );
  return rows.length ? mapCarRow(rows[0]) : null;
}

export async function updateCarStatusInDb(
  slug: string,
  status: CarFleetStatus,
): Promise<Car | null> {
  if (!(await ready())) return null;
  const rows = await query<CarRow>(
    `update cars set status = $2 where slug = $1 or id::text = $1
     returning id, slug, brand, model, year, class, transmission, seats, price_city, price_out, status, images, specs, plate`,
    [slug, toDbFleetStatus(status)],
  );
  return rows.length ? mapCarRow(rows[0]) : null;
}

export type DeleteCarResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "has_bookings" | "no_db" };

/** Удаление авто запрещено, пока по нему есть незакрытые брони. */
export async function deleteCarInDb(slug: string): Promise<DeleteCarResult> {
  if (!(await ready())) return { ok: false, reason: "no_db" };

  const blocking = await query<{ id: string }>(
    `select b.id from bookings b
     join cars c on c.id = b.car_id
     where (c.slug = $1 or c.id::text = $1)
       and b.status in ('pending','paid','confirmed','active')
     limit 1`,
    [slug],
  );
  if (blocking.length) return { ok: false, reason: "has_bookings" };

  const rows = await query<{ id: string }>(
    `delete from cars where slug = $1 or id::text = $1 returning id`,
    [slug],
  );
  return rows.length > 0 ? { ok: true } : { ok: false, reason: "not_found" };
}

/** Internal id (primary key) for a public slug — needed when writing bookings. */
export async function resolveCarDbId(slug: string): Promise<string | null> {
  if (!hasDatabase()) return mockCars.some((c) => c.id === slug) ? slug : null;
  const rows = await query<{ id: string }>(
    `select id from cars where slug = $1 or id::text = $1 limit 1`,
    [slug],
  );
  return rows.length ? String(rows[0].id) : null;
}

/** Полная замена галереи автомобиля (первый кадр — обложка). */
export async function updateCarImagesInDb(slug: string, images: string[]): Promise<Car | null> {
  if (!(await ready())) return null;
  const rows = await query<CarRow>(
    `update cars set images = $2::jsonb where slug = $1 or id::text = $1
     returning id, slug, brand, model, year, class, transmission, seats, price_city, price_out, status, images, specs, plate`,
    [slug, JSON.stringify(images)],
  );
  return rows.length ? mapCarRow(rows[0]) : null;
}
