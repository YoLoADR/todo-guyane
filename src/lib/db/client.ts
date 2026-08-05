import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema";

const IS_SERVERLESS = !!(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.cwd() === "/var/task"
);

const DB_PATH = process.env.DB_PATH ?? (
  IS_SERVERLESS
    ? "/tmp/todo.db"
    : resolve(process.cwd(), "data/todo.db")
);

function ensureDirExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (dbInstance) return dbInstance;
  ensureDirExists(DB_PATH);
  const sqlite = new Database(DB_PATH);
  const createTable = "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, priority TEXT NOT NULL, category TEXT, due_date TEXT, status TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)";
  sqlite.exec(createTable);
  dbInstance = drizzle(sqlite, { schema });
  return dbInstance;
}

export const db = getDb();
export { schema };