import { hasDatabase, query } from "@/lib/db.server";

import initSchema from "../../db/migrations/001_init.sql?raw";
import seedCars from "../../db/migrations/002_seed_cars.sql?raw";
import addSignature from "../../db/migrations/003_add_signature.sql?raw";
import authPayments from "../../db/migrations/004_auth_payments.sql?raw";
import fixCarImages from "../../db/migrations/005_fix_car_images.sql?raw";
import removeWashStatus from "../../db/migrations/006_remove_wash_status.sql?raw";
import seoTimestamps from "../../db/migrations/007_seo_timestamps.sql?raw";
import carPhotos from "../../db/migrations/008_car_photos.sql?raw";
import rentalTerms from "../../db/migrations/009_rental_terms.sql?raw";
import realPhotos from "../../db/migrations/010_real_photos.sql?raw";
import repairPhotos from "../../db/migrations/011_repair_and_merge_car_photos.sql?raw";
import protectCustomImages from "../../db/migrations/012_protect_custom_images.sql?raw";
import clientProfile from "../../db/migrations/013_client_profile.sql?raw";
import carPhotosBlob from "../../db/migrations/014_car_photos_blob.sql?raw";
import clientAccounts from "../../db/migrations/015_client_accounts.sql?raw";
import rentalJourney from "../../db/migrations/016_rental_journey.sql?raw";

/** Порядок применения важен; все миграции идемпотентны для существующей базы. */
const MIGRATIONS: Array<{ name: string; sql: string }> = [
  { name: "001_init", sql: initSchema },
  { name: "002_seed_cars", sql: seedCars },
  { name: "003_add_signature", sql: addSignature },
  { name: "004_auth_payments", sql: authPayments },
  { name: "005_fix_car_images", sql: fixCarImages },
  { name: "006_remove_wash_status", sql: removeWashStatus },
  { name: "007_seo_timestamps", sql: seoTimestamps },
  { name: "008_car_photos", sql: carPhotos },
  { name: "009_rental_terms", sql: rentalTerms },
  { name: "010_real_photos", sql: realPhotos },
  { name: "011_repair_and_merge_car_photos", sql: repairPhotos },
  { name: "012_protect_custom_images", sql: protectCustomImages },
  { name: "013_client_profile", sql: clientProfile },
  { name: "014_car_photos_blob", sql: carPhotosBlob },
  { name: "015_client_accounts", sql: clientAccounts },
  { name: "016_rental_journey", sql: rentalJourney },
];

type Holder = { __nskMigrations?: Promise<string[]> };

async function apply(): Promise<string[]> {
  const applied: string[] = [];
  if (!hasDatabase()) return applied;

  await query(`create table if not exists schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )`);

  // Одна нода за раз — защищаемся от гонок при нескольких воркерах pm2.
  await query(`select pg_advisory_lock(918273645)`);
  try {
    const done = await query<{ name: string }>(`select name from schema_migrations`);
    const doneSet = new Set(done.map((r) => r.name));

    for (const migration of MIGRATIONS) {
      if (doneSet.has(migration.name)) continue;
      try {
        await query(migration.sql);
        await query(`insert into schema_migrations (name) values ($1) on conflict do nothing`, [
          migration.name,
        ]);
        applied.push(migration.name);
      } catch (error) {
        // Одна упавшая миграция не должна блокировать SSR и остальные миграции.
        console.error(`[migrations] ${migration.name} failed`, error);
      }
    }
  } finally {
    await query(`select pg_advisory_unlock(918273645)`);
  }

  return applied;
}

/** Применяет недостающие миграции один раз за жизнь процесса. */
export function ensureMigrations(): Promise<string[]> {
  const holder = globalThis as unknown as Holder;
  if (!holder.__nskMigrations) {
    holder.__nskMigrations = apply().catch((error) => {
      console.error("[migrations] failed", error);
      return [];
    });
  }
  return holder.__nskMigrations;
}

/** Принудительный повторный прогон (админ-кнопка / ssh). */
export async function runMigrationsNow(): Promise<string[]> {
  const holder = globalThis as unknown as Holder;
  holder.__nskMigrations = undefined;
  return ensureMigrations();
}
