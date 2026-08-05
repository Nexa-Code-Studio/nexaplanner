"use client";

import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setIsLoggingIn(false);
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950">
      {/* Left pane: Branding & Visuals */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-12 bg-slate-50 dark:bg-slate-900 border-r border-border">
        <div className="flex items-center gap-2">
          <div className="bg-primary-500 text-white p-2 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">NexaPlanner</span>
        </div>

        <div className="my-auto max-w-lg py-12 md:py-0">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-4">
            Rencanakan timeline & event tim Anda dengan lebih presisi.
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            NexaPlanner adalah pusat komando kegiatan internal NexaCode. Kelola event penting, kalender kolaboratif, serta impor jadwal instan dari catatan teks Anda tanpa ribet.
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} NexaCode. Hak cipta dilindungi undang-undang.
        </div>
      </div>

      {/* Right pane: Login Box */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Masuk ke Akun</h1>
            <p className="text-sm text-muted-foreground">
              Gunakan email NexaCode Anda untuk mengakses platform ini.
            </p>
          </div>

          <div className="border border-border rounded-2xl p-6 bg-slate-50/50 dark:bg-card/50 shadow-sm space-y-6">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-foreground border border-border py-2.5 px-4 rounded-xl font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
              ) : (
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              <span>Masuk dengan Google</span>
            </button>
            
            <div className="text-[11px] text-center text-muted-foreground leading-relaxed">
              Hanya email terdaftar (whitelist) yang dapat masuk ke dasbor NexaPlanner. Hubungi administrator jika Anda tidak dapat mengakses akun Anda.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
