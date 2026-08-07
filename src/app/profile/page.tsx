"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { Save, User, KeyRound, Loader2, Sparkles, CheckCircle2, UserCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
      return;
    }

    if (profile) {
      setName(profile.name || "");
      setUsername(profile.username || "");
      setPhotoURL(profile.photoURL || "");
    }
  }, [profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name,
          username,
          password: password || undefined, // Only update if not empty
          photoURL,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMsg("Profil Anda berhasil diperbarui!");
        setPassword(""); // Clear password field
        
        // Refresh page or trigger context profile reload
        // Since use-auth automatically syncs on state changed or user profile fetch,
        // we can force reload the window to fetch the new profile in context
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setErrorMsg(result.message || "Gagal memperbarui profil");
      }
    } catch (err: any) {
      setErrorMsg("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Profil Saya"
        breadcrumbs={[{ name: "Profil Saya" }]}
      />

      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 rounded-2xl text-sm font-semibold shadow-xs">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 rounded-2xl text-sm font-semibold shadow-xs">
            <UserCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Avatar Preview card */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              {photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoURL}
                  alt={name}
                  className="h-28 w-28 rounded-full border-2 border-primary-500 object-cover shadow-md"
                  onError={(e) => {
                    (e.currentTarget as any).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&h=128&q=80";
                  }}
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-primary-50 dark:bg-primary-950/20 border-2 border-primary-500 flex items-center justify-center text-primary-500 shadow-md">
                  <User className="h-12 w-12" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-primary-500 text-white p-1.5 rounded-full shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">{name || "Nama Pengguna"}</h2>
              <p className="text-xs text-muted-foreground font-mono">@{username || "username"}</p>
            </div>

            <div className="w-full border-t border-border pt-4 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Email:</span>
                <span className="text-foreground font-bold truncate max-w-[160px]">{profile.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Hak Akses Role:</span>
                <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-50 dark:bg-primary-950/20 text-primary-500 border border-primary-100 dark:border-primary-500/10">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          {/* Right panel: Edit Form */}
          <div className="lg:col-span-2 bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-6">
              <User className="h-5 w-5 text-primary-500" />
              <h2 className="text-base font-bold text-foreground">Sunting Informasi Profil</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Username (Huruf & Angka saja)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Ubah Password (Kosongkan jika tidak diubah)</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">URL Foto Profil</label>
                <input
                  type="text"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-mono"
                />
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-border mt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
        </div>
      </div>
    </DashboardLayout>
  );
}
