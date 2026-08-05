import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Crée un client LibSQL pointant vers Turso (production) ou un fichier local (dev).
 * En prod (Netlify), les env vars TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sont obligatoires.
 * En dev local, on utilise un fichier SQLite local via libsql://file:.
 */
function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && authToken) {
    // Production: Turso remote database
    return createClient({ url, authToken });
  }

  // Développement local: fichier SQLite
  const localPath = process.env.LOCAL_DB_PATH ?? "./data/todo.db";
  return createClient({ url: `file:${localPath}` });
}

const client = createDbClient();
export const db = drizzle(client, { schema });
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
