import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "fs";
import * as schema from "@/lib/db/schema";

declare global {
  var __testDb: ReturnType<typeof drizzle> | undefined;
}

// ===== DB de test en mémoire =====
let sqlite: Database.Database;

beforeAll(() => {
  // Override le module db/client pour utiliser une DB en mémoire
  mkdirSync("./data", { recursive: true });
});

beforeEach(() => {
  // Créer une DB en mémoire fraiche pour chaque test
  sqlite = new Database(":memory:");
  sqlite.pragma("journal_mode = WAL");

  // Créer la table tasks
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

  // Override le db exporté
  const testDb = drizzle(sqlite, { schema });
  globalThis.__testDb = testDb;
});

afterEach(() => {
  cleanup();
  if (sqlite) sqlite.close();
});

// Helper pour accéder à la DB de test
export function getTestDb() {
  return globalThis.__testDb as ReturnType<typeof drizzle>;
}

// Helper: insère une tâche directement en SQL
export function insertTask(overrides: Partial<schema.Task> = {}): schema.Task {
  const row = sqlite
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
  return row;
}

// Helper: récupère toutes les tâches
export function getAllTasks(): schema.Task[] {
  return sqlite.prepare("SELECT * FROM tasks").all() as schema.Task[];
}