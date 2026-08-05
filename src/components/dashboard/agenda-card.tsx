"use client";

import React from "react";
import { Event, Category } from "@/types";
import { Clock, MapPin, Tag, CheckCircle } from "lucide-react";

interface AgendaCardProps {
  eventsToday: Event[];
  categories: Category[];
}

function getCategoryDetails(categories: Category[], catId: string) {
  const matched = categories.find((c) => c.id === catId);
  return matched || { name: "Tanpa Kategori", color: "bg-slate-500" };
}

function formatShortTime(dateVal: any) {
  if (!dateVal) return "";
  const date = new Date(dateVal.seconds ? dateVal.seconds * 1000 : dateVal);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";
}

export default function AgendaCard({ eventsToday, categories }: AgendaCardProps) {
  return (
    <div className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4 text-left flex-1 h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-primary-500" />
          <span>Agenda Hari Ini</span>
        </h3>
        <span className="text-[10px] font-bold bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 px-2 py-0.5 rounded-md">
          Hari Ini
        </span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {eventsToday.map((evt) => {
          const cat = getCategoryDetails(categories, evt.categoryId);
          return (
            <div
              key={evt.id}
              className="p-3 bg-slate-50/50 dark:bg-slate-900/35 border border-border/50 rounded-xl hover:border-primary-500/30 transition-all text-xs space-y-1.5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-bold text-foreground leading-snug">{evt.title}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black text-white shrink-0 ${cat.color}`}>
                  {cat.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-semibold">
                {evt.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground/60" />
                    <span className="truncate max-w-[120px]">{evt.location}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground/60" />
                  <span>Sepanjang Hari</span>
                </span>
              </div>
            </div>
          );
        })}

        {eventsToday.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <CheckCircle className="h-8 w-8 text-emerald-500/80" />
            <div>
              <p className="text-xs font-bold text-foreground">Semua Beres!</p>
              <p className="text-[10px] text-muted-foreground">Tidak ada agenda terjadwal untuk hari ini.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
