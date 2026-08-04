import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dbPath = process.env.DATABASE_URL || "./data/todo.sqlite";
const resolvedDir = path.dirname(path.resolve(process.cwd(), dbPath));
if (!fs.existsSync(resolvedDir)) {
  fs.mkdirSync(resolvedDir, { recursive: true });
}

export const sqlite = new Database(path.resolve(process.cwd(), dbPath));
export const db = drizzle(sqlite);
