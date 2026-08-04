import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./Button";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-mrz-md border border-mrz-border bg-mrz-surface p-6 shadow-lg",
          "max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="dialog-title" className="text-lg font-semibold text-mrz-text">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
