"use client";

import React from "react";
import { Category } from "@/types";
import { Filter } from "lucide-react";

interface CalendarLegendProps {
  categories: Category[];
  activeCategoryIds: string[];
  onToggleCategory: (id: string) => void;
}

export default function CalendarLegend({
  categories,
  activeCategoryIds,
  onToggleCategory,
}: CalendarLegendProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 font-bold text-foreground text-xs uppercase tracking-wider border-b border-border pb-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span>Filter Kategori</span>
      </div>
      <div className="space-y-2.5">
        {categories.map((cat) => {
          const isActive = activeCategoryIds.includes(cat.id);
          return (
            <label
              key={cat.id}
              className="flex items-center gap-3 cursor-pointer select-none group text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => onToggleCategory(cat.id)}
                className="rounded border-border text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
              />
              <span className={`h-2.5 w-2.5 rounded-full ${cat.color} shrink-0`} />
              <span className={isActive ? "text-foreground font-semibold" : "line-through text-muted-foreground/60"}>
                {cat.name}
              </span>
            </label>
          );
        })}
        {categories.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Belum ada kategori</p>
        )}
      </div>
    </div>
  );
}
