import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";
import * as schema from "./schema";

const DB_PATH = "./data/todo.db";

// Ensure the data directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
export { schema };

/**
 * Pour les tests: permet d'override la DB avec une instance en mémoire.
 * Usage: setTestDb(myInMemoryDb) avant les tests, resetTestDb() après.
 */
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