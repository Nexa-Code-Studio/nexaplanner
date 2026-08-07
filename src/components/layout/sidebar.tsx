"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  CalendarDays, 
  Folder, 
  Users, 
  Settings, 
  LogOut,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function Sidebar({ isOpen, onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  const isAdmin = profile?.role === "admin";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kalender", href: "/calendar", icon: Calendar },
    { name: "Timeline", href: "/timeline", icon: Clock },
    { name: "Event", href: "/events", icon: CalendarDays },
    { name: "Kategori", href: "/categories", icon: Folder },
    { name: "Anggota", href: "/members", icon: Users },
    ...(isAdmin ? [{ name: "Pengaturan", href: "/settings", icon: Settings }] : []),
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white dark:bg-card border-r border-border w-64 transition-transform duration-300 ease-in-out md:translate-x-0 z-40 md:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      {/* Header / Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="bg-primary-500 text-white p-2 rounded-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-foreground">NexaPlanner</h1>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Internal Team</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary-50 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-primary-500" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-border bg-slate-50/50 dark:bg-card">
        {profile && (
          <Link 
            href="/profile" 
            className="flex items-center gap-3 mb-4 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-all cursor-pointer w-full text-left"
          >
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-500/20"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{profile.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{profile.role}</p>
            </div>
          </Link>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
