"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { Save, ShieldAlert, Sparkles, Mail, Clock, Bell, User } from "lucide-react";

export default function SettingsPage() {
  const [resendApiKey, setResendApiKey] = useState("re_1234567890abcdefghijklmnopqrstuvwxyz");
  const [reminderTime, setReminderTime] = useState("07:00");
  const [isH7Enabled, setIsH7Enabled] = useState(true);
  const [isH3Enabled, setIsH3Enabled] = useState(true);
  const [isH1Enabled, setIsH1Enabled] = useState(true);
  const [isH0Enabled, setIsH0Enabled] = useState(true);
  const [systemName, setSystemName] = useState("NexaPlanner Timeline");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Pengaturan"
        breadcrumbs={[{ name: "Pengaturan" }]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* General App Settings */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <User className="h-5 w-5 text-primary-500" />
              <h2 className="text-base font-bold text-foreground">Identitas Aplikasi</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Nama Aplikasi</label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Zona Waktu Sistem</label>
                <input
                  type="text"
                  disabled
                  value="Asia/Jakarta (WIB)"
                  className="w-full px-3 py-2 text-sm bg-slate-100 border border-border rounded-xl opacity-70 text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Mail className="h-5 w-5 text-primary-500" />
              <h2 className="text-base font-bold text-foreground">Konfigurasi Email (Resend)</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Resend API Key</label>
                <input
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-mono"
                  placeholder="re_..."
                />
                <p className="text-[10px] text-muted-foreground">
                  Digunakan oleh backend untuk mengirimkan email pengingat otomatis ke anggota tim.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email Pengirim Default</label>
                <input
                  type="text"
                  disabled
                  value="NexaPlanner <noreply@nexacode.id>"
                  className="w-full px-3 py-2 text-sm bg-slate-100 border border-border rounded-xl opacity-70 text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Scheduler Settings */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Clock className="h-5 w-5 text-primary-500" />
              <h2 className="text-base font-bold text-foreground">Jadwal Pengingat (Scheduler)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Waktu Pengiriman Harian</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground"
                />
                <p className="text-[10px] text-muted-foreground">
                  Scheduler harian akan dipicu secara otomatis setiap jam ini untuk memindai agenda.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Interval Pengingat</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isH7Enabled}
                      onChange={() => setIsH7Enabled(!isH7Enabled)}
                      className="rounded border-border text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    />
                    <span>H-7 Event</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isH3Enabled}
                      onChange={() => setIsH3Enabled(!isH3Enabled)}
                      className="rounded border-border text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    />
                    <span>H-3 Event</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isH1Enabled}
                      onChange={() => setIsH1Enabled(!isH1Enabled)}
                      className="rounded border-border text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    />
                    <span>H-1 Event</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isH0Enabled}
                      onChange={() => setIsH0Enabled(!isH0Enabled)}
                      className="rounded border-border text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Hari H Event</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              {saveSuccess && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                  Pengaturan berhasil disimpan!
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
