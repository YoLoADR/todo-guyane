import { z } from "zod";

export const Priority = z.enum(["low", "medium", "high"]);
export const Status = z.enum(["todo", "in_progress", "done"]);

export type Priority = z.infer<typeof Priority>;
export type Status = z.infer<typeof Status>;

export function formatZodErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));
}

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: Priority,
  category: z.string().max(50).optional(),
  dueDate: z.string().datetime().optional().refine(
    (value) => {
      if (!value) return true;
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date.getTime() >= today.getTime();
    },
    { message: "La date d'échéance ne peut pas être dans le passé" }
  ),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: Status.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
