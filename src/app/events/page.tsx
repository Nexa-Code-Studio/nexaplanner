"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import EventForm from "@/components/event-form";
import { useEvents } from "@/hooks/use-events";
import { useCategories } from "@/hooks/use-categories";
import { useMembers } from "@/hooks/use-members";
import { useAuth } from "@/hooks/use-auth";
import { 
  Plus, 
  Search, 
  Filter, 
  CalendarDays, 
  MapPin, 
  User, 
  Edit, 
  Trash2, 
  X, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Tag,
  Loader2,
  Download,
  FileSpreadsheet
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EventsPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "member";

  const {
    events,
    loading: loadingEvents,
    error: errorEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  const { categories, loading: loadingCategories } = useCategories();
  const { members } = useMembers();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "ongoing" | "finished">("upcoming");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "startDate" | "endDate" | "alphabetical">("endDate");

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Alert State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper: Find Category details
  const getCategoryDetails = (catId: string) => {
    const matched = categories.find((c) => c.id === catId);
    return matched || { name: "Tanpa Kategori", color: "bg-slate-500" };
  };

  // Helper: Find Member Name/Email by UID
  const getCreatorName = (uid: string) => {
    const matched = members.find((m) => m.uid === uid);
    return matched ? matched.name : "Anggota Planner";
  };

  // Helper: Calculate Duration in Days (inclusive)
  const calculateDuration = (startVal: any, endVal: any) => {
    if (!startVal || !endVal) return "-";
    const start = new Date(startVal.seconds ? startVal.seconds * 1000 : startVal);
    const end = new Date(endVal.seconds ? endVal.seconds * 1000 : endVal);
    
    // Normalize to midnight to calculate pure date differences
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} Hari`;
  };

  // Helper: Determine Event Status (upcoming, ongoing, finished)
  const getEventStatus = (startVal: any, endVal: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startVal.seconds ? startVal.seconds * 1000 : startVal);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endVal.seconds ? endVal.seconds * 1000 : endVal);
    end.setHours(23, 59, 59, 999);

    if (start > today) return "upcoming";
    if (end < today) return "finished";
    return "ongoing";
  };

  // Format Firebase Date to readable string
  const formatFirebaseDate = (dateVal: any) => {
    if (!dateVal) return "-";
    const date = new Date(dateVal.seconds ? dateVal.seconds * 1000 : dateVal);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleExportCSV = () => {
    if (filteredAndSorted.length === 0) {
      showToast("Tidak ada data event untuk diekspor sesuai filter yang aktif.", "error");
      return;
    }

    const headers = [
      "Nama Event",
      "Kategori",
      "Deskripsi",
      "Tanggal Mulai",
      "Tanggal Selesai",
      "Durasi",
      "Lokasi",
      "Dibuat Oleh"
    ];

    const rows = filteredAndSorted.map((evt) => [
      evt.title,
      getCategoryDetails(evt.categoryId).name,
      evt.description || "",
      formatFirebaseDate(evt.startDate),
      formatFirebaseDate(evt.endDate),
      calculateDuration(evt.startDate, evt.endDate),
      evt.location || "",
      getCreatorName(evt.createdBy)
    ]);

    // Construct CSV content with double-quotes escaping
    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    // Add UTF-8 BOM so Excel opens it with correct encoding
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `events-export-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Daftar event berhasil diekspor ke CSV!", "success");
  };

  const handleExportPDF = () => {
    if (filteredAndSorted.length === 0) {
      showToast("Tidak ada data event untuk diekspor sesuai filter yang aktif.", "error");
      return;
    }

    try {
      const doc = new jsPDF("landscape", "mm", "a4");

      // Set Title and Metadata
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Laporan Rencana Event - NexaPlanner", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      
      const filterText = `Filter/Pencarian Aktif: Status (${statusFilter}), Kategori (${
        selectedCategoryFilter ? getCategoryDetails(selectedCategoryFilter).name : "Semua"
      }), Kata Kunci ("${search || "-"}")`;
      doc.text(filterText, 14, 26);
      doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 31);

      // Define Table columns and rows
      const tableHeaders = [
        "Nama Event",
        "Kategori",
        "Deskripsi",
        "Mulai",
        "Selesai",
        "Durasi",
        "Lokasi",
        "Dibuat Oleh"
      ];

      const tableRows = filteredAndSorted.map((evt) => [
        evt.title,
        getCategoryDetails(evt.categoryId).name,
        evt.description || "-",
        formatFirebaseDate(evt.startDate),
        formatFirebaseDate(evt.endDate),
        calculateDuration(evt.startDate, evt.endDate),
        evt.location || "-",
        getCreatorName(evt.createdBy)
      ]);

      // Draw table via autoTable plugin
      autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: 38,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 8.5, cellPadding: 3, overflow: "linebreak" },
        columnStyles: {
          0: { cellWidth: 35 }, // Title
          1: { cellWidth: 25 }, // Category
          2: { cellWidth: 55 }, // Description
          3: { cellWidth: 25 }, // Start Date
          4: { cellWidth: 25 }, // End Date
          5: { cellWidth: 15 }, // Duration
          6: { cellWidth: 30 }, // Location
          7: { cellWidth: 30 }, // Created By
        },
      });

      doc.save(`events-export-${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast("Laporan event berhasil diekspor ke PDF!", "success");
    } catch (err: any) {
      console.error("PDF generation error:", err);
      showToast("Gagal mengekspor laporan ke PDF.", "error");
    }
  };

  // Dialog Handlers
  const handleOpenAdd = () => {
    if (categories.length === 0) {
      showToast("Harap buat kategori terlebih dahulu sebelum menambahkan event!", "error");
      return;
    }
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (evt: any) => {
    setSelectedEvent(evt);
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (evt: any) => {
    setSelectedEvent(evt);
    setIsDeleteOpen(true);
  };

  const [formError, setFormError] = useState<string | null>(null);

  // Submit Operations
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
      showToast(`Event "${selectedEvent.title}" berhasil dihapus!`, "success");
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort Operations
  const filteredAndSorted = (events || [])
    .filter((evt) => {
      // 1. Search text
      const searchMatch = 
        evt.title.toLowerCase().includes(search.toLowerCase()) ||
        evt.description.toLowerCase().includes(search.toLowerCase()) ||
        (evt.location && evt.location.toLowerCase().includes(search.toLowerCase()));
      
      // 2. Category Filter
      const categoryMatch = !selectedCategoryFilter || evt.categoryId === selectedCategoryFilter;
      
      // 3. Status Filter (upcoming, ongoing, finished)
      const currentStatus = getEventStatus(evt.startDate, evt.endDate);
      const statusMatch = statusFilter === "all" || currentStatus === statusFilter;

      // 4. Date Range Filter
      const startMs = new Date((evt.startDate as any).seconds ? (evt.startDate as any).seconds * 1000 : (evt.startDate as any)).getTime();
      const endMs = new Date((evt.endDate as any).seconds ? (evt.endDate as any).seconds * 1000 : (evt.endDate as any)).getTime();

      const filterStartMs = startDateFilter ? new Date(startDateFilter).getTime() : 0;
      const filterEndMs = endDateFilter ? new Date(endDateFilter).getTime() : Infinity;

      // Check overlap: event's end must be >= filter start, event's start must be <= filter end
      const dateRangeMatch = endMs >= filterStartMs && startMs <= filterEndMs;

      return searchMatch && categoryMatch && statusMatch && dateRangeMatch;
    })
    .sort((a, b) => {
      const getMs = (val: any) => new Date(val.seconds ? val.seconds * 1000 : val).getTime();
      const getCreatedMs = (val: any) => {
        if (!val) return 0;
        return new Date(val.seconds ? val.seconds * 1000 : val).getTime();
      };

      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "startDate") {
        return getMs(a.startDate) - getMs(b.startDate);
      }
      if (sortBy === "endDate") {
        return getMs(a.endDate) - getMs(b.endDate);
      }
      if (sortBy === "oldest") {
        return getCreatedMs(a.createdAt) - getCreatedMs(b.createdAt);
      }
      // default: newest
      return getCreatedMs(b.createdAt) - getCreatedMs(a.createdAt);
    });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategoryFilter, statusFilter, startDateFilter, endDateFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedEvents = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Predefined Category pill styles (match categories module)
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
    return PREDEFINED_BADGES[colorBg] || "text-slate-600 bg-slate-50 dark:bg-slate-500/10";
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Event"
        breadcrumbs={[{ name: "Event" }]}
        action={
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-xs font-semibold px-3 py-2 border border-border rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-xs font-semibold px-3 py-2 border border-border rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="h-3.5 w-3.5 text-blue-500" />
              <span>Ekspor PDF</span>
            </button>
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Event</span>
              </button>
            )}
          </div>
        }
      />

      {/* Main Filter Section */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 mb-6">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul, deskripsi, atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl outline-none focus:border-primary-500 transition-all text-foreground"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Select Filter */}
            <div className="relative min-w-[160px]">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl outline-none focus:border-primary-500 appearance-none cursor-pointer text-foreground font-semibold"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl outline-none focus:border-primary-500 appearance-none cursor-pointer text-foreground font-semibold"
              >
                <option value="newest">Urutkan: Baru Ditambahkan</option>
                <option value="oldest">Urutkan: Terlama Ditambahkan</option>
                <option value="startDate">Urutkan: Tanggal Mulai</option>
                <option value="endDate">Urutkan: Tanggal Selesai</option>
                <option value="alphabetical">Urutkan: Nama (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date boundary & Status Filter Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-border/40">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {(["all", "upcoming", "ongoing", "finished"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-white dark:bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "all" ? "Semua Status" : tab}
              </button>
            ))}
          </div>

          {/* Date range filter boundaries */}
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>Rentang:</span>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900/40 border border-border rounded-lg outline-none cursor-pointer text-foreground focus:border-primary-500"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900/40 border border-border rounded-lg outline-none cursor-pointer text-foreground focus:border-primary-500"
            />
            {(startDateFilter || endDateFilter) && (
              <button
                onClick={() => {
                  setStartDateFilter("");
                  setEndDateFilter("");
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-red-500 cursor-pointer"
                title="Reset Tanggal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Events Table */}
      {loadingEvents || loadingCategories ? (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0 animate-pulse">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded hidden md:block"></div>
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : errorEvents ? (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-500/20 text-center">
          <p className="text-sm font-semibold mb-2">Gagal Memuat Event</p>
          <p className="text-xs">{errorEvents}</p>
        </div>
      ) : filteredAndSorted.length > 0 ? (
        <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Nama Event</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Waktu Pelaksanaan</th>
                  <th className="px-6 py-4">Durasi</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {paginatedEvents.map((evt) => {
                  const cat = getCategoryDetails(evt.categoryId);
                  const status = getEventStatus(evt.startDate, evt.endDate);
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                      
                      {/* Event Title */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground block max-w-xs truncate" title={evt.title}>
                          {evt.title}
                        </span>
                      </td>

                      {/* Category Color badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 border rounded-md text-[11px] font-bold ${getBadgeColor(cat.color)}`}>
                          {cat.name}
                        </span>
                      </td>

                      {/* Start Date & End Date */}
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        <div className="flex flex-col text-xs space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                            <CalendarDays className="h-3 w-3 text-muted-foreground/60" />
                            <span>{formatFirebaseDate(evt.startDate)}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">s/d {formatFirebaseDate(evt.endDate)}</span>
                        </div>
                      </td>

                      {/* Duration (calculated days) */}
                      <td className="px-6 py-4 text-foreground font-semibold">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>{calculateDuration(evt.startDate, evt.endDate)}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-muted-foreground font-medium max-w-xs truncate" title={evt.location}>
                        {evt.location ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                            <span>{evt.location}</span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-muted-foreground font-medium max-w-xs truncate" title={evt.description}>
                        {evt.description ? (
                          <span>{evt.description}</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 font-medium italic text-[11.5px]">Tidak ada deskripsi</span>
                        )}
                      </td>

                      {/* Actions Column (Admin Only) */}
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(evt)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Edit Event"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(evt)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                              title="Hapus Event"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-border bg-slate-50/30 dark:bg-slate-900/10 text-xs font-semibold text-muted-foreground select-none">
              <div>
                Menampilkan <span className="text-foreground font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSorted.length)}</span> sampai <span className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}</span> dari <span className="text-foreground font-bold">{filteredAndSorted.length}</span> event
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded-lg border transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-primary-500 text-white border-transparent shadow-xs"
                        : "border-border hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto space-y-4">
          <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-full">
            <CalendarDays className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Tidak Ada Event</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tidak ada rencana event yang cocok dengan pemfilteran Anda atau sistem belum memiliki data event. Silakan buat event baru.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Buat Event Pertama
            </button>
          )}
        </div>
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
                <Trash2 className="h-6 w-6" />
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
