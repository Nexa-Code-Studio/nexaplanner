"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl shadow-sm">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Akses Ditolak</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Email Google Anda tidak terdaftar di daftar anggota NexaPlanner. Silakan hubungi administrator tim NexaCode untuk mendaftarkan email Anda.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Halaman Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
