"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/types";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

interface EventFormProps {
  initialData?: {
    title: string;
    categoryId: string;
    description: string;
    startDate: any;
    endDate: any;
    location: string;
    color: string;
  };
  categories: Category[];
  onSubmit: (data: {
    title: string;
    categoryId: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    color: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Helper to format Date/Timestamp to YYYY-MM-DD
function formatToYMD(value: any): string {
  if (!value) return "";
  const date = new Date(value.seconds ? value.seconds * 1000 : value);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function EventForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EventFormProps) {
  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [color, setColor] = useState("bg-blue-500");
  const [error, setError] = useState<string | null>(null);

  // Populate data on edit mode
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCategoryId(initialData.categoryId || "");
      setDescription(initialData.description || "");
      setStartDate(formatToYMD(initialData.startDate));
      setEndDate(formatToYMD(initialData.endDate));
      setLocation(initialData.location || "");
      setColor(initialData.color || "bg-blue-500");
    } else {
      // Defaults for creation mode
      setTitle("");
      setCategoryId(categories.length > 0 ? categories[0].id : "");
      setDescription("");
      const today = formatToYMD(new Date());
      setStartDate(today);
      setEndDate(today);
      setLocation("");
      setColor("bg-blue-500");
    }
  }, [initialData, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!title.trim()) {
      setError("Judul event wajib diisi");
      return;
    }
    if (title.trim().length < 3) {
      setError("Judul event minimal 3 karakter");
      return;
    }
    if (!categoryId) {
      setError("Kategori harus dipilih");
      return;
    }
    if (!startDate) {
      setError("Tanggal mulai wajib diisi");
      return;
    }
    if (!endDate) {
      setError("Tanggal selesai wajib diisi");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      setError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai");
      return;
    }

    const selectedCat = categories.find(c => c.id === categoryId);
    const resolvedColor = selectedCat ? selectedCat.color : "bg-blue-500";

    try {
      await onSubmit({
        title: title.trim(),
        categoryId,
        description: description.trim(),
        startDate,
        endDate,
        location: location.trim(),
        color: resolvedColor,
      });
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan event");
    }
  };

  const EVENT_COLORS = [
    { name: "Blue", bg: "bg-blue-500" },
    { name: "Emerald", bg: "bg-emerald-500" },
    { name: "Purple", bg: "bg-purple-500" },
    { name: "Amber", bg: "bg-amber-500" },
    { name: "Red", bg: "bg-red-500" },
    { name: "Yellow", bg: "bg-yellow-500" },
    { name: "Slate", bg: "bg-slate-500" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground">Judul Event *</label>
        <input
          type="text"
          placeholder="Misal: Sprint Planning, Rilis Fitur Baru"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-medium"
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Grid: Category & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">Kategori *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl outline-none focus:border-primary-500 transition-all cursor-pointer text-foreground font-medium"
            required
            disabled={isSubmitting}
          >
            <option value="" disabled>Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">Lokasi</label>
          <input
            type="text"
            placeholder="Misal: Google Meet, Ruang Meeting Utama"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Grid: Start Date & End Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">Tanggal Mulai *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-medium cursor-pointer"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">Tanggal Selesai *</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-medium cursor-pointer"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground">Deskripsi Event</label>
        <textarea
          placeholder="Rincian agenda atau keterangan tambahan mengenai event ini..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground min-h-[90px]"
          disabled={isSubmitting}
        />
      </div>



      {/* Actions Footer */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 border border-border rounded-xl transition-colors cursor-pointer"
          disabled={isSubmitting}
        >
          Batal
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          <span>{isSubmitting ? "Menyimpan..." : "Simpan Event"}</span>
        </button>
      </div>
    </form>
  );
}
