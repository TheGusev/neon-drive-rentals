import type { Pool, QueryResultRow } from "pg";

/** True when a real PostgreSQL connection string is configured. */
export function hasDatabase(): boolean {
  return Boolean(process.env["DATABASE_URL"]);
}

type PoolHolder = { __nskPgPool?: Pool };

async function getPool(): Promise<Pool> {
  const holder = globalThis as unknown as PoolHolder;
  if (holder.__nskPgPool) return holder.__nskPgPool;

  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  // Dynamic import keeps the Node-only driver out of the client/edge graph.
  const pg = await import("pg");
  const PoolCtor = (pg.default ?? pg).Pool;

  const needsSsl = /sslmode=require/.test(connectionString);
  const pool = new PoolCtor({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  holder.__nskPgPool = pool;
  return pool;
}

/** Runs a parameterized query and returns the rows. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = await getPool();
  const result = await pool.query<T>(text, params as never[]);
  return result.rows;
}

/** Runs a callback inside a transaction on a single connection. */
export async function withTransaction<T>(
  fn: (run: <R extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) => Promise<R[]>) => Promise<T>,
): Promise<T> {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const run = async <R extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) => {
      const res = await client.query<R>(text, params as never[]);
      return res.rows;
    };
    const out = await fn(run);
    await client.query("COMMIT");
    return out;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
