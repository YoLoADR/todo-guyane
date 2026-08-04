"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Dialog } from "@/components/merenza/Dialog";
import { Button } from "@/components/merenza/Button";

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  taskId: number;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  taskId,
  onClose,
  onDeleted,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Échec de la suppression de la tâche");
        return;
      }

      onDeleted();
      onClose();
    } catch {
      setError("Échec de la suppression de la tâche");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Confirmer la suppression">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Trash2 className="size-6 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-mrz-text">
            Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est définitive.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}