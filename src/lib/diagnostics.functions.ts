import { createServerFn } from "@tanstack/react-start";

export type DiagnosticsReport = {
  databaseConfigured: boolean;
  databaseReachable: boolean;
  databaseError: string | null;
  appliedMigrations: string[];
  failedMigrations: Array<{ name: string; message: string }>;
  columns: Array<{ table: string; column: string; present: boolean }>;
  tables: Array<{ table: string; present: boolean }>;
  buildTime: string | null;
};

const REQUIRED_COLUMNS: Array<[string, string]> = [
  ["payments", "purpose"],
  ["payments", "extension_id"],
  ["bookings", "start_mileage"],
  ["bookings", "return_mileage"],
  ["bookings", "extension_status"],
  ["client_documents", "birth_date"],
  ["client_documents", "issued_by"],
];

const REQUIRED_TABLES = ["booking_extensions", "car_reviews", "messages", "client_documents"];

export const adminDiagnostics = createServerFn({ method: "GET" }).handler(
  async (): Promise<DiagnosticsReport> => {
    const { requireAdmin } = await import("@/lib/adminGuard.server");
    await requireAdmin();

    const { hasDatabase, query } = await import("@/lib/db.server");
    const { ensureMigrations, migrationFailures } = await import("@/lib/migrations.server");

    const report: DiagnosticsReport = {
      databaseConfigured: hasDatabase(),
      databaseReachable: false,
      databaseError: null,
      appliedMigrations: [],
      failedMigrations: [],
      columns: REQUIRED_COLUMNS.map(([table, column]) => ({ table, column, present: false })),
      tables: REQUIRED_TABLES.map((table) => ({ table, present: false })),
      buildTime: process.env["VITE_BUILD_TIME"] ?? null,
    };

    if (!report.databaseConfigured) return report;

    try {
      await ensureMigrations();
      report.failedMigrations = migrationFailures();

      const applied = await query<{ name: string }>(
        `select name from schema_migrations order by name`,
      );
      report.appliedMigrations = applied.map((r) => r.name);

      const cols = await query<{ table_name: string; column_name: string }>(
        `select table_name, column_name from information_schema.columns where table_schema = 'public'`,
      );
      const present = new Set(cols.map((c) => `${c.table_name}.${c.column_name}`));
      report.columns = REQUIRED_COLUMNS.map(([table, column]) => ({
        table,
        column,
        present: present.has(`${table}.${column}`),
      }));
      const tbls = await query<{ table_name: string }>(
        `select table_name from information_schema.tables where table_schema = 'public'`,
      );
      const tablesPresent = new Set(tbls.map((t) => t.table_name));
      report.tables = REQUIRED_TABLES.map((table) => ({ table, present: tablesPresent.has(table) }));
      report.databaseReachable = true;
    } catch (error) {
      report.databaseError = error instanceof Error ? error.message : String(error);
    }

    return report;
  },
);
