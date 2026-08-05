"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { Plus, Search, Filter, CalendarDays, MapPin, User, Edit, Trash2 } from "lucide-react";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const events = [
    { id: 1, title: "Submission KTI TFS", category: "Kompetisi", color: "bg-red-500", text: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10", start: "20 Jun 2026", end: "04 Jul 2026", location: "Online", createdBy: "Admin NexaCode" },
    { id: 2, title: "Kickoff Project NexaCode", category: "Project Client", color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10", start: "10 Jul 2026", end: "10 Jul 2026", location: "Meeting Room A", createdBy: "Admin NexaCode" },
    { id: 3, title: "Meeting Evaluasi Mingguan", category: "Meeting", color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10", start: "10 Jul 2026", end: "10 Jul 2026", location: "Discord NexaCode", createdBy: "Admin NexaCode" },
    { id: 4, title: "Workshop Next.js 15 & React 19", category: "Workshop", color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10", start: "24 Jul 2026", end: "24 Jul 2026", location: "Lab Komputer 2", createdBy: "Admin NexaCode" },
    { id: 5, title: "Internal Gathering Tim", category: "Internal", color: "bg-pink-500", text: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10", start: "28 Jul 2026", end: "29 Jul 2026", location: "Villa Batu Malang", createdBy: "Admin NexaCode" },
  ];

  const filteredEvents = events.filter((ev) => {
    const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ev.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ev.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Event"
        breadcrumbs={[{ name: "Event" }]}
        action={
          <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Tambah Event</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul atau lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-border rounded-xl outline-none focus:border-primary-500 transition-all"
          />
        </div>

        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-border rounded-xl outline-none focus:border-primary-500 appearance-none transition-all cursor-pointer text-foreground"
          >
            <option value="all">Semua Kategori</option>
            <option value="Kompetisi">Kompetisi</option>
            <option value="Project Client">Project Client</option>
            <option value="Meeting">Meeting</option>
            <option value="Workshop">Workshop</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Nama Event</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tanggal Pelaksanaan</th>
                <th className="px-6 py-4">Lokasi</th>
                <th className="px-6 py-4">Dibuat Oleh</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    {/* Event Title */}
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {ev.title}
                    </td>

                    {/* Category Label */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${ev.color}`} />
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${ev.text}`}>
                          {ev.category}
                        </span>
                      </div>
                    </td>

                    {/* Date range */}
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {ev.start === ev.end ? ev.start : `${ev.start} - ${ev.end}`}
                        </span>
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{ev.location}</span>
                      </span>
                    </td>

                    {/* Created By */}
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{ev.createdBy}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors cursor-pointer" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Tidak ada event ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
