"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { Sparkles, Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If loading authentication state, show a clean, premium loading screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="bg-primary-500 text-white p-3 rounded-xl shadow-lg">
            <Sparkles className="h-6 w-6 animate-spin text-white" style={{ animationDuration: "3s" }} />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Memuat NexaPlanner...</span>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, we return null to prevent content flashing before redirect
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      {/* Sidebar Desktop (always visible on md+) */}
      <Sidebar className="hidden md:flex flex-shrink-0" />

      {/* Sidebar Mobile (slide-in drawer) */}
      <div className="md:hidden">
        {/* Backdrop overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          className="fixed inset-y-0 left-0 z-40 w-64 md:hidden"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto px-6 py-8 relative focus:outline-none">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
