import { sql } from "drizzle-orm";
import { db, sqlite } from "@/lib/db/client";
import { afterAll, beforeEach } from "vitest";

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
  )
`);

beforeEach(() => {
  sqlite.exec(`DELETE FROM tasks`);
  sqlite.exec(`DELETE FROM sqlite_sequence WHERE name = 'tasks'`);
});

afterAll(() => {
  sqlite.exec(`DROP TABLE IF EXISTS tasks`);
});
