"use client";

import React from "react";
import { Category, UserProfile } from "@/types";
import { 
  X, 
  CalendarDays, 
  MapPin, 
  User, 
  Clock, 
  Tag, 
  Edit, 
  Trash2, 
  FileText 
} from "lucide-react";

interface EventDetailDialogProps {
  event: any; // FullCalendar event or Firestore event
  categories: Category[];
  members: UserProfile[];
  isAdmin: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Helpers
function formatFirebaseDate(dateVal: any) {
  if (!dateVal) return "-";
  const date = new Date(dateVal.seconds ? dateVal.seconds * 1000 : dateVal);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function calculateDuration(startVal: any, endVal: any) {
  if (!startVal || !endVal) return "-";
  const start = new Date(startVal.seconds ? startVal.seconds * 1000 : startVal);
  const end = new Date(endVal.seconds ? endVal.seconds * 1000 : endVal);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return `${diffDays} Hari`;
}

export default function EventDetailDialog({
  event,
  categories,
  members,
  isAdmin,
  onClose,
  onEdit,
  onDelete,
}: EventDetailDialogProps) {
  if (!event) return null;

  // Resolve category
  const cat = categories.find((c) => c.id === event.categoryId);
  const categoryName = cat ? cat.name : "Tanpa Kategori";
  const categoryColor = cat ? cat.color : "bg-slate-500";

  // Resolve creator
  const creator = members.find((m) => m.uid === event.createdBy);
  const creatorName = creator ? creator.name : "Anggota Planner";

  // Predefined Category badge styles
  const PREDEFINED_BADGES: Record<string, string> = {
    "bg-blue-500": "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
    "bg-emerald-500": "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
    "bg-purple-500": "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
    "bg-amber-500": "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
    "bg-red-500": "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20",
    "bg-yellow-500": "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-100 dark:border-yellow-500/20",
    "bg-slate-500": "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20",
  };

  const getBadgeColor = (colorBg: string) => {
    return PREDEFINED_BADGES[colorBg] || "text-slate-600 bg-slate-50 dark:bg-slate-500/10 border-slate-100";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground text-base">Detail Event</h3>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-left">
          
          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-foreground">{event.title}</h2>
          </div>

          <div className="space-y-3.5 text-xs font-semibold text-muted-foreground">
            
            {/* Category */}
            <div className="flex items-center gap-3">
              <Tag className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0" />
              <span className={`inline-flex items-center px-2.5 py-0.5 border rounded-md text-[10px] font-bold ${getBadgeColor(categoryColor)}`}>
                {categoryName}
              </span>
            </div>

            {/* Date Time */}
            <div className="flex items-start gap-3">
              <CalendarDays className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0 mt-0.5" />
              <div className="flex flex-col space-y-0.5 text-foreground">
                <span>{formatFirebaseDate(event.startDate)}</span>
                <span className="text-[10px] text-muted-foreground font-medium">s/d {formatFirebaseDate(event.endDate)}</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-3">
              <Clock className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0" />
              <span className="text-foreground">{calculateDuration(event.startDate, event.endDate)}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0" />
              <span className="text-foreground">{event.location || "-"}</span>
            </div>

            {/* Created By */}
            <div className="flex items-center gap-3">
              <User className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0" />
              <span className="text-foreground">Dibuat oleh: {creatorName}</span>
            </div>

            {/* Description */}
            {event.description && (
              <div className="flex items-start gap-3 pt-3 border-t border-border/40">
                <FileText className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                <div className="text-foreground font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-border/40 w-full text-xs">
                  {event.description}
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 border border-border rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={onEdit}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={onDelete}
                  className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
