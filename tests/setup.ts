import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "fs";
import * as schema from "@/lib/db/schema";
import { setTestDb, resetTestDb } from "@/lib/db/client";

// ===== DB de test en mémoire =====
let sqlite: Database.Database;

beforeAll(() => {
  mkdirSync("./data", { recursive: true });
});

beforeEach(() => {
  sqlite = new Database(":memory:");
  sqlite.pragma("journal_mode = WAL");
  sqlite.exec(`
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
  const testDb = drizzle(sqlite, { schema });
  setTestDb(testDb);
});

afterEach(() => {
  cleanup();
  if (sqlite) sqlite.close();
  resetTestDb();
});

/** Insère une tâche directement en SQL (pour les tests). */
export function insertTask(overrides: Partial<schema.Task> = {}): schema.Task {
  return sqlite
    .prepare(
      `INSERT INTO tasks (title, description, priority, category, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .get(
      overrides.title ?? "Test task",
      overrides.description ?? null,
      overrides.priority ?? "medium",
      overrides.category ?? null,
      overrides.dueDate ?? null,
      overrides.status ?? "todo",
    ) as schema.Task;
}

/** Récupère toutes les tâches (pour les tests). */
export function getAllTasks(): schema.Task[] {
  return sqlite.prepare("SELECT * FROM tasks").all() as schema.Task[];
}