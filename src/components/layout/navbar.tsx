"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Search, Bell, Menu, Sun, Moon } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { profile } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setTheme("dark");
    }
  };

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white dark:bg-card border-b border-border sticky top-0 z-10">
      {/* Search Bar / Left Section */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg md:hidden cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari event, kategori, atau anggota..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-transparent focus:border-border rounded-lg outline-none transition-all dark:bg-slate-900 dark:hover:bg-slate-900/70 dark:focus:bg-card"
          />
        </div>
      </div>

      {/* Actions / Right Section */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          title={theme === "dark" ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-500 animate-pulse" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary-500 rounded-full ring-2 ring-white dark:ring-card"></span>
        </button>

        {/* User Profile Link */}
        <div className="flex items-center gap-3 pl-2 border-l border-border">
          {profile && (
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-all cursor-pointer">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-550/20"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold text-foreground hidden md:inline-block max-w-[120px] truncate">
                {profile.name}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
