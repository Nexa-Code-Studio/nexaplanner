import { ImageResponse } from "next/og";
import { EventRepository } from "@/repositories/event.repository";
import { CategoryRepository } from "@/repositories/category.repository";

export const dynamic = "force-dynamic";

const HEX_COLOR_MAP: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-emerald-500": "#10b981",
  "bg-green-500": "#22c55e",
  "bg-teal-500": "#14b8a6",
  "bg-cyan-500": "#06b6d4",
  "bg-sky-500": "#0ea5e9",
  "bg-indigo-500": "#6366f1",
  "bg-violet-500": "#8b5cf6",
  "bg-purple-500": "#a855f7",
  "bg-fuchsia-500": "#d946ef",
  "bg-pink-500": "#ec4899",
  "bg-rose-500": "#f43f5e",
  "bg-red-500": "#ef4444",
  "bg-orange-500": "#f97316",
  "bg-amber-500": "#f59e0b",
  "bg-yellow-500": "#eab308",
  "bg-lime-500": "#84cc16",
  "bg-slate-500": "#64748b",
};

const parseFirebaseDate = (dateVal: any): Date => {
  if (!dateVal) return new Date();
  if (dateVal.seconds !== undefined) return new Date(dateVal.seconds * 1000);
  if (dateVal._seconds !== undefined) return new Date(dateVal._seconds * 1000);
  return new Date(dateVal);
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "month-this";
    const parameter = url.searchParams.get("parameter") || "";

    const eventRepo = new EventRepository();
    const categoryRepo = new CategoryRepository();

    const allEvents = await eventRepo.findAll();
    const categories = await categoryRepo.findAll();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDateBoundary = new Date(today);
    let endDateBoundary = new Date(today);
    let filterLabel = "Timeline Bulan Ini";
    let isCategoryFilter = false;
    let isAllFilter = false;

    // 1. Calculate boundaries based on filter
    if (filter === "today") {
      startDateBoundary.setHours(0, 0, 0, 0);
      endDateBoundary.setHours(23, 59, 59, 999);
      filterLabel = "Timeline Hari Ini";
    } else if (filter === "week") {
      startDateBoundary.setHours(0, 0, 0, 0);
      endDateBoundary = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      endDateBoundary.setHours(23, 59, 59, 999);
      filterLabel = "Timeline 7 Hari Ke Depan";
    } else if (filter === "next") {
      startDateBoundary.setHours(0, 0, 0, 0);
      endDateBoundary = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      endDateBoundary.setHours(23, 59, 59, 999);
      filterLabel = "Timeline 30 Hari Ke Depan";
    } else if (filter === "month-this") {
      startDateBoundary = new Date(today.getFullYear(), today.getMonth(), 1);
      endDateBoundary = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDateBoundary.setHours(23, 59, 59, 999);
      filterLabel = `Timeline Bulan ${today.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`;
    } else if (filter === "month-select") {
      let parsedMonth = today.getMonth();
      let parsedYear = today.getFullYear();
      if (parameter && /^\d{4}-\d{2}$/.test(parameter)) {
        const parts = parameter.split("-");
        parsedYear = parseInt(parts[0]);
        parsedMonth = parseInt(parts[1]) - 1;
      }
      startDateBoundary = new Date(parsedYear, parsedMonth, 1);
      endDateBoundary = new Date(parsedYear, parsedMonth + 1, 0);
      endDateBoundary.setHours(23, 59, 59, 999);
      filterLabel = `Timeline Bulan ${startDateBoundary.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`;
    } else if (filter === "category") {
      isCategoryFilter = true;
      filterLabel = `Timeline Kategori: ${parameter || "Semua"}`;
    } else if (filter === "all") {
      isAllFilter = true;
      filterLabel = "Semua Timeline Rencana Event";
    }

    // 2. Filter events
    const filteredEvents = allEvents.filter((evt) => {
      const evtStart = parseFirebaseDate(evt.startDate);
      const evtEnd = parseFirebaseDate(evt.endDate);

      // Category filter
      if (isCategoryFilter && parameter) {
        const cat = categories.find(
          (c) => c.name.toLowerCase() === parameter.toLowerCase() || c.id === parameter
        );
        if (!cat || evt.categoryId !== cat.id) return false;
      }

      // If it is 'all' or 'category', we show everything without date boundaries
      if (isAllFilter || isCategoryFilter) return true;

      // Check overlap: event must overlap with the boundary
      return evtEnd.getTime() >= startDateBoundary.getTime() && evtStart.getTime() <= endDateBoundary.getTime();
    }).sort((a, b) => parseFirebaseDate(a.startDate).getTime() - parseFirebaseDate(b.startDate).getTime());

    // 3. Determine actual range coordinates for the Gantt visual layout
    let rangeStart = startDateBoundary;
    let rangeEnd = endDateBoundary;

    if ((isAllFilter || isCategoryFilter) && filteredEvents.length > 0) {
      const startTimes = filteredEvents.map((e) => parseFirebaseDate(e.startDate).getTime());
      const endTimes = filteredEvents.map((e) => parseFirebaseDate(e.endDate).getTime());
      const minT = Math.min(...startTimes);
      const maxT = Math.max(...endTimes);
      
      rangeStart = new Date(minT);
      rangeStart.setDate(1); // align to start of month
      
      rangeEnd = new Date(maxT);
      rangeEnd.setMonth(rangeEnd.getMonth() + 1);
      rangeEnd.setDate(0); // align to end of month
    }

    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);
    const totalMs = Math.max(rangeEnd.getTime() - rangeStart.getTime(), 1);

    // Calculate grid date ticks (4 headers)
    const tickCount = 4;
    const ticks: string[] = [];
    for (let i = 0; i < tickCount; i++) {
      const tTime = rangeStart.getTime() + (totalMs / (tickCount - 1)) * i;
      const tDate = new Date(tTime);
      ticks.push(tDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" }));
    }

    const periodStr = `${rangeStart.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} - ${rangeEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;

    // Prepare JSX items
    const displayEvents = filteredEvents.map((e) => {
      const eStart = parseFirebaseDate(e.startDate);
      const eEnd = parseFirebaseDate(e.endDate);
      const left = ((eStart.getTime() - rangeStart.getTime()) / totalMs) * 100;
      const width = Math.max(((eEnd.getTime() - eStart.getTime()) / totalMs) * 100, 3);
      const cat = categories.find((c) => c.id === e.categoryId);
      const colorHex = HEX_COLOR_MAP[cat?.color || "bg-slate-500"] || "#64748b";

      return {
        id: e.id,
        title: e.title,
        category: cat ? cat.name : "Tanpa Kategori",
        color: colorHex,
        left: `${Math.max(0, Math.min(left, 97))}%`,
        width: `${Math.max(3, Math.min(width, 100))}%`,
      };
    });

    const isDark = true; // Premium Dark Mode

    // Slice to prevent image overflowing (maximum 7 events fit in 800x450, or let's use 800x600 for max 10 events!)
    const maxVisibleEvents = 8;
    const overflowCount = displayEvents.length - maxVisibleEvents;
    const visibleEvents = displayEvents.slice(0, maxVisibleEvents);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 800,
            height: 600,
            padding: 32,
            background: "#0b0f19",
            color: "#f8fafc",
            fontFamily: "sans-serif",
            position: "relative",
            border: "2px solid #1e293b",
          }}
        >
          {/* Background grid dots decoration */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "radial-gradient(circle, #1e293b 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              opacity: 0.25,
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #1e293b",
              paddingBottom: 16,
              marginBottom: 20,
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 22, fontWeight: "bold", color: "#3b82f6", display: "flex", alignItems: "center" }}>
                📅 NexaPlanner Timeline
              </span>
              <span style={{ fontSize: 13, color: "#94a3b8", marginTop: 2, fontWeight: "500" }}>
                {filterLabel}
              </span>
            </div>
            <span style={{ fontSize: 11, background: "#1e293b", color: "#cbd5e1", padding: "4px 10px", borderRadius: 8, fontWeight: "bold" }}>
              {periodStr}
            </span>
          </div>

          {/* Gantt Grid Container */}
          {displayEvents.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #334155",
                borderRadius: 16,
                padding: 40,
                zIndex: 10,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: "bold", color: "#94a3b8" }}>Tidak Ada Agenda</span>
              <span style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Tidak ada rencana event yang dijadwalkan pada rentang ini.
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, zIndex: 10, position: "relative" }}>
              
              {/* Vertical Grid Lines */}
              <div
                style={{
                  position: "absolute",
                  top: 36,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  pointerEvents: "none",
                }}
              >
                {ticks.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 1,
                      backgroundColor: "#1e293b",
                      height: "100%",
                      opacity: 0.5,
                    }}
                  />
                ))}
              </div>

              {/* Date Ticks Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: 8,
                  borderBottom: "1px solid #1e293b",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                {ticks.map((t) => (
                  <div key={t} style={{ width: 80 }}>{t}</div>
                ))}
              </div>

              {/* Events Row List */}
              <div style={{ display: "flex", flexDirection: "column", marginTop: 12, gap: 14 }}>
                {visibleEvents.map((ev) => (
                  <div key={ev.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {/* Event info text */}
                    <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 4, paddingRight: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: "bold", color: "#f1f5f9", maxHeight: 18, overflow: "hidden" }}>
                        {ev.title}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: "#cbd5e1",
                          background: "#1e293b",
                          border: "1px solid #334155",
                          padding: "1px 6px",
                          borderRadius: 4,
                          fontWeight: "bold",
                        }}
                      >
                        {ev.category}
                      </span>
                    </div>
                    {/* Track bg and timeline bar */}
                    <div
                      style={{
                        width: "100%",
                        height: 22,
                        background: "rgba(30, 41, 59, 0.3)",
                        borderRadius: 6,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: ev.left,
                          width: ev.width,
                          height: 12,
                          backgroundColor: ev.color,
                          borderRadius: 4,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Overflow warning */}
              {overflowCount > 0 && (
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 12,
                    fontSize: 11,
                    fontWeight: "bold",
                    color: "#64748b",
                    borderTop: "1px solid #1e293b",
                  }}
                >
                  * Dan {overflowCount} agenda tim lainnya untuk periode ini.
                </div>
              )}
            </div>
          )}

          {/* Footer Logo */}
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10,
              color: "#475569",
              borderTop: "1px solid #1e293b",
              paddingTop: 12,
              zIndex: 10,
            }}
          >
            <span>🤖 NexaPlanner Auto-Generated</span>
            <span>nexaCode Planner App</span>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 600,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
