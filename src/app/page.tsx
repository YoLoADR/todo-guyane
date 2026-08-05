"use client";

import { useState } from "react";
import { Board } from "@/components/kanban/Board";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { PageHeader } from "@/components/merenza/PageHeader";
import { Button } from "@/components/merenza/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Plus } from "lucide-react";
import { useTasks } from "@/components/kanban/useTasks";

/**
 * Page d'accueil — Kanban board avec bouton "Nouvelle tâche".
 */
export default function Home() {
  const { tasks, loading, error, refresh } = useTasks();
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-6">
      <PageHeader
        title="Todo App"
        subtitle="Benchmark Guyane"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} /> Nouvelle tâche
            </Button>
            <ThemeToggle />
          </div>
        }
      />
      <div className="mt-6">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-[var(--mrz-radius-md)] border border-red-500 bg-red-500/10 p-3 text-sm text-red-500"
          >
            {error}
          </div>
        )}
        <Board tasks={tasks} loading={loading} onRefresh={refresh} />
      </div>
      <TaskFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={refresh}
      />
    </main>
  );
}