"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Task } from "@/lib/db/schema";

/**
 * useTasks — hook pour fetch et refresh de la liste des tâches.
 * Retourne tasks, loading, error, et une fonction refresh().
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    void refresh();
  }, [refresh]);

  return { tasks, loading, error, refresh };
}