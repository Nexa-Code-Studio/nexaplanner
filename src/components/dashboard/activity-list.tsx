"use client";

import React, { useMemo } from "react";
import { Event, Category, UserProfile } from "@/types";
import { Clock, PlusCircle, Tag, UserPlus } from "lucide-react";

interface ActivityListProps {
  events: Event[];
  categories: Category[];
  members: UserProfile[];
}

interface ActivityItem {
  id: string;
  type: "event" | "category" | "member";
  text: string;
  timestamp: Date;
}

export default function ActivityList({
  events,
  categories,
  members,
}: ActivityListProps) {
  const activities = useMemo(() => {
    const list: ActivityItem[] = [];

    const getJsDate = (val: any) => {
      if (!val) return new Date(0);
      return new Date(val.seconds ? val.seconds * 1000 : val);
    };

    // 1. Map events
    events.forEach((evt) => {
      if (evt.createdAt) {
        list.push({
          id: `evt-${evt.id}`,
          type: "event",
          text: `Event "${evt.title}" berhasil ditambahkan ke rencana.`,
          timestamp: getJsDate(evt.createdAt),
        });
      }
    });

    // 2. Map categories
    categories.forEach((cat) => {
      if (cat.createdAt) {
        list.push({
          id: `cat-${cat.id}`,
          type: "category",
          text: `Kategori baru "${cat.name}" berhasil didaftarkan.`,
          timestamp: getJsDate(cat.createdAt),
        });
      }
    });

    // 3. Map members
    members.forEach((mb) => {
      if (mb.createdAt) {
        list.push({
          id: `mb-${mb.uid}`,
          type: "member",
          text: `Email "${mb.email}" didaftarkan ke dalam sistem whitelist.`,
          timestamp: getJsDate(mb.createdAt),
        });
      }
    });

    // Sort descending (latest first) and limit to 5
    return list
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }, [events, categories, members]);

  const formatDistanceToNow = (date: Date) => {
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return "Kemarin";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4 text-left h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-primary-500" />
          <span>Aktivitas Terbaru</span>
        </h3>
      </div>

      <div className="relative border-l border-border/80 ml-2.5 pl-5 space-y-5 py-2">
        {activities.map((act) => {
          let icon = <PlusCircle className="h-4 w-4 text-blue-500" />;
          if (act.type === "category") {
            icon = <Tag className="h-4 w-4 text-emerald-500" />;
          } else if (act.type === "member") {
            icon = <UserPlus className="h-4 w-4 text-purple-500" />;
          }

          return (
            <div key={act.id} className="relative text-xs space-y-0.5">
              {/* Dot Icon indicator */}
              <span className="absolute -left-7 top-0.5 bg-white dark:bg-card p-0.5 rounded-full border border-border">
                {icon}
              </span>
              <p className="font-semibold text-foreground leading-snug">{act.text}</p>
              <span className="text-[10px] text-muted-foreground block font-medium">
                {formatDistanceToNow(act.timestamp)}
              </span>
            </div>
          );
        })}

        {activities.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-6 -ml-5">
            Belum ada aktivitas tercatat.
          </p>
        )}
      </div>
    </div>
  );
}
