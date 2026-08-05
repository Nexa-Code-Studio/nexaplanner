"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Event, Category } from "@/types";
import { BarChart2, PieChart as PieIcon } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

interface ChartsProps {
  events: Event[];
  categories: Category[];
}

const HEX_COLOR_MAP: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-emerald-500": "#10b981",
  "bg-purple-500": "#a855f7",
  "bg-amber-500": "#f59e0b",
  "bg-red-500": "#ef4444",
  "bg-yellow-500": "#eab308",
  "bg-slate-500": "#64748b",
};

export default function Charts({ events, categories }: ChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Pie Chart Data: Events per Category
  const pieData = useMemo(() => {
    return categories.map((cat) => {
      const count = events.filter((e) => e.categoryId === cat.id).length;
      return {
        name: cat.name,
        value: count,
        color: HEX_COLOR_MAP[cat.color] || "#64748b",
      };
    }).filter((data) => data.value > 0); // Only show categories containing events
  }, [events, categories]);

  // 2. Bar Chart Data: Events per Month (Last 6 Months)
  const barData = useMemo(() => {
    const dataList = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      const m = d.getMonth();
      const y = d.getFullYear();

      // Count events starting in this month/year
      const count = events.filter((evt) => {
        const start = new Date((evt.startDate as any).seconds ? (evt.startDate as any).seconds * 1000 : (evt.startDate as any));
        return start.getMonth() === m && start.getFullYear() === y;
      }).length;

      dataList.push({
        name: label,
        jumlah: count,
      });
    }

    return dataList;
  }, [events]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-card border border-border p-6 rounded-2xl h-[340px] flex items-center justify-center text-xs text-muted-foreground">
          Memuat grafik kategori...
        </div>
        <div className="bg-white dark:bg-card border border-border p-6 rounded-2xl h-[340px] flex items-center justify-center text-xs text-muted-foreground">
          Memuat grafik bulanan...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      {/* Category Pie Chart */}
      <div className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-foreground text-sm border-b border-border pb-3">
          <PieIcon className="h-4.5 w-4.5 text-primary-500" />
          <span>Sebaran Event per Kategori</span>
        </div>
        <div className="h-[260px] w-full text-xs font-semibold">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card, #fff)",
                    borderColor: "var(--color-border, #e2e8f0)",
                    borderRadius: "12px",
                    color: "var(--color-foreground, #000)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground italic">
              Belum ada data event untuk ditampilkan
            </div>
          )}
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white dark:bg-card border border-border p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-foreground text-sm border-b border-border pb-3">
          <BarChart2 className="h-4.5 w-4.5 text-primary-500" />
          <span>Tren Event Bulanan (6 Bulan Terakhir)</span>
        </div>
        <div className="h-[260px] w-full text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card, #fff)",
                  borderColor: "var(--color-border, #e2e8f0)",
                  borderRadius: "12px",
                  color: "var(--color-foreground, #000)",
                }}
              />
              <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
