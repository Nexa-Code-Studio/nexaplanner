"use client";

import React from "react";
import { Event, Category } from "@/types";
import { CalendarDays, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";

interface UpcomingCardProps {
  events: Event[];
  categories: Category[];
}

function getCategoryDetails(categories: Category[], catId: string) {
  const matched = categories.find((c) => c.id === catId);
  return matched || { name: "Tanpa Kategori", color: "bg-slate-500" };
}

function calculateRemaining(startDateVal: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDateVal.seconds ? startDateVal.seconds * 1000 : startDateVal);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = start.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Selesai";
  if (diffDays === 0) return "Hari Ini";
  if (diffDays === 1) return "Besok";
  return `H-${diffDays}`;
}

export default function UpcomingCard({ events, categories }: UpcomingCardProps) {
  // Filter for events starting from today onwards
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  sevenDaysLater.setHours(23, 59, 59, 999);

  const upcomingEvents = events
    .filter((evt) => {
      const start = new Date((evt.startDate as any).seconds ? (evt.startDate as any).seconds * 1000 : (evt.startDate as any));
      return start >= today && start <= sevenDaysLater;
    })
    .sort((a, b) => {
      const getMs = (val: any) => new Date(val.seconds ? val.seconds * 1000 : val).getTime();
      return getMs(a.startDate) - getMs(b.startDate);
    })
    .slice(0, 10);

  return (
    <div className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4 text-left flex-1 h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <CalendarDays className="h-4.5 w-4.5 text-primary-500" />
          <span>Agenda 7 Hari Ke Depan</span>
        </h3>
        <Link 
          href="/calendar"
          className="text-[10px] font-bold text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {upcomingEvents.map((evt) => {
          const cat = getCategoryDetails(categories, evt.categoryId);
          const remaining = calculateRemaining(evt.startDate);
          
          let remainingBadgeColor = "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400";
          if (remaining === "Hari Ini") {
            remainingBadgeColor = "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";
          } else if (remaining === "Besok") {
            remainingBadgeColor = "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
          } else if (remaining.startsWith("H-")) {
            remainingBadgeColor = "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
          }

          return (
            <div
              key={evt.id}
              className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/35 border border-border/50 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-foreground block">{evt.title}</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold text-white ${cat.color}`}>
                  {cat.name}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg font-black shrink-0 text-[10px] uppercase tracking-wider ${remainingBadgeColor}`}>
                {remaining}
              </span>
            </div>
          );
        })}

        {upcomingEvents.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-10">
            Tidak ada agenda mendatang.
          </p>
        )}
      </div>
    </div>
  );
}
