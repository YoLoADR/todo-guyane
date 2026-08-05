"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/merenza/Modal";
import { Input } from "@/components/merenza/Input";
import { Select, type SelectOption } from "@/components/merenza/Select";
import { Button } from "@/components/merenza/Button";
import { createTaskSchema } from "@/lib/validations";

export interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

/**
 * TaskFormDialog — formulaire de création de tâche dans un Modal Merenza.
 * Champs: title, description, priority, category, dueDate.
 * Validation côté client via Zod + appel POST /api/tasks.
 */
export function TaskFormDialog({ open, onClose, onSaved }: TaskFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("");
    setDueDate("");
    setErrors({});
    setServerError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    // Validation côté client
    const data = {
      title,
      description: description || undefined,
      priority,
      category: category || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    };

    const result = createTaskSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors: Record<string, string> = {};
          for (const err of data.errors) {
            fieldErrors[err.field] = err.message;
          }
          setErrors(fieldErrors);
        } else {
          setServerError(data.error ?? "Erreur lors de la création");
        }
        return;
      }

      resetForm();
      onSaved?.();
      onClose();
    } catch {
      setServerError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nouvelle tâche">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Titre"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="Titre de la tâche"
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium"
            style={{ color: "var(--mrz-text)" }}
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-[var(--mrz-radius-md)] border border-[var(--mrz-border)] bg-[var(--mrz-surface)] px-3 py-2 text-base focus:outline-2 focus:outline-offset-2 focus:outline-[#E8B04B]"
            style={{ color: "var(--mrz-text)" }}
            placeholder="Description optionnelle"
          />
          {errors.description && (
            <p role="alert" className="text-sm text-red-500">
              {errors.description}
            </p>
          )}
        </div>

        <Select
          label="Priorité"
          id="priority"
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          error={errors.priority}
        />

        <Input
          label="Catégorie"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          error={errors.category}
          placeholder="Ex: Frontend, Backend..."
        />

        <Input
          label="Date d'échéance"
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={errors.dueDate}
        />

        {serverError && (
          <p role="alert" className="text-sm text-red-500">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}