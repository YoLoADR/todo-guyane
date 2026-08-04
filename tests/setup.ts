import { sql } from "drizzle-orm";
import { db, sqlite } from "@/lib/db/client";
import { afterAll, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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
