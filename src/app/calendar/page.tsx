"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from "lucide-react";

export default function CalendarPage() {
  const [categories, setCategories] = useState([
    { name: "Kompetisi", color: "bg-red-500", active: true },
    { name: "Project Client", color: "bg-blue-500", active: true },
    { name: "Meeting", color: "bg-amber-500", active: true },
    { name: "Seminar", color: "bg-purple-500", active: true },
    { name: "Workshop", color: "bg-emerald-500", active: true },
    { name: "Internal", color: "bg-pink-500", active: true },
  ]);

  const toggleCategory = (index: number) => {
    const updated = [...categories];
    updated[index].active = !updated[index].active;
    setCategories(updated);
  };

  // Mock Calendar Dates for August 2026
  // August 1, 2026 is Saturday. So 5 empty cells for preceding days.
  const daysInMonth = 31;
  const startDayOffset = 5; // Mon Tue Wed Thu Fri are empty
  const calendarCells = [];

  // Previous month dates placeholders
  for (let i = 27; i <= 31; i++) {
    calendarCells.push({ day: i, isCurrentMonth: false, events: [] });
  }

  // Current month dates
  const mockEvents: Record<number, { title: string; color: string; category: string }[]> = {
    5: [{ title: "Submission KTI TFS", color: "bg-red-500", category: "Kompetisi" }],
    10: [
      { title: "Kickoff Project NexaCode", color: "bg-blue-500", category: "Project Client" },
      { title: "Meeting Evaluasi", color: "bg-amber-500", category: "Meeting" }
    ],
    18: [{ title: "Pengumuman Lolos Abstrak", color: "bg-red-500", category: "Kompetisi" }],
    24: [{ title: "Workshop Next.js 15", color: "bg-emerald-500", category: "Workshop" }],
    28: [{ title: "Internal Gathering", color: "bg-pink-500", category: "Internal" }],
  };

  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      events: mockEvents[i] || [],
    });
  }

  // Next month dates placeholders
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({ day: i, isCurrentMonth: false, events: [] });
  }

  const weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <DashboardLayout>
      <PageHeader
        title="Kalender"
        breadcrumbs={[{ name: "Kalender" }]}
        action={
          <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Tambah Event</span>
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 bg-white dark:bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
          <div className="flex items-center gap-2 font-bold text-foreground text-sm uppercase tracking-wider mb-4 border-b border-border pb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span>Filter Kategori</span>
          </div>
          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <label 
                key={cat.name} 
                className="flex items-center gap-3 cursor-pointer select-none group text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={cat.active}
                  onChange={() => toggleCategory(idx)}
                  className="rounded border-border text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                />
                <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                <span className={cat.active ? "text-foreground font-medium" : "line-through text-muted-foreground/60"}>
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Calendar Header Control */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary-500" />
              <span className="font-bold text-lg text-foreground">Agustus 2026</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-border/50">
              <button className="p-1.5 hover:bg-white dark:hover:bg-card rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="px-3 py-1 text-xs font-semibold hover:bg-white dark:hover:bg-card rounded-lg transition-colors cursor-pointer text-foreground">
                Hari Ini
              </button>
              <button className="p-1.5 hover:bg-white dark:hover:bg-card rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-7 border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-center text-xs font-semibold py-3 text-muted-foreground">
            {weekdays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-[500px] bg-slate-100/30 dark:bg-slate-950/20 gap-[1px]">
            {calendarCells.map((cell, index) => (
              <div
                key={index}
                className={`min-h-[85px] bg-white dark:bg-card p-2 flex flex-col group relative ${
                  cell.isCurrentMonth ? "" : "bg-slate-50/30 dark:bg-slate-900/20 text-muted-foreground/45"
                }`}
              >
                <span
                  className={`text-xs font-semibold inline-flex items-center justify-center h-5 w-5 rounded-full ${
                    cell.isCurrentMonth && cell.day === 5
                      ? "bg-primary-500 text-white shadow-sm"
                      : "text-foreground"
                  }`}
                >
                  {cell.day}
                </span>

                {/* Render Events */}
                <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin">
                  {cell.events
                    .filter((ev) => {
                      const categoryObj = categories.find((c) => c.name === ev.category);
                      return categoryObj ? categoryObj.active : true;
                    })
                    .map((ev, i) => (
                      <div
                        key={i}
                        className={`text-[9px] font-medium leading-none text-white px-1.5 py-1 rounded-md truncate cursor-pointer shadow-sm/5 hover:opacity-90 ${ev.color}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
