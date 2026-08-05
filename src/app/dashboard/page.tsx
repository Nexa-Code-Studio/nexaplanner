"use client";

import React, { useMemo } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import AgendaCard from "@/components/dashboard/agenda-card";
import UpcomingCard from "@/components/dashboard/upcoming-card";
import ActivityList from "@/components/dashboard/activity-list";
import MiniCalendar from "@/components/dashboard/mini-calendar";
import QuickActions from "@/components/dashboard/quick-actions";
import Charts from "@/components/dashboard/charts";

import { useEvents } from "@/hooks/use-events";
import { useCategories } from "@/hooks/use-categories";
import { useMembers } from "@/hooks/use-members";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const { events, loading: loadingEvents } = useEvents();
  const { categories, loading: loadingCategories } = useCategories();
  const { members, loading: loadingMembers } = useMembers();

  const loading = loadingEvents || loadingCategories || loadingMembers;

  const stats = useMemo(() => {
    if (loading) return { totalEvents: 0, totalCategories: 0, totalMembers: 0, eventsThisMonth: 0 };

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const eventsThisMonthCount = events.filter((evt) => {
      const start = new Date((evt.startDate as any).seconds ? (evt.startDate as any).seconds * 1000 : (evt.startDate as any));
      const end = new Date((evt.endDate as any).seconds ? (evt.endDate as any).seconds * 1000 : (evt.endDate as any));
      return end >= startOfMonth && start <= endOfMonth;
    }).length;

    return {
      totalEvents: events.length,
      totalCategories: categories.length,
      totalMembers: members.length,
      eventsThisMonth: eventsThisMonthCount,
    };
  }, [events, categories, members, loading]);

  const eventsToday = useMemo(() => {
    if (loading) return [];
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    return events.filter((evt) => {
      const start = new Date((evt.startDate as any).seconds ? (evt.startDate as any).seconds * 1000 : (evt.startDate as any));
      const end = new Date((evt.endDate as any).seconds ? (evt.endDate as any).seconds * 1000 : (evt.endDate as any));
      return end >= startOfToday && start <= endOfToday;
    });
  }, [events, loading]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Dasbor"
        breadcrumbs={[]}
      />

      {loading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="text-xs font-semibold text-muted-foreground">Memuat dasbor NexaPlanner...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Statistics Cards Row */}
          <DashboardStats
            totalEvents={stats.totalEvents}
            totalCategories={stats.totalCategories}
            totalMembers={stats.totalMembers}
            eventsThisMonth={stats.eventsThisMonth}
          />

          {/* 2. Main Analytics & Logs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Today's Agenda */}
            <div className="lg:col-span-1 h-full">
              <AgendaCard
                eventsToday={eventsToday}
                categories={categories}
              />
            </div>

            {/* Upcoming Deadlines */}
            <div className="lg:col-span-1 h-full">
              <UpcomingCard
                events={events}
                categories={categories}
              />
            </div>

            {/* Activity History Logs */}
            <div className="lg:col-span-1 h-full">
              <ActivityList
                events={events}
                categories={categories}
                members={members}
              />
            </div>
          </div>

          {/* 3. Recharts Category Pie and Monthly Bar graphs */}
          <Charts
            events={events}
            categories={categories}
          />

          {/* 4. Shortcuts & Calendar View Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Quick Actions Links */}
            <div className="lg:col-span-2 h-full">
              <QuickActions
                isAdmin={isAdmin}
              />
            </div>

            {/* Mini Calendar Widget */}
            <div className="lg:col-span-1 h-full">
              <MiniCalendar
                events={events}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
