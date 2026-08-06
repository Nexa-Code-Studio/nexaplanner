"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import EventForm from "@/components/event-form";
import CalendarFilters from "@/components/calendar/calendar-filters";
import CalendarSidebar from "@/components/calendar/calendar-sidebar";
import EventDetailDialog from "@/components/calendar/event-detail-dialog";

import { useEvents } from "@/hooks/use-events";
import { useCategories } from "@/hooks/use-categories";
import { useMembers } from "@/hooks/use-members";
import { useAuth } from "@/hooks/use-auth";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import { 
  Plus, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  CalendarDays,
  X
} from "lucide-react";

// Helper to format Date to YYYY-MM-DD
function formatToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "member";

  const {
    events,
    loading: loadingEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  const { categories, loading: loadingCategories } = useCategories();
  const { members } = useMembers();

  const calendarRef = useRef<any>(null);

  // States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "ongoing" | "finished">("all");
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Dialog Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selected date / event data
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [clickStartDate, setClickStartDate] = useState("");
  const [clickEndDate, setClickEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Initialize active categories list when loaded
  useEffect(() => {
    if (categories && categories.length > 0 && activeCategoryIds.length === 0) {
      setActiveCategoryIds(categories.map((c) => c.id));
    }
  }, [categories, activeCategoryIds]);

  // Handle Mobile view resize
  useEffect(() => {
    const handleResize = () => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        if (window.innerWidth < 768) {
          if (calendarApi.view.type !== "listWeek") {
            calendarApi.changeView("listWeek");
          }
        } else {
          if (calendarApi.view.type === "listWeek") {
            calendarApi.changeView("dayGridMonth");
          }
        }
      }
    };
    
    // Slight delay to ensure DOM is ready
    const timer = setTimeout(handleResize, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [events]);

  const handleToggleCategory = (catId: string) => {
    if (activeCategoryIds.includes(catId)) {
      setActiveCategoryIds(activeCategoryIds.filter((id) => id !== catId));
    } else {
      setActiveCategoryIds([...activeCategoryIds, catId]);
    }
  };

  // Status computation helper
  const getEventStatus = useCallback((startVal: any, endVal: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startVal.seconds ? startVal.seconds * 1000 : startVal);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endVal.seconds ? endVal.seconds * 1000 : endVal);
    end.setHours(23, 59, 59, 999);

    if (start > today) return "upcoming";
    if (end < today) return "finished";
    return "ongoing";
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // 1. Search text
      const searchMatch = 
        evt.title.toLowerCase().includes(search.toLowerCase()) ||
        evt.description.toLowerCase().includes(search.toLowerCase()) ||
        (evt.location && evt.location.toLowerCase().includes(search.toLowerCase()));

      // 2. Category Checkbox filter
      const categoryMatch = activeCategoryIds.includes(evt.categoryId);

      // 3. Status tab filter
      const status = getEventStatus(evt.startDate, evt.endDate);
      const statusMatch = statusFilter === "all" || status === statusFilter;

      return searchMatch && categoryMatch && statusMatch;
    });
  }, [events, search, activeCategoryIds, statusFilter, getEventStatus]);

  // Convert to FullCalendar Event Format
  const calendarEvents = useMemo(() => {
    return filteredEvents.map((evt) => {
      const start = new Date((evt.startDate as any).seconds ? (evt.startDate as any).seconds * 1000 : (evt.startDate as any));
      const end = new Date((evt.endDate as any).seconds ? (evt.endDate as any).seconds * 1000 : (evt.endDate as any));
      
      // FullCalendar expects end dates to be exclusive. Since our database has inclusive dates, add 1 day for rendering.
      const fcEnd = new Date(end);
      fcEnd.setDate(fcEnd.getDate() + 1);

      const cat = categories.find((c) => c.id === evt.categoryId);
      const colorBg = cat ? cat.color : "bg-slate-500";

      return {
        id: evt.id,
        title: evt.title,
        start: formatToYMD(start),
        end: formatToYMD(fcEnd),
        allDay: true,
        extendedProps: {
          color: colorBg,
          categoryId: evt.categoryId,
          description: evt.description,
          location: evt.location,
          createdBy: evt.createdBy,
          startDate: evt.startDate,
          endDate: evt.endDate
        }
      };
    });
  }, [filteredEvents, categories]);

  // Date Click (Create Event)
  const handleDateClick = (info: any) => {
    if (!isAdmin) return;
    setClickStartDate(info.dateStr);
    setClickEndDate(info.dateStr);
    setIsAddOpen(true);
  };

  // Event Click (View details)
  const handleEventClick = (info: any) => {
    const matched = events.find((e) => e.id === info.event.id);
    if (matched) {
      setSelectedEvent(matched);
      setIsDetailOpen(true);
    }
  };

  // Drag Event Drop
  const handleEventDrop = async (info: any) => {
    if (!isAdmin) {
      info.revert();
      return;
    }
    const { event } = info;
    const id = event.id;
    const startStr = formatToYMD(event.start);
    
    // Decrement end date by 1 day because FullCalendar returns exclusive end dates.
    const end = event.end ? new Date(event.end) : new Date(event.start);
    if (event.end) {
      end.setDate(end.getDate() - 1);
    }
    const endStr = formatToYMD(end);

    try {
      await updateEvent(id, { startDate: startStr, endDate: endStr });
      showToast(`Event "${event.title}" berhasil dipindahkan!`, "success");
    } catch (err: any) {
      info.revert();
      showToast(err.message || "Gagal memperbarui tanggal event", "error");
    }
  };

  // Resize Event Duration
  const handleEventResize = async (info: any) => {
    if (!isAdmin) {
      info.revert();
      return;
    }
    const { event } = info;
    const id = event.id;
    const startStr = formatToYMD(event.start);

    // Decrement end date by 1 day for database storage.
    const end = event.end ? new Date(event.end) : new Date(event.start);
    if (event.end) {
      end.setDate(end.getDate() - 1);
    }
    const endStr = formatToYMD(end);

    try {
      await updateEvent(id, { startDate: startStr, endDate: endStr });
      showToast(`Durasi event "${event.title}" berhasil diubah!`, "success");
    } catch (err: any) {
      info.revert();
      showToast(err.message || "Gagal memperbarui durasi event", "error");
    }
  };

  // Operations
  const handleCreateSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      await createEvent(formData);
      setIsAddOpen(false);
      showToast(`Event "${formData.title}" berhasil ditambahkan!`, "success");
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (!selectedEvent) return;
    setIsSubmitting(true);
    try {
      await updateEvent(selectedEvent.id, formData);
      setIsEditOpen(false);
      showToast(`Event "${formData.title}" berhasil diperbarui!`, "success");
      // Refresh active selected view event
      const updatedEvent = { ...selectedEvent, ...formData };
      setSelectedEvent(updatedEvent);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedEvent) return;
    setIsSubmitting(true);
    try {
      await deleteEvent(selectedEvent.id);
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      showToast(`Event "${selectedEvent.title}" berhasil dihapus!`, "success");
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Header Open Add Event Handler
  const handleOpenAddHeader = () => {
    if (categories.length === 0) {
      showToast("Harap buat kategori terlebih dahulu sebelum menambahkan event!", "error");
      return;
    }
    setClickStartDate(formatToYMD(new Date()));
    setClickEndDate(formatToYMD(new Date()));
    setIsAddOpen(true);
  };

  // Custom Event Element Rendering
  const renderEventContent = (eventInfo: any) => {
    const colorBg = eventInfo.event.extendedProps.color || "bg-slate-500";
    return (
      <div className={`w-full px-2 py-1.5 rounded-md text-[10px] md:text-xs font-bold text-white truncate shadow-xs ${colorBg} border-0 transition-transform hover:scale-[1.02] cursor-pointer`}>
        {eventInfo.event.title}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Kalender"
        breadcrumbs={[{ name: "Kalender" }]}
        action={
          isAdmin && (
            <button
              onClick={handleOpenAddHeader}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Event</span>
            </button>
          )
        }
      />

      <div className="space-y-6">
        
        {/* Real-time search and status filter bar */}
        <CalendarFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Legend and Upcoming preview Sidebar */}
          <CalendarSidebar
            categories={categories}
            activeCategoryIds={activeCategoryIds}
            onToggleCategory={handleToggleCategory}
            events={events}
          />

          {/* FullCalendar Grid container */}
          <div className="flex-1 w-full bg-white dark:bg-card border border-border rounded-2xl shadow-sm p-4 md:p-6 overflow-hidden relative">
            {loadingEvents || loadingCategories ? (
              <div className="absolute inset-0 z-40 bg-white/60 dark:bg-card/60 backdrop-blur-xs flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  <span className="text-xs font-semibold text-muted-foreground">Memuat kalender...</span>
                </div>
              </div>
            ) : null}

            <div className="fullcalendar-premium-theme">
              <FullCalendar
                ref={calendarRef}
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  listPlugin,
                  interactionPlugin
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,today,next",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
                }}
                locale="id"
                events={calendarEvents}
                editable={isAdmin}
                selectable={isAdmin}
                eventDurationEditable={isAdmin}
                eventStartEditable={isAdmin}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                eventContent={renderEventContent}
                dayMaxEvents={3}
                height="auto"
                aspectRatio={1.35}
              />
            </div>
          </div>
        </div>
      </div>

      {/* View Event Detail Dialog */}
      {isDetailOpen && selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          categories={categories}
          members={members}
          isAdmin={isAdmin}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            setIsEditOpen(true);
          }}
          onDelete={() => {
            setIsDeleteOpen(true);
          }}
        />
      )}

      {/* Add Event Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground text-base">Tambah Event Baru</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[85vh]">
              <EventForm
                initialData={
                  clickStartDate 
                    ? {
                        title: "",
                        categoryId: categories.length > 0 ? categories[0].id : "",
                        description: "",
                        startDate: clickStartDate,
                        endDate: clickEndDate || clickStartDate,
                        location: "",
                        color: "bg-blue-500"
                      }
                    : undefined
                }
                categories={categories}
                onSubmit={handleCreateSubmit}
                onCancel={() => setIsAddOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Dialog Modal */}
      {isEditOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground text-base">Edit Event</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[85vh]">
              <EventForm
                initialData={{
                  title: selectedEvent.title,
                  categoryId: selectedEvent.categoryId,
                  description: selectedEvent.description || "",
                  startDate: selectedEvent.startDate,
                  endDate: selectedEvent.endDate,
                  location: selectedEvent.location || "",
                  color: selectedEvent.color || "bg-blue-500",
                }}
                categories={categories}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {isDeleteOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full animate-bounce">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base mb-1">Hapus Event?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Apakah Anda yakin ingin menghapus rencana event <span className="font-semibold text-foreground">"{selectedEvent.title}"</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 border border-border rounded-xl transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  <span>{isSubmitting ? "Menghapus..." : "Ya, Hapus Event"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification overlay */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in shadow-2xl">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold bg-white ${
            toast.type === "success" 
              ? "border-emerald-200 text-emerald-600 dark:border-emerald-500/20 dark:text-emerald-400 dark:bg-card" 
              : "border-red-200 text-red-600 dark:border-red-500/20 dark:text-red-400 dark:bg-card"
          }`}>
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
