"use client";

import React, { useMemo, useState } from "react";
import { Event, Category, UserProfile } from "@/types";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, X } from "lucide-react";
import EventDetailDialog from "@/components/calendar/event-detail-dialog";

interface MiniCalendarProps {
  events: Event[];
  categories: Category[];
  members: UserProfile[];
  isAdmin: boolean;
}

export default function MiniCalendar({ events, categories, members, isAdmin }: MiniCalendarProps) {
  const router = useRouter();
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[] | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const monthName = today.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const cells = useMemo(() => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = endOfMonth.getDate();
    // Normalize Monday to index 0, Sunday to index 6
    const startDayOfWeek = (startOfMonth.getDay() - 1 + 7) % 7;

    const calendarCells: { day: number | null; hasEvent: boolean; isToday: boolean }[] = [];

    // Previous month paddings
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarCells.push({ day: null, hasEvent: false, isToday: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const checkDate = new Date(year, month, d);
      checkDate.setHours(0, 0, 0, 0);

      // Check if any event overlaps with this day
      const hasEvent = events.some((evt) => {
        const start = new Date((evt.startDate as any).seconds ? (evt.startDate as any).seconds * 1000 : (evt.startDate as any));
        start.setHours(0, 0, 0, 0);
        const end = new Date((evt.endDate as any).seconds ? (evt.endDate as any).seconds * 1000 : (evt.endDate as any));
        end.setHours(23, 59, 59, 999);
        return checkDate >= start && checkDate <= end;
      });

      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

      calendarCells.push({ day: d, hasEvent, isToday });
    }

    return calendarCells;
  }, [events, year, month]);

  const weekdays = ["S", "S", "R", "K", "J", "S", "M"];

  const handleDateClick = (cell: { day: number | null; hasEvent: boolean; isToday: boolean }) => {
    if (!cell.day) return;
    
    const clickedDate = new Date(year, month, cell.day);
    const dateString = clickedDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    
    const dayEvents = events.filter((evt) => {
      const start = new Date((evt.startDate as any).seconds ? (evt.startDate as any).seconds * 1000 : (evt.startDate as any));
      start.setHours(0, 0, 0, 0);
      const end = new Date((evt.endDate as any).seconds ? (evt.endDate as any).seconds * 1000 : (evt.endDate as any));
      end.setHours(23, 59, 59, 999);
      return clickedDate >= start && clickedDate <= end;
    });

    setSelectedDateStr(dateString);
    setSelectedDayEvents(dayEvents);
  };

  return (
    <div className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4 text-left h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-primary-500" />
          <span>Kalender Mini</span>
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground capitalize">
          {monthName}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Weekday labels */}
        <div className="grid grid-cols-7 text-center text-[10px] font-black text-muted-foreground mb-2">
          {weekdays.map((wd, i) => (
            <div key={i}>{wd}</div>
          ))}
        </div>

        {/* Calendar Grid cells */}
        <div className="grid grid-cols-7 gap-y-1.5 text-xs font-semibold">
          {cells.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => handleDateClick(cell)}
              className={`h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all select-none cursor-pointer ${
                cell.day ? "hover:bg-slate-100 dark:hover:bg-slate-800" : ""
              } ${
                cell.isToday
                  ? "bg-primary-500 text-white hover:bg-primary-600 shadow-xs"
                  : "text-foreground"
              }`}
            >
              {cell.day}
              {cell.hasEvent && cell.day && (
                <span className={`absolute bottom-1 h-1 w-1 rounded-full ${cell.isToday ? "bg-white" : "bg-primary-500"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => router.push("/calendar")}
        className="w-full text-center text-[10px] font-bold py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-border/60 rounded-xl text-primary-500 hover:text-primary-600 inline-flex items-center justify-center gap-1 cursor-pointer transition-colors mt-2"
      >
        <span>Lihat Rincian Kalender</span>
        <ChevronRight className="h-3 w-3" />
      </button>

      {/* Daily Events Popup Modal */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="space-y-0.5">
                <h4 className="font-bold text-foreground text-sm">Agenda Harian</h4>
                <p className="text-[10px] text-muted-foreground font-bold">{selectedDateStr}</p>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {selectedDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-border/50 rounded-xl space-y-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-foreground text-xs block">{evt.title}</span>
                  {evt.location && (
                    <span className="text-[9px] text-muted-foreground block">📍 {evt.location}</span>
                  )}
                </div>
              ))}
              
              {selectedDayEvents.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-6">
                  Tidak ada agenda untuk hari ini.
                </p>
              )}
            </div>
            
            <button
              onClick={() => setSelectedDayEvents(null)}
              className="w-full text-center text-xs font-semibold py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Main Event Detail Modal Sync */}
      {selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          categories={categories}
          members={members}
          isAdmin={false} // Read-only preview from dashboard
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}
    </div>
  );
}
