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
      adminOnly: true,
    },
    {
      title: "Impor Timeline",
      desc: "Parse teks jadwal",
      icon: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
      path: "/timeline",
      adminOnly: true,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
        {filteredActions.map((act) => (
          <div
            key={act.title}
            onClick={() => router.push(act.path)}
            className="flex items-start gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-900/35 hover:bg-slate-50 dark:hover:bg-slate-900 border border-border/50 rounded-xl cursor-pointer hover:border-primary-500/20 transition-all text-xs"
          >
            <div className="p-2.5 bg-white dark:bg-card border border-border rounded-lg shrink-0">
              {act.icon}
            </div>
            <div className="space-y-0.5 truncate">
              <span className="font-bold text-foreground block truncate">{act.title}</span>
              <span className="text-[10px] text-muted-foreground block truncate">{act.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
