"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Modal Merenza — dialogue avec overlay, role=dialog, aria-modal=true.
 * Fermeture via bouton X, Escape, ou clic sur l'overlay.
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      data-testid="modal-overlay"
    >
      {/* Overlay cliquable (bouton invisible pour fermer) */}
      <button
        onClick={onClose}
        aria-label="Fermer en cliquant à l'extérieur"
        className="absolute inset-0 h-full w-full cursor-default"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full max-w-lg rounded-[var(--mrz-radius-lg)] border bg-[var(--mrz-surface)] p-6",
          "border-[var(--mrz-border)]",
          className,
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--mrz-text)" }}
            >
              {title}
            </h2>
          </div>
        )}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded p-1 transition-colors hover:bg-[var(--mrz-border)]"
          style={{ color: "var(--mrz-text-muted)" }}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}