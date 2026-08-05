import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Table `tasks` — modèle de données principal (SPEC §3 + issue #21).
 * 4 statuts: backlog, todo, in_progress, done (Kanban 4 colonnes).
 * 4 priorités: low, medium, high, urgent.
 */
export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority", {
    enum: ["low", "medium", "high", "urgent"],
  }).notNull(),
  category: text("category"),
  dueDate: text("due_date"),
  status: text("status", {
    enum: ["backlog", "todo", "in_progress", "done"],
  }).notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Priority = Task["priority"];
export type Status = Task["status"];