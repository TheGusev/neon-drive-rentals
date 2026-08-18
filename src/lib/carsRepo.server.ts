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
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.length > 0);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === "string");
    } catch {
      return value.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
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
  const key = String(value ?? "").trim().toLowerCase();
  if ((FLEET_STATUSES as string[]).includes(key)) return key as CarFleetStatus;
  return FLEET_SYNONYMS[key] ?? "free";
}

const CAR_CLASSES: CarClass[] = ["econom", "sport", "premium"];
const TRANSMISSIONS: Transmission[] = ["AT", "MT", "CVT"];

function normalizeClass(value: unknown): CarClass {
  const key = String(value ?? "").trim().toLowerCase();
  return (CAR_CLASSES as string[]).includes(key) ? (key as CarClass) : "econom";
}

function normalizeTransmission(value: unknown): Transmission {
  const key = String(value ?? "").trim().toUpperCase();
  return (TRANSMISSIONS as string[]).includes(key) ? (key as Transmission) : "AT";
}

export function mapCarRow(row: CarRow): Car {
  const specs = toSpecs(row.specs);
  const images = toImages(row.images);
  const brand = str(row.brand, "");
  const model = str(row.model, "");
  const id = str(row.slug, String(row.id));

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
    deposit: num(specs["deposit"], 5000),
    mileageLimit: num(specs["mileageLimit"], 250),
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
  if (!(await ready())) return mockCars.map(withoutPlate);
  const rows = await query<CarRow>(`${SELECT_CARS} order by brand asc, model asc, year desc`);
  return rows.map(mapCarRow).map(withoutPlate);
}

export async function fetchCarBySlug(slug: string): Promise<Car | null> {
  if (!(await ready())) {
    const found = mockCars.find((c) => c.id === slug || c.slug === slug);
    return found ? withoutPlate(found) : null;
  }
  const rows = await query<CarRow>(`${SELECT_CARS} where slug = $1 or id::text = $1 limit 1`, [slug]);
  return rows.length ? withoutPlate(mapCarRow(rows[0])) : null;
}

/** Полные данные автопарка вместе с госномерами — только для админки. */
export async function fetchCarsAdmin(): Promise<Car[]> {
  if (!(await ready())) return mockCars;
  const rows = await query<CarRow>(`${SELECT_CARS} order by brand asc, model asc, year desc`);
  return rows.map(mapCarRow);
}

export async function fetchCarAdminBySlug(slug: string): Promise<Car | null> {
  if (!(await ready())) return mockCars.find((c) => c.id === slug) ?? null;
  const rows = await query<CarRow>(`${SELECT_CARS} where slug = $1 or id::text = $1 limit 1`, [slug]);
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
};

const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
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
    deposit: input.deposit ?? 5000,
    mileageLimit: 250,
    fuelPolicy: "полный → полный",
    drive: "передний",
    bodyType: "хэтчбек",
    rating: 5,
    reviewsCount: 0,
    ...(input.vin ? { vin: input.vin } : {}),
  };
}

export async function insertCar(input: CarInput): Promise<Car | null> {
  if (!(await ready())) return null;
  const baseSlug = input.slug?.trim() || slugify(`${input.brand}-${input.model}-${input.color}-${input.year}`);
  let slug = baseSlug;
  for (let i = 2; i < 50; i += 1) {
    const taken = await query<{ id: string }>(`select id from cars where slug = $1 limit 1`, [slug]);
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
      JSON.stringify(input.image ? [input.image] : []),
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

  const images = input.image ? [input.image] : (current.gallery ?? (current.image ? [current.image] : []));
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

export async function updateCarStatusInDb(slug: string, status: CarFleetStatus): Promise<Car | null> {
  if (!(await ready())) return null;
  const rows = await query<CarRow>(
    `update cars set status = $2 where slug = $1 or id::text = $1
     returning id, slug, brand, model, year, class, transmission, seats, price_city, price_out, status, images, specs, plate`,
    [slug, toDbFleetStatus(status)],
  );
  return rows.length ? mapCarRow(rows[0]) : null;
}

export async function deleteCarInDb(slug: string): Promise<boolean> {
  if (!(await ready())) return false;
  const rows = await query<{ id: string }>(
    `delete from cars where slug = $1 or id::text = $1 returning id`,
    [slug],
  );
  return rows.length > 0;
}

/** Internal id (primary key) for a public slug — needed when writing bookings. */
export async function resolveCarDbId(slug: string): Promise<string | null> {
  if (!hasDatabase()) return mockCars.some((c) => c.id === slug) ? slug : null;
  const rows = await query<{ id: string }>(`select id from cars where slug = $1 or id::text = $1 limit 1`, [slug]);
  return rows.length ? String(rows[0].id) : null;
}

