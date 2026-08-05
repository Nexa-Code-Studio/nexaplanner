"use client";

import React from "react";
import { Category, Event } from "@/types";
import CalendarLegend from "./calendar-legend";
import { CalendarDays, Clock, Tag } from "lucide-react";

interface CalendarSidebarProps {
  categories: Category[];
  activeCategoryIds: string[];
  onToggleCategory: (id: string) => void;
  events: Event[];
}

// Helpers
function getCategoryDetails(categories: Category[], catId: string) {
  const matched = categories.find((c) => c.id === catId);
  return matched || { name: "Tanpa Kategori", color: "bg-slate-500" };
}

export default function CalendarSidebar({
  categories,
  activeCategoryIds,
  onToggleCategory,
  events,
}: CalendarSidebarProps) {
  // Filter for upcoming events (start date is after today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((evt) => {
      const start = new Date((evt.startDate as any).seconds ? (evt.startDate as any).seconds * 1000 : (evt.startDate as any));
      return start >= today;
    })
    .sort((a, b) => {
      const getMs = (val: any) => new Date(val.seconds ? val.seconds * 1000 : val).getTime();
      return getMs(a.startDate) - getMs(b.startDate);
    })
    .slice(0, 4); // Limit to top 4

  const formatShortDate = (dateVal: any) => {
    if (!dateVal) return "-";
    const date = new Date(dateVal.seconds ? dateVal.seconds * 1000 : dateVal);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="w-full lg:w-64 shrink-0 space-y-6">
      
      {/* Category filters */}
      <div className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs">
        <CalendarLegend
          categories={categories}
          activeCategoryIds={activeCategoryIds}
          onToggleCategory={onToggleCategory}
        />
      </div>

      {/* Upcoming events preview list */}
      <div className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-2 font-bold text-foreground text-xs uppercase tracking-wider border-b border-border pb-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>Agenda Mendatang</span>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((evt) => {
            const cat = getCategoryDetails(categories, evt.categoryId);
            return (
              <div
                key={evt.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-border/50 hover:border-primary-500/30 transition-all text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground truncate block max-w-[130px]" title={evt.title}>
                    {evt.title}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold text-white shrink-0 ${cat.color}`}>
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{formatShortDate(evt.startDate)}</span>
                  {evt.location && (
                    <span className="truncate max-w-[100px] border-l border-border/70 pl-1.5">
                      {evt.location}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {upcomingEvents.length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-2">
              Tidak ada agenda terdekat
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
