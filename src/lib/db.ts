import { createClient, type Client, type InArgs } from '@libsql/client';

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || 'file:data/mocks.db';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

let client: Client | null = null;
let initPromise: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function initSchema(): Promise<void> {
  const c = getClient();
  await c.execute(`
    CREATE TABLE IF NOT EXISTS mocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      route_path TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'GET',
      request_headers TEXT,
      query_params TEXT,
      response_status_code INTEGER NOT NULL DEFAULT 200,
      response_headers TEXT,
      response_body TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await c.execute(`
    CREATE INDEX IF NOT EXISTS idx_mocks_route_method
      ON mocks (route_path, method)
  `);
}

export async function getDb(): Promise<Client> {
  const c = getClient();
  if (!initPromise) {
    initPromise = initSchema();
  }
  await initPromise;
  return c;
}

export async function queryAll(sql: string, args: InArgs = []): Promise<Record<string, unknown>[]> {
  const c = await getDb();
  const result = await c.execute({ sql, args });
  return result.rows as unknown as Record<string, unknown>[];
}

export async function queryOne(sql: string, args: InArgs = []): Promise<Record<string, unknown> | null> {
  const c = await getDb();
  const result = await c.execute({ sql, args });
  return (result.rows[0] as unknown as Record<string, unknown>) ?? null;
}

export async function execute(sql: string, args: InArgs = []): Promise<{ lastInsertRowid: bigint | undefined; rowsAffected: number }> {
  const c = await getDb();
  const result = await c.execute({ sql, args });
  return {
    lastInsertRowid: result.lastInsertRowid,
    rowsAffected: result.rowsAffected,
  };
}
