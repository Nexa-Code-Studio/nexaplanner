"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Calendar, 
  Users, 
  Tag, 
  FileSpreadsheet, 
  Zap 
} from "lucide-react";

interface QuickActionsProps {
  isAdmin: boolean;
}

export default function QuickActions({ isAdmin }: QuickActionsProps) {
  const router = useRouter();

  const actions = [
    {
      title: "Tambah Event",
      desc: "Jadwalkan agenda baru",
      icon: <Plus className="h-5 w-5 text-blue-500" />,
      path: "/calendar",
      adminOnly: false,
    },
    {
      title: "Impor Timeline",
      desc: "Parse teks jadwal",
      icon: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
      path: "/timeline",
      adminOnly: false,
    },
    {
      title: "Buka Kalender",
      desc: "Lihat visualisasi penuh",
      icon: <Calendar className="h-5 w-5 text-amber-500" />,
      path: "/calendar",
      adminOnly: false,
    },
    {
      title: "Anggota Tim",
      desc: "Manajemen whitelist email",
      icon: <Users className="h-5 w-5 text-purple-500" />,
      path: "/members",
      adminOnly: false,
    },
    {
      title: "Kategori Event",
      desc: "Ubah label dan warna",
      icon: <Tag className="h-5 w-5 text-rose-500" />,
      path: "/categories",
      adminOnly: false,
    },
  ];

  const filteredActions = actions.filter((act) => !act.adminOnly || isAdmin);

  return (
    <div className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4 text-left h-full">
      <div className="flex items-center gap-2 font-bold text-foreground text-sm border-b border-border pb-3">
        <Zap className="h-4.5 w-4.5 text-primary-500" />
        <span>Pintasan Cepat</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
        {filteredActions.map((act) => (
          <div
            key={act.title}
            onClick={() => router.push(act.path)}
            className="group flex flex-col items-center justify-center text-center p-5 bg-slate-50/40 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-card hover:shadow-md border border-border/60 hover:border-primary-500/40 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 min-h-[140px]"
          >
            <div className="p-3 bg-white dark:bg-slate-950 border border-border/80 group-hover:border-primary-500/25 group-hover:bg-primary-50/50 dark:group-hover:bg-primary-950/20 rounded-2xl shrink-0 transition-all duration-300 shadow-xs mb-3">
              {act.icon}
            </div>
            <div className="space-y-1 w-full">
              <span className="font-bold text-foreground block text-sm transition-colors group-hover:text-primary-500 truncate">
                {act.title}
              </span>
              <span className="text-[10px] text-muted-foreground block leading-snug">
                {act.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
