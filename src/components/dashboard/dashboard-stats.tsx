"use client";

import React from "react";
import { 
  CalendarDays, 
  Tag, 
  Users, 
  Sparkles 
} from "lucide-react";

interface DashboardStatsProps {
  totalEvents: number;
  totalCategories: number;
  totalMembers: number;
  eventsThisMonth: number;
  activeCategoriesThisMonth: number;
}

export default function DashboardStats({
  totalEvents,
  totalCategories,
  totalMembers,
  eventsThisMonth,
  activeCategoriesThisMonth,
}: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Event",
      value: totalEvents,
      icon: <CalendarDays className="h-5 w-5 text-blue-500" />,
      bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
    },
    {
      title: "Total Kategori",
      value: totalCategories,
      icon: <Tag className="h-5 w-5 text-emerald-500" />,
      bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
    },
    {
      title: "Kategori Aktif",
      value: activeCategoriesThisMonth,
      icon: <Sparkles className="h-5 w-5 text-cyan-500" />,
      bg: "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20",
    },
    {
      title: "Anggota Tim",
      value: totalMembers,
      icon: <Users className="h-5 w-5 text-purple-500" />,
      bg: "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
    },
    {
      title: "Event Bulan Ini",
      value: eventsThisMonth,
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
      {statCards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              {card.title}
            </span>
            <span className="text-2xl font-black text-foreground block">
              {card.value}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${card.bg} shrink-0`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
