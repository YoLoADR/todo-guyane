"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/merenza/Dialog";
import { Button } from "@/components/merenza/Button";
import { Input } from "@/components/merenza/Input";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validations";

export interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskInput) => void | Promise<void>;
  initialData?: Partial<CreateTaskInput>;
  mode?: "create" | "edit";
  taskId?: number;
}

export function TaskFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
  taskId,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    initialData?.priority ?? "medium"
  );
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate?.split("T")[0] ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const parsed = createTaskSchema.safeParse({
      title,
      description: description || undefined,
      priority,
      category: category || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    if (!parsed.success) {
      const newErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description: description || undefined,
        priority,
        category: category || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      // Re-valider pour obtenir les données parsées
      const parsed = createTaskSchema.safeParse(payload);
      if (!parsed.success) {
        const newErrors: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          newErrors[field] = issue.message;
        });
        setErrors(newErrors);
        return;
      }

      const isEdit = mode === "edit" && taskId !== undefined;
      const url = isEdit ? `/api/tasks/${taskId}` : "/api/tasks";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          const newErrors: Record<string, string> = {};
          data.errors.forEach((err: { path: string[]; message: string }) => {
            newErrors[err.path[0]] = err.message;
          });
          setErrors(newErrors);
        }
        return;
      }

      await onSubmit(parsed.data);
      onClose();
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel} title={mode === "create" ? "Nouvelle tâche" : "Modifier la tâche"}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="task-title"
          label="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="Ex: Corriger le bug de login"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-description" className="text-sm font-medium text-mrz-text">
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={cn(
              "w-full rounded-mrz-md border border-mrz-border bg-mrz-surface px-3 py-2 text-mrz-text placeholder:text-mrz-text-muted",
              "focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2",
              errors.description && "border-red-500"
            )}
            placeholder="Description optionnelle"
            rows={3}
          />
          {errors.description && (
            <p role="alert" className="text-sm text-red-500">
              {errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-priority" className="text-sm font-medium text-mrz-text mb-1 block">
              Priorité
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="w-full rounded-mrz-md border border-mrz-border bg-mrz-surface px-3 py-2 text-mrz-text focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
            {errors.priority && (
              <p role="alert" className="text-sm text-red-500 mt-1">
                {errors.priority}
              </p>
            )}
          </div>

          <Input
            id="task-category"
            label="Catégorie"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={errors.category}
            placeholder="Ex: Frontend"
          />
        </div>

        <Input
          id="task-due-date"
          label="Date d'échéance"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={errors.dueDate}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
