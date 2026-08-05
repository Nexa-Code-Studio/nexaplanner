"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { 
  CalendarDays, 
  Users, 
  Layers, 
  Send,
  Plus,
  ArrowUpRight,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { name: "Total Event", value: "24", change: "+4 bulan ini", icon: CalendarDays, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
    { name: "Kategori", value: "6", change: "Aktif", icon: Layers, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
    { name: "Anggota Tim", value: "12", change: "Terdaftar", icon: Users, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
    { name: "Pengingat Email", value: "148", change: "Terkirim", icon: Send, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  ];

  const todayEvents = [
    { id: 1, title: "Meeting Progress Client Project", category: "Meeting", time: "10:00 - 11:30 WIB", color: "bg-blue-500" },
    { id: 2, title: "Deadline Pengumpulan Proposal KTI", category: "Deadline", time: "17:00 WIB", color: "bg-red-500" },
  ];

  const upcomingEvents = [
    { id: 3, title: "Seminar PKL Gelombang 1", category: "Seminar", date: "08 Agu 2026", color: "bg-purple-500" },
    { id: 4, title: "Workshop Next.js 15 & React 19", category: "Workshop", date: "12 Agu 2026", color: "bg-emerald-500" },
    { id: 5, title: "Evaluasi Bulanan Internal", category: "Internal", date: "15 Agu 2026", color: "bg-amber-500" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Dasbor"
        breadcrumbs={[]}
        action={
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Event</span>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-6 bg-white dark:bg-card border border-border rounded-2xl shadow-sm hover:shadow-md/5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{stat.name}</span>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground font-medium">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today & Upcoming */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Agenda */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-bold text-foreground">Agenda Hari Ini</h2>
              </div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                {new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>

            {todayEvents.length > 0 ? (
              <div className="space-y-4">
                {todayEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-border transition-all duration-200"
                  >
                    <div className={`h-2.5 w-2.5 rounded-full ${event.color} mt-1.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground leading-snug">{event.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="font-medium bg-white dark:bg-card border border-border px-2 py-0.5 rounded-md">
                          {event.category}
                        </span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Tidak ada agenda untuk hari ini.
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Event Mendatang</h2>
              <Link 
                href="/calendar" 
                className="text-xs font-semibold text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 transition-colors"
              >
                <span>Lihat Semua Kalender</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-border transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2.5 w-2.5 rounded-full ${event.color} shrink-0`} />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{event.title}</h3>
                      <span className="inline-block mt-1 text-[10px] font-semibold bg-white dark:bg-card border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium shrink-0 ml-4">
                    {event.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Info / Reminders */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Pengingat Otomatis</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Sistem akan mengirimkan email notifikasi ke semua anggota pada H-7, H-3, H-1, dan hari H pelaksanaan event.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <span className="font-medium text-foreground">Jadwal Pengiriman</span>
                <span className="text-muted-foreground font-semibold">07:00 WIB</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <span className="font-medium text-foreground">Status Engine</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Aktif
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-3">Impor Cepat</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Punya daftar timeline dalam bentuk teks? Copy-paste dan impor puluhan event sekaligus tanpa harus mengetik satu per satu.
            </p>
            <Link
              href="/timeline"
              className="inline-flex w-full items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-foreground text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <span>Mulai Impor Catatan</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
