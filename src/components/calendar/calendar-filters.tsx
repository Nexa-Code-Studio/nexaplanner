"use client";

import React from "react";
import { Search } from "lucide-react";

interface CalendarFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "upcoming" | "ongoing" | "finished";
  onStatusFilterChange: (value: "all" | "upcoming" | "ongoing" | "finished") => void;
}

export default function CalendarFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: CalendarFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-card border border-border p-4 rounded-2xl shadow-xs">
      {/* Search Input */}
      <div className="relative w-full sm:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari event berdasarkan judul, lokasi, rincian..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl outline-none focus:border-primary-500 transition-all text-foreground font-medium"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto overflow-x-auto shrink-0">
        {(["all", "upcoming", "ongoing", "finished"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onStatusFilterChange(tab)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === tab
                ? "bg-white dark:bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "all" ? "Semua Status" : tab}
          </button>
        ))}
      </div>
    </div>
  );
}
