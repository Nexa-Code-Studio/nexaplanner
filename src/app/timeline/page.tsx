"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { parseTimelineText, ParsedEvent } from "@/lib/parser";
import { 
  Clock, 
  Upload, 
  Play, 
  Save, 
  Trash2, 
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState<"visual" | "import">("visual");
  const [inputText, setInputText] = useState(
    `KTI TFS\n\n20 Jun - 4 Jul 2026\nPendaftaran & Submission Abstrak\n\n5 - 15 Jul 2026\nExtend Pendaftaran & Submission Abstrak\n\n18 Jul 2026\nPengumuman Lolos Abstrak\n\n28 Jul - 5 Agu 2026\nSubmission Fullpaper Batch 2`
  );
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const handleParse = () => {
    setIsSaved(false);
    const results = parseTimelineText(inputText);
    setParsedEvents(results);
  };

  const handleSave = () => {
    // Mimic save functionality
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setParsedEvents([]);
      setInputText("");
      setActiveTab("visual");
    }, 2000);
  };

  const clearInput = () => {
    setInputText("");
    setParsedEvents([]);
    setIsSaved(false);
  };

  // Mock visual timeline data
  const months = ["Jun 2026", "Jul 2026", "Agu 2026"];
  const visualEvents = [
    { title: "Pendaftaran & Submission Abstrak", category: "KTI TFS", startOffset: "w-[25%] ml-[10%]", color: "bg-red-500" },
    { title: "Extend Pendaftaran", category: "KTI TFS", startOffset: "w-[15%] ml-[35%]", color: "bg-red-400" },
    { title: "Kickoff Project Client", category: "Client Project", startOffset: "w-[30%] ml-[45%]", color: "bg-blue-500" },
    { title: "Workshop Next.js 15", category: "Workshop", startOffset: "w-[20%] ml-[65%]", color: "bg-emerald-500" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Timeline"
        breadcrumbs={[{ name: "Timeline" }]}
        action={
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-border/50">
            <button
              onClick={() => setActiveTab("visual")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "visual"
                  ? "bg-white dark:bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tampilan Visual
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "import"
                  ? "bg-white dark:bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Impor Jadwal
            </button>
          </div>
        }
      />

      {activeTab === "visual" ? (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-bold text-foreground">Timeline Gantt Chart</h2>
          </div>

          {/* Timeline chart wrapper */}
          <div className="overflow-x-auto">
            <div className="min-w-[768px] space-y-4">
              {/* Month Header */}
              <div className="grid grid-cols-3 border-b border-border pb-3 font-semibold text-xs text-muted-foreground text-center">
                {months.map((m) => (
                  <div key={m} className="border-r border-border/50 last:border-0">
                    {m}
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              <div className="relative space-y-3 pt-2">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 grid grid-cols-3 pointer-events-none">
                  <div className="border-r border-slate-100 dark:border-slate-800 h-full" />
                  <div className="border-r border-slate-100 dark:border-slate-800 h-full" />
                  <div className="h-full" />
                </div>

                {/* Event Bars */}
                {visualEvents.map((ev, i) => (
                  <div key={i} className="flex flex-col gap-1 relative z-10">
                    <div className="flex justify-between items-center text-xs px-2">
                      <span className="font-semibold text-foreground">{ev.title}</span>
                      <span className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-border px-1.5 py-0.5 rounded text-muted-foreground font-medium">
                        {ev.category}
                      </span>
                    </div>
                    <div className="w-full bg-slate-50 dark:bg-slate-900/30 h-7 rounded-lg flex items-center">
                      <div className={`h-4 rounded-md shadow-sm ${ev.color} ${ev.startOffset} transition-all duration-500`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Paste Input Pane */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-bold text-foreground">Tempel Teks Timeline</h2>
              </div>
              <button
                onClick={clearInput}
                className="text-xs text-red-500 hover:text-red-600 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Bersihkan</span>
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Format input: Tulis baris pertama sebagai **Nama Kategori**. Baris berikutnya berupa **Rentang Tanggal** (misal: 5 - 15 Jul 2026 atau 18 Jul 2026) diikuti **Judul Event** di bawahnya.
            </p>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 min-h-[300px] w-full p-4 border border-border bg-slate-50 dark:bg-slate-950 font-mono text-sm rounded-xl outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-card transition-all mb-4"
              placeholder={`Contoh:\n\nKTI TFS\n20 Jun - 4 Jul 2026\nPendaftaran & Submission Abstrak`}
            />

            <button
              onClick={handleParse}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Play className="h-4 w-4" />
              <span>Jalankan Parser</span>
            </button>
          </div>

          {/* Parser Preview Table */}
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-bold text-foreground">Hasil Parsing Preview</h2>
              </div>
              {parsedEvents.length > 0 && !isSaved && (
                <button
                  onClick={handleSave}
                  className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan</span>
                </button>
              )}
            </div>

            {isSaved ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 p-3 rounded-full animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Impor Timeline Berhasil!</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Semua event yang terurai berhasil dimasukkan ke Firestore. Halaman akan dialihkan kembali ke tampilan timeline visual.
                </p>
              </div>
            ) : parsedEvents.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="pb-2 pr-2">Kategori</th>
                        <th className="pb-2 pr-2">Event</th>
                        <th className="pb-2 pr-2">Mulai</th>
                        <th className="pb-2">Selesai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {parsedEvents.map((ev, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="py-2.5 pr-2 font-medium">
                            <span className="bg-slate-50 dark:bg-slate-900 border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                              {ev.category}
                            </span>
                          </td>
                          <td className="py-2.5 pr-2 font-semibold text-foreground">{ev.title}</td>
                          <td className="py-2.5 pr-2 font-medium text-muted-foreground">{ev.startDate}</td>
                          <td className="py-2.5 font-medium text-muted-foreground">{ev.endDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2">
                <Sparkles className="h-8 w-8 text-slate-300 dark:text-slate-800" />
                <p className="text-sm font-semibold">Belum Ada Data Hasil Parse</p>
                <p className="text-xs max-w-xs leading-relaxed">
                  Tempel teks timeline di sebelah kiri dan klik tombol "Jalankan Parser" untuk mengekstrak data event secara otomatis.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
