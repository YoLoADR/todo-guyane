import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";
import { setTestDb, resetTestDb } from "@/lib/db/client";

// ===== DB de test en mémoire =====
let client: ReturnType<typeof createClient>;

beforeAll(() => {
  // LibSQL in-memory: use :memory: with file: protocol
});

beforeEach(async () => {
  client = createClient({ url: ":memory:" });
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL CHECK(priority IN ('low','medium','high','urgent')),
      category TEXT,
      due_date TEXT,
      status TEXT NOT NULL CHECK(status IN ('backlog','todo','in_progress','done')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const testDb = drizzle(client, { schema });
  setTestDb(testDb);
});

afterEach(() => {
  cleanup();
  if (client) client.close();
  resetTestDb();
});

/** Insère une tâche directement en SQL (pour les tests). */
export async function insertTask(overrides: Partial<schema.Task> = {}): Promise<schema.Task> {
  const result = await client.execute({
    sql: `INSERT INTO tasks (title, description, priority, category, due_date, status)
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING *`,
    args: [
      overrides.title ?? "Test task",
      overrides.description ?? null,
      overrides.priority ?? "medium",
      overrides.category ?? null,
      overrides.dueDate ?? null,
      overrides.status ?? "todo",
    ],
  });
  return result.rows[0] as unknown as schema.Task;
}

/** Récupère toutes les tâches (pour les tests). */
export async function getAllTasks(): Promise<schema.Task[]> {
  const result = await client.execute("SELECT * FROM tasks");
  return result.rows as unknown as schema.Task[];
}
