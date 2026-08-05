import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";
import { setTestDb, resetTestDb } from "@/lib/db/client";

let sqlite: Database.Database;
let testDb: ReturnType<typeof drizzle<typeof schema>>;

beforeAll(() => {});

beforeEach(() => {
  sqlite = new Database(":memory:");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL,
      category TEXT,
      due_date TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  testDb = drizzle(sqlite, { schema });
  setTestDb(testDb);
});

afterEach(() => {
  cleanup();
  if (sqlite) sqlite.close();
  resetTestDb();
});

export function insertTask(overrides: Partial<schema.Task> = {}): schema.Task {
  const stmt = sqlite.prepare(
    `INSERT INTO tasks (title, description, priority, category, due_date, status)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING *`
  );
  const row = stmt.get(
    overrides.title ?? "Test task",
    overrides.description ?? null,
    overrides.priority ?? "medium",
    overrides.category ?? null,
    overrides.dueDate ?? null,
    overrides.status ?? "todo",
  ) as schema.Task;
  return row;
}

export function getAllTasks(): schema.Task[] {
  const rows = sqlite.prepare("SELECT * FROM tasks").all() as schema.Task[];
  return rows;
}