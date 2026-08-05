import { createClient } from @libsql/client;
import { drizzle } from drizzle-orm/libsql;
import { existsSync, mkdirSync } from node:fs;
import { dirname, resolve } from node:path;
import * as schema from ./schema;

const IS_SERVERLESS = !!(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.cwd() === /var/task
);

const DB_PATH = process.env.DB_PATH ?? (
  IS_SERVERLESS
    ? /tmp/todo.db
    : resolve(process.cwd(), data/todo.db)
);

function ensureDirExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (client) return client;
  ensureDirExists(DB_PATH);
  client = createClient({ url: `file:${DB_PATH}` });
  return client;
}

export const db = drizzle(getClient(), { schema });
export { schema };

let testDb: ReturnType<typeof drizzle> | null = null;

export function setTestDb(testDbInstance: ReturnType<typeof drizzle>) {
  testDb = testDbInstance;
}

export function resetTestDb() {
  testDb = null;
}

export function getDb() {
  return testDb ?? db;
}
