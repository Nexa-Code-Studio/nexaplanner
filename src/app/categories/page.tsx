"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { Plus, Tag, CalendarDays, MoreVertical, Edit, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const categories = [
    { name: "Kompetisi", color: "bg-red-500", text: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10", desc: "Aktivitas kompetisi mahasiswa, submisi proposal, pengumuman abstrak/fullpaper.", count: 5, date: "01 Jun 2026" },
    { name: "Project Client", color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10", desc: "Tenggat waktu pengerjaan project klien, kickoff meeting, serah terima product.", count: 8, date: "01 Jun 2026" },
    { name: "Meeting", color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10", desc: "Agenda pertemuan rutin mingguan, evaluasi bulanan, rapat kepengurusan.", count: 4, date: "03 Jun 2026" },
    { name: "Seminar", color: "bg-purple-500", text: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10", desc: "Jadwal seminar internal, pengenalan riset, sosialisasi program PKL.", count: 3, date: "05 Jun 2026" },
    { name: "Workshop", color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10", desc: "Kegiatan peningkatan skill teknis, workshop framework Next.js/React.", count: 2, date: "10 Jun 2026" },
    { name: "Internal", color: "bg-pink-500", text: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10", desc: "Kegiatan kumpul santai tim, rapat kerja, ulang tahun organisasi.", count: 2, date: "12 Jun 2026" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Kategori"
        breadcrumbs={[{ name: "Kategori" }]}
        action={
          <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Tambah Kategori</span>
          </button>
        }
      />

      <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Jumlah Event</th>
                <th className="px-6 py-4">Tanggal Dibuat</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {categories.map((cat) => (
                <tr key={cat.name} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                  {/* Category Name & Color badge */}
                  <td className="px-6 py-4 font-semibold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cat.text}`}>
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  
                  {/* Description */}
                  <td className="px-6 py-4 text-muted-foreground max-w-sm truncate" title={cat.desc}>
                    {cat.desc}
                  </td>

                  {/* Event Count */}
                  <td className="px-6 py-4 font-medium text-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{cat.count} Event</span>
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{cat.date}</span>
                    </span>
                  </td>

                  {/* Actions Column */}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
