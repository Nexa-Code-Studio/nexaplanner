"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { Save, ShieldAlert, Sparkles, Send, Clock, Bell, User, Loader2, BellRing } from "lucide-react";

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [discordMessage, setDiscordMessage] = useState("Oi, reminder nih!");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [isH7Enabled, setIsH7Enabled] = useState(true);
  const [isH3Enabled, setIsH3Enabled] = useState(true);
  const [isH1Enabled, setIsH1Enabled] = useState(true);
  const [isH0Enabled, setIsH0Enabled] = useState(true);
  const [systemName, setSystemName] = useState("NexaPlanner Timeline");

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [testResult, setTestResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!loading && profile && profile.role !== "admin") {
      router.push("/unauthorized");
      return;
    }
  }, [profile, loading, router]);

  useEffect(() => {
    async function loadSettings() {
      if (!profile || profile.role !== "admin" || !user) return;
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/settings", {
          headers: {
            "Authorization": `Bearer ${idToken}`
          }
        });
        const result = await res.json();
        if (result.success && result.data) {
          setDiscordWebhookUrl(result.data.discordWebhookUrl || "");
          setDiscordMessage(result.data.discordMessage || "Oi, reminder nih!");
          setReminderTime(result.data.reminderTime || "08:00");
          setIsH7Enabled(result.data.isH7Enabled !== false);
          setIsH3Enabled(result.data.isH3Enabled !== false);
          setIsH1Enabled(result.data.isH1Enabled !== false);
          setIsH0Enabled(result.data.isH0Enabled !== false);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setIsLoadingSettings(false);
      }
    }
    loadSettings();
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          discordWebhookUrl,
          discordMessage,
          reminderTime,
          isH7Enabled,
          isH3Enabled,
          isH1Enabled,
          isH0Enabled
        })
      });
      const result = await res.json();
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(result.message || "Gagal menyimpan pengaturan");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!discordWebhookUrl) {
      setTestResult({ type: "error", message: "Masukkan URL Webhook Discord terlebih dahulu!" });
      setTimeout(() => setTestResult(null), 4000);
      return;
    }
    
    setIsTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/cron/reminders?test=true&url=${encodeURIComponent(discordWebhookUrl)}`, {
        method: "POST"
      });
      const result = await res.json();
      if (result.success) {
        setTestResult({ type: "success", message: "Pesan uji coba berhasil dikirim ke Discord Anda!" });
      } else {
        setTestResult({ type: "error", message: result.message || "Gagal mengirim pesan uji coba" });
      }
    } catch (err: any) {
      setTestResult({ type: "error", message: err.message || "Terjadi kesalahan" });
    } finally {
      setIsTestingWebhook(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };
  const handleTriggerReminders = async () => {
    setIsSendingReminders(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/cron/reminders", {
        method: "POST"
      });
      const result = await res.json();
      if (result.success) {
        setTestResult({ 
          type: "success", 
          message: result.message || "Pengingat harian berhasil dikirim ke Discord sekarang!" 
        });
      } else {
        setTestResult({ 
          type: "error", 
          message: result.message || "Gagal mengirim pengingat harian" 
        });
      }
    } catch (err: any) {
      setTestResult({ type: "error", message: err.message || "Terjadi kesalahan" });
    } finally {
      setIsSendingReminders(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  if (isLoadingSettings) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="text-sm font-semibold text-muted-foreground">Memuat Pengaturan...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Pengaturan"
        breadcrumbs={[{ name: "Pengaturan" }]}
      />

      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* General App Settings */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <User className="h-5 w-5 text-primary-500" />
              <h2 className="text-base font-bold text-foreground">Identitas Aplikasi</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Nama Aplikasi</label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Zona Waktu Sistem</label>
                <input
                  type="text"
                  disabled
                  value="Asia/Jakarta (WIB)"
                  className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-950 border border-border rounded-xl opacity-70 text-muted-foreground font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Discord Settings */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3 justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-500" />
                <h2 className="text-base font-bold text-foreground">Integrasi Discord Webhook</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook || !discordWebhookUrl}
                  className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900/80 border border-border rounded-xl px-3.5 py-1.5 text-xs font-bold text-primary-500 transition-colors cursor-pointer disabled:opacity-50"
                  title="Kirim pesan uji coba untuk verifikasi koneksi webhook"
                >
                  {isTestingWebhook ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  <span>Kirim Uji Coba</span>
                </button>
                <button
                  type="button"
                  onClick={handleTriggerReminders}
                  disabled={isSendingReminders || !discordWebhookUrl}
                  className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 border border-transparent rounded-xl px-3.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                  title="Kirim semua pengingat interval waktu (H-0, H-1, H-3, H-7) sekarang juga"
                >
                  {isSendingReminders ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <BellRing className="h-3 w-3" />
                  )}
                  <span>Kirim Pengingat Sekarang</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Discord Webhook URL</label>
                <input
                  type="text"
                  value={discordWebhookUrl}
                  onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-mono"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                  Digunakan untuk mengirimkan pengingat agenda harian otomatis secara langsung ke saluran (channel) Discord tim Anda.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Pesan Pembuka Notifikasi Discord</label>
                <input
                  type="text"
                  value={discordMessage}
                  onChange={(e) => setDiscordMessage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-semibold"
                  placeholder="Misal: Oi, reminder nih!"
                />
                <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                  Kalimat pembuka yang dikirimkan bersama tag @everyone (contoh: @everyone Oi, reminder nih!).
                </p>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs font-bold border ${
                  testResult.type === "success" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                    : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                }`}>
                  {testResult.message}
                </div>
              )}
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
                <label className="text-xs font-bold text-muted-foreground">Waktu Pengiriman Harian</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-semibold"
                />
                <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                  Setiap hari pada jam ini, sistem akan memicu cron job untuk memeriksa agenda dan mengirimkan notifikasi.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground block mb-1">Cakupan Pengingat</span>
                <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                    <span>Mode Rangkuman 7 Hari Aktif</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                    Sistem akan mengirimkan rangkuman seluruh agenda yang dijadwalkan dalam 7 hari ke depan (hari ini s.d H+7) secara lengkap, termasuk informasi waktu dan lokasinya.
                  </p>
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
                <Loader2 className="h-4 w-4 animate-spin" />
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
