"use client";

import { useState, useCallback } from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Input } from "@/components/merenza/Input";
import { Button } from "@/components/merenza/Button";
import { cn } from "@/lib/utils";

export interface FilterValues {
  q: string;
  priority: string;
  category: string;
  status: string;
}

export interface FilterBarProps {
  onFilterChange: (filters: FilterValues) => void;
  hasResults?: boolean;
  className?: string;
}

const DEFAULT_FILTERS: FilterValues = {
  q: "",
  priority: "",
  category: "",
  status: "",
};

export function FilterBar({ onFilterChange, hasResults = true, className }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const updateFilters = useCallback(
    (patch: Partial<FilterValues>) => {
      const next = { ...filters, ...patch };
      setFilters(next);
      onFilterChange(next);
    },
    [filters, onFilterChange]
  );

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <Input
            id="filter-search"
            label="Rechercher"
            type="search"
            placeholder="Rechercher par titre ou description..."
            value={filters.q}
            onChange={(e) => updateFilters({ q: e.target.value })}
            icon={Search}
          />
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-priority" className="text-sm font-medium text-mrz-text">
            Priorité
          </label>
          <select
            id="filter-priority"
            value={filters.priority}
            onChange={(e) => updateFilters({ priority: e.target.value })}
            className="rounded-mrz-md border border-mrz-border bg-mrz-surface px-3 py-2 text-mrz-text focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2"
          >
            <option value="">Toutes</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-status" className="text-sm font-medium text-mrz-text">
            Statut
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="rounded-mrz-md border border-mrz-border bg-mrz-surface px-3 py-2 text-mrz-text focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2"
          >
            <option value="">Tous</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex-1 min-w-[150px]">
          <Input
            id="filter-category"
            label="Catégorie"
            placeholder="Ex: Frontend"
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
          />
        </div>

        {/* Reset */}
        <Button variant="secondary" size="md" onClick={handleReset} className="flex items-center gap-2">
          <RotateCcw className="size-4" />
          Réinitialiser
        </Button>
      </div>

      {!hasResults && (
        <div className="flex items-center gap-2 text-sm text-mrz-text-muted border border-mrz-border rounded-mrz-md p-3">
          <Filter className="size-4 shrink-0" />
          <span role="status">Aucune tâche ne correspond à vos filtres.</span>
        </div>
      )}
    </div>
  );
}