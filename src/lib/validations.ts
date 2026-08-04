import { z } from "zod";

/**
 * Schéma de validation pour la création d'une tâche (SPEC §3 + issue #21).
 * priority: 4 valeurs (low, medium, high, urgent), défaut "medium" (R2).
 * status: 4 valeurs (backlog, todo, in_progress, done), défaut "todo" (R3).
 * dueDate: ISO 8601 datetime, ne peut pas être dans le passé (R10).
 */
export const createTaskSchema = z
  .object({
    title: z.string().min(1, "Le titre est obligatoire").max(200, "Le titre doit faire moins de 200 caractères"),
    description: z.string().max(2000).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    category: z.string().max(50).optional(),
    dueDate: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (!data.dueDate) return true;
      const due = new Date(data.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due >= today;
    },
    { message: "La date d'échéance ne peut pas être dans le passé", path: ["dueDate"] },
  );

/**
 * Schéma de validation pour la modification partielle d'une tâche.
 * Tous les champs sont optionnels (PATCH partial update).
 */
export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    category: z.string().max(50).optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(["backlog", "todo", "in_progress", "done"]).optional(),
  })
  .refine(
    (data) => {
      if (!data.dueDate) return true;
      const due = new Date(data.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due >= today;
    },
    { message: "La date d'échéance ne peut pas être dans le passé", path: ["dueDate"] },
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;