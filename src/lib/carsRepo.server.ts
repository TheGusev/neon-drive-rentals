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

const FLEET_STATUSES: CarFleetStatus[] = ["free", "busy", "washing", "maintenance"];
const FLEET_SYNONYMS: Record<string, CarFleetStatus> = {
  available: "free",
  ready: "free",
  rented: "busy",
  booked: "busy",
  service: "maintenance",
  repair: "maintenance",
  wash: "washing",
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

export async function fetchCars(): Promise<Car[]> {
  if (!hasDatabase()) return mockCars;
  const rows = await query<CarRow>(`${SELECT_CARS} order by brand asc, model asc, year desc`);
  return rows.map(mapCarRow);
}

export async function fetchCarBySlug(slug: string): Promise<Car | null> {
  if (!hasDatabase()) return mockCars.find((c) => c.id === slug || c.slug === slug) ?? null;
  const rows = await query<CarRow>(`${SELECT_CARS} where slug = $1 or id::text = $1 limit 1`, [slug]);
  return rows.length ? mapCarRow(rows[0]) : null;
}

/** Internal id (primary key) for a public slug — needed when writing bookings. */
export async function resolveCarDbId(slug: string): Promise<string | null> {
  if (!hasDatabase()) return mockCars.some((c) => c.id === slug) ? slug : null;
  const rows = await query<{ id: string }>(`select id from cars where slug = $1 or id::text = $1 limit 1`, [slug]);
  return rows.length ? String(rows[0].id) : null;
}
