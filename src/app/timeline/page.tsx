"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { parseTimelineText, ParsedEvent } from "@/lib/parser";
import { useEvents } from "@/hooks/use-events";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/hooks/use-auth";
import {
  ClipboardPaste,
  Play,
  Pencil,
  Upload,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Sparkles,
  AlertTriangle,
  SkipForward,
  RefreshCw,
  X,
  Loader2,
  Clock,
  Layers,
} from "lucide-react";

// ─── Tipe Data Internal ───────────────────────────────────────────────────────

type RowStatus = "baru" | "duplikat";
type DuplicateAction = "lewati" | "ganti" | "tetap_impor";

interface ImportRow extends ParsedEvent {
  id: string;
  categoryId: string;
  status: RowStatus;
  duplicateAction?: DuplicateAction;
  deleted: boolean;
}

type Step = 1 | 2 | 3 | 4;

// ─── Helper ───────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2);
}

const WARNA_DEFAULT: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-emerald-500": "#10b981",
  "bg-purple-500": "#a855f7",
  "bg-amber-500": "#f59e0b",
  "bg-red-500": "#ef4444",
  "bg-yellow-500": "#eab308",
  "bg-slate-500": "#64748b",
};

// ─── Komponen Step Indicator ──────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { no: 1, label: "Tempel Teks" },
    { no: 2, label: "Preview & Edit" },
    { no: 3, label: "Tinjau Duplikat" },
    { no: 4, label: "Ringkasan" },
  ];
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <div key={s.no} className="flex items-center">
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                s.no < step
                  ? "bg-emerald-500 text-white"
                  : s.no === step
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
              }`}
            >
              {s.no < step ? <CheckCircle2 className="h-4 w-4" /> : s.no}
            </span>
            <span
              className={`text-[11px] font-bold whitespace-nowrap ${
                s.no === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-2 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const { profile } = useAuth();
  const { events, createEvent } = useEvents();
  const { categories } = useCategories();

  const [activeTab, setActiveTab] = useState<"visual" | "impor">("impor");
  const [step, setStep] = useState<Step>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Step 1
  const [inputText, setInputText] = useState(
    `20 Jun - 4 Jul 2026\nPendaftaran & Submission Abstrak\n\n5 - 15 Jul 2026\nExtend Pendaftaran & Submission Abstrak\n\n18 Jul 2026\nPengumuman Lolos Abstrak\n\n28 Jul - 5 Agu 2026\nSubmission Fullpaper Batch 2`
  );

  // Step 2: rows editable
  const [rows, setRows] = useState<ImportRow[]>([]);

  // Step 4: summary
  const [summary, setSummary] = useState<{
    berhasil: number;
    dilewati: number;
    gagal: number;
    details: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // ── Mock visual timeline ─────────────────────────────────────────────────
  const months = ["Jun 2026", "Jul 2026", "Agu 2026"];
  const visualEvents = [
    { title: "Pendaftaran & Submission Abstrak", category: "KTI TFS", startOffset: "w-[25%] ml-[10%]", color: "bg-red-500" },
    { title: "Extend Pendaftaran", category: "KTI TFS", startOffset: "w-[15%] ml-[35%]", color: "bg-red-400" },
    { title: "Kickoff Project Client", category: "Client Project", startOffset: "w-[30%] ml-[45%]", color: "bg-blue-500" },
    { title: "Workshop Next.js 15", category: "Workshop", startOffset: "w-[20%] ml-[65%]", color: "bg-emerald-500" },
  ];

  // ── Step 1 → Step 2: Parse teks ────────────────────────────────────────────
  const handleParse = useCallback(() => {
    if (!inputText.trim()) return;
    const parsed = parseTimelineText(inputText);
    if (parsed.length === 0) return;

    const newRows: ImportRow[] = parsed.map((p) => {
      // Cek duplikat: event dengan judul + startDate + endDate yang sama
      const isDuplicate = events.some(
        (e) => {
          const eStart = new Date((e.startDate as any).seconds ? (e.startDate as any).seconds * 1000 : (e.startDate as any));
          const eEnd = new Date((e.endDate as any).seconds ? (e.endDate as any).seconds * 1000 : (e.endDate as any));
          return (
            e.title.toLowerCase() === p.title.toLowerCase() &&
            eStart.toISOString().slice(0, 10) === p.startDate &&
            eEnd.toISOString().slice(0, 10) === p.endDate
          );
        }
      );

      return {
        ...p,
        id: generateId(),
        categoryId: selectedCategoryId || (categories[0]?.id ?? ""),
        status: isDuplicate ? "duplikat" : "baru",
        duplicateAction: isDuplicate ? "lewati" : undefined,
        deleted: false,
      };
    });

    setRows(newRows);
    setStep(2);
  }, [inputText, events, categories, selectedCategoryId]);

  // ── Step 2: Edit Baris ────────────────────────────────────────────────────
  const handleUpdateRow = (id: string, field: keyof ImportRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        // Jika judul/tanggal berubah, cek ulang duplikat
        if (["title", "startDate", "endDate"].includes(field)) {
          const isDuplicate = events.some((e) => {
            const eStart = new Date((e.startDate as any).seconds ? (e.startDate as any).seconds * 1000 : (e.startDate as any));
            const eEnd = new Date((e.endDate as any).seconds ? (e.endDate as any).seconds * 1000 : (e.endDate as any));
            return (
              e.title.toLowerCase() === updated.title.toLowerCase() &&
              eStart.toISOString().slice(0, 10) === updated.startDate &&
              eEnd.toISOString().slice(0, 10) === updated.endDate
            );
          });
          updated.status = isDuplicate ? "duplikat" : "baru";
          updated.duplicateAction = isDuplicate ? "lewati" : undefined;
        }
        return updated;
      })
    );
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, deleted: true } : r)));
  };

  // Baris aktif (tidak dihapus)
  const activeRows = useMemo(() => rows.filter((r) => !r.deleted), [rows]);
  const dupRows = useMemo(() => activeRows.filter((r) => r.status === "duplikat"), [activeRows]);

  // ── Step 3: Aksi duplikat ─────────────────────────────────────────────────
  const handleDuplicateAction = (id: string, action: DuplicateAction) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, duplicateAction: action } : r))
    );
  };

  const handleSetAllDuplicates = (action: DuplicateAction) => {
    setRows((prev) =>
      prev.map((r) =>
        r.status === "duplikat" && !r.deleted ? { ...r, duplicateAction: action } : r
      )
    );
  };

  // ── Step 4: Impor ke Firestore ────────────────────────────────────────────
  const handleImport = useCallback(async () => {
    setIsImporting(true);
    let berhasil = 0;
    let dilewati = 0;
    let gagal = 0;
    const details: string[] = [];

    for (const row of activeRows) {
      // Baris yang duplikat dan dipilih lewati → skip
      if (row.status === "duplikat" && row.duplicateAction === "lewati") {
        dilewati++;
        details.push(`⏭ Dilewati: "${row.title}"`);
        continue;
      }

      try {
        await createEvent({
          title: row.title,
          categoryId: row.categoryId,
          description: "",
          startDate: row.startDate,
          endDate: row.endDate,
          location: "",
          color: categories.find((c) => c.id === row.categoryId)?.color ?? "bg-blue-500",
        });
        berhasil++;
        details.push(`✅ Berhasil: "${row.title}"`);
      } catch (err: any) {
        gagal++;
        details.push(`❌ Gagal: "${row.title}" — ${err?.message ?? "Error tidak diketahui"}`);
      }
    }

    setSummary({ berhasil, dilewati, gagal, details });
    setStep(4);
    setIsImporting(false);
  }, [activeRows, categories, createEvent]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep(1);
    setRows([]);
    setSummary(null);
    setInputText("");
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <PageHeader
        title="Impor Timeline"
        breadcrumbs={[{ name: "Impor Timeline" }]}
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
              onClick={() => setActiveTab("impor")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === "impor"
                  ? "bg-white dark:bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Impor Jadwal
            </button>
          </div>
        }
      />

      {/* ── TAB: Tampilan Visual (Gantt placeholder) ─────────────────────────── */}
      {activeTab === "visual" ? (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-bold text-foreground">Timeline Gantt Chart</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[768px] space-y-4">
              <div className="grid grid-cols-3 border-b border-border pb-3 font-semibold text-xs text-muted-foreground text-center">
                {months.map((m) => (
                  <div key={m} className="border-r border-border/50 last:border-0">{m}</div>
                ))}
              </div>
              <div className="relative space-y-3 pt-2">
                <div className="absolute inset-0 grid grid-cols-3 pointer-events-none">
                  <div className="border-r border-slate-100 dark:border-slate-800 h-full" />
                  <div className="border-r border-slate-100 dark:border-slate-800 h-full" />
                  <div className="h-full" />
                </div>
                {visualEvents.map((ev, i) => (
                  <div key={i} className="flex flex-col gap-1 relative z-10">
                    <div className="flex justify-between items-center text-xs px-2">
                      <span className="font-semibold text-foreground">{ev.title}</span>
                      <span className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-border px-1.5 py-0.5 rounded text-muted-foreground font-medium">{ev.category}</span>
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
        /* ── TAB: Impor Jadwal ──────────────────────────────────────────────── */
        <div className="space-y-5">
          {/* Step Indicator */}
          <div className="bg-white dark:bg-card border border-border px-5 py-4 rounded-2xl shadow-xs">
            <StepIndicator step={step} />
          </div>

          {/* ══ LANGKAH 1: Paste Teks ══════════════════════════════════════════ */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Textarea Input */}
              <div className="lg:col-span-3 bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <ClipboardPaste className="h-4.5 w-4.5 text-primary-500" />
                    <span>Langkah 1 — Tempel Teks Timeline</span>
                  </h2>
                  <button
                    onClick={() => setInputText("")}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Bersihkan</span>
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Format: Cukup tempel baris <strong className="text-foreground">Rentang Tanggal</strong> (mis: <code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">5 - 15 Jul 2026</code> atau <code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">18 Jul 2026</code>), diikuti <strong className="text-foreground">Judul Event</strong> di baris berikutnya. Pilih kategori untuk seluruh event di bawah ini.
                </p>
                
                {/* Category Selection Dropdown */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-muted-foreground block">
                    Pilih Kategori Event
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-semibold cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={12}
                  className="w-full p-4 border border-border bg-slate-50 dark:bg-slate-950 font-mono text-[12px] rounded-xl outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-card transition-all resize-none text-foreground"
                  placeholder={`Contoh:\n\n20 Jun - 4 Jul 2026\nPendaftaran & Submission Abstrak`}
                />
                <button
                  onClick={handleParse}
                  disabled={!inputText.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <Play className="h-4 w-4" />
                  <span>Parse & Lanjut ke Preview</span>
                </button>
              </div>

              {/* Panduan Format */}
              <div className="lg:col-span-2 bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4 text-left">
                <h3 className="font-bold text-foreground text-sm border-b border-border pb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Panduan Format Input</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border/50 space-y-2">
                    <p className="font-bold text-foreground">Contoh Teks:</p>
                    <pre className="font-mono text-[10px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{`20 Jun - 4 Jul 2026
Pendaftaran Abstrak

18 Jul 2026
Pengumuman Lolos

28 Jul - 5 Agu 2026
Workshop Next.js 15`}</pre>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-primary-500 font-black mt-0.5">→</span>
                      <span className="text-muted-foreground"><strong className="text-foreground">Satu tanggal</strong> = tanggal mulai & selesai sama (event satu hari).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary-500 font-black mt-0.5">→</span>
                      <span className="text-muted-foreground"><strong className="text-foreground">Rentang tanggal</strong> = tanggal mulai s/d tanggal selesai.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary-500 font-black mt-0.5">→</span>
                      <span className="text-muted-foreground"><strong className="text-foreground">Pilih Kategori</strong> pada dropdown di sebelah untuk menyetel jenis kategori seluruh event sekaligus.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ LANGKAH 2: Preview & Edit Baris ═══════════════════════════════ */}
          {step === 2 && (
            <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Pencil className="h-4.5 w-4.5 text-primary-500" />
                  <span>Langkah 2 — Preview & Edit Hasil Parsing</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {activeRows.length} baris aktif
                  </span>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border rounded-lg transition-colors cursor-pointer"
                  >
                    ← Kembali
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Judul Event</th>
                      <th className="px-4 py-3 text-left">Kategori</th>
                      <th className="px-4 py-3 text-left">Tgl Mulai</th>
                      <th className="px-4 py-3 text-left">Tgl Selesai</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {rows.map((row) =>
                      row.deleted ? null : (
                        <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors">
                          {/* Judul */}
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) => handleUpdateRow(row.id, "title", e.target.value)}
                              className="w-full min-w-[160px] px-2.5 py-1.5 border border-border bg-transparent hover:border-primary-500/50 focus:border-primary-500 rounded-lg outline-none text-foreground font-semibold transition-colors"
                            />
                          </td>
                          {/* Kategori */}
                          <td className="px-4 py-2.5">
                            <select
                              value={row.categoryId}
                              onChange={(e) => handleUpdateRow(row.id, "categoryId", e.target.value)}
                              className="px-2.5 py-1.5 border border-border bg-white dark:bg-card hover:border-primary-500/50 focus:border-primary-500 rounded-lg outline-none text-foreground font-semibold transition-colors cursor-pointer min-w-[130px]"
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                              {categories.length === 0 && (
                                <option value="">{row.category} (belum ada)</option>
                              )}
                            </select>
                          </td>
                          {/* Tgl Mulai */}
                          <td className="px-4 py-2.5">
                            <input
                              type="date"
                              value={row.startDate}
                              onChange={(e) => handleUpdateRow(row.id, "startDate", e.target.value)}
                              className="px-2.5 py-1.5 border border-border bg-transparent hover:border-primary-500/50 focus:border-primary-500 rounded-lg outline-none text-foreground font-semibold transition-colors cursor-pointer"
                            />
                          </td>
                          {/* Tgl Selesai */}
                          <td className="px-4 py-2.5">
                            <input
                              type="date"
                              value={row.endDate}
                              onChange={(e) => handleUpdateRow(row.id, "endDate", e.target.value)}
                              className="px-2.5 py-1.5 border border-border bg-transparent hover:border-primary-500/50 focus:border-primary-500 rounded-lg outline-none text-foreground font-semibold transition-colors cursor-pointer"
                            />
                          </td>
                          {/* Status */}
                          <td className="px-4 py-2.5">
                            {row.status === "duplikat" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                                <AlertTriangle className="h-3 w-3" />
                                Duplikat
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" />
                                Baru
                              </span>
                            )}
                          </td>
                          {/* Hapus */}
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => handleDeleteRow(row.id)}
                              className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Hapus baris"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-slate-50/30 dark:bg-slate-900/20">
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {dupRows.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                      ⚠ {dupRows.length} baris terdeteksi sebagai duplikat
                    </span>
                  )}
                </span>
                <button
                  onClick={() => setStep(dupRows.length > 0 ? 3 : 4)}
                  disabled={activeRows.length === 0}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <span>{dupRows.length > 0 ? "Tinjau Duplikat" : "Lanjut ke Impor"}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ══ LANGKAH 3: Tinjau Duplikat ════════════════════════════════════ */}
          {step === 3 && (
            <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  <span>Langkah 3 — Tinjau Event Duplikat</span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(2)}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border rounded-lg transition-colors cursor-pointer"
                  >
                    ← Kembali
                  </button>
                </div>
              </div>

              {/* Aksi massal */}
              <div className="px-5 py-3 bg-amber-50/40 dark:bg-amber-500/5 border-b border-amber-100 dark:border-amber-500/10 flex items-center gap-3 flex-wrap">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  Atur semua duplikat:
                </span>
                <button onClick={() => handleSetAllDuplicates("lewati")} className="text-[10px] font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors">
                  Lewati Semua
                </button>
                <button onClick={() => handleSetAllDuplicates("ganti")} className="text-[10px] font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors">
                  Ganti Semua
                </button>
                <button onClick={() => handleSetAllDuplicates("tetap_impor")} className="text-[10px] font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors">
                  Impor Semua Tetap
                </button>
              </div>

              <div className="divide-y divide-border/50">
                {dupRows.map((row) => (
                  <div key={row.id} className="px-5 py-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground text-xs">{row.title}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {row.startDate} s/d {row.endDate}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shrink-0">
                        <AlertTriangle className="h-3 w-3" />
                        Duplikat Terdeteksi
                      </span>
                    </div>
                    {/* Pilihan aksi */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {(["lewati", "ganti", "tetap_impor"] as DuplicateAction[]).map((act) => (
                        <button
                          key={act}
                          onClick={() => handleDuplicateAction(row.id, act)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            row.duplicateAction === act
                              ? "bg-primary-500 border-primary-500 text-white shadow-xs"
                              : "border-border text-muted-foreground hover:text-foreground hover:border-primary-500/30"
                          }`}
                        >
                          {act === "lewati" && <SkipForward className="h-3 w-3" />}
                          {act === "ganti" && <RefreshCw className="h-3 w-3" />}
                          {act === "tetap_impor" && <Upload className="h-3 w-3" />}
                          {act === "lewati" ? "Lewati" : act === "ganti" ? "Ganti Data Lama" : "Impor Tetap"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end px-5 py-4 border-t border-border bg-slate-50/30 dark:bg-slate-900/20">
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{isImporting ? "Mengimpor..." : "Mulai Impor Bulk"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Langkah 2 lanjut tanpa duplikat → langsung impor */}
          {step === 2 && dupRows.length === 0 && (
            /* tombol sudah di footer tabel langkah 2 */ null
          )}

          {/* ══ LANGKAH 4: Ringkasan ══════════════════════════════════════════ */}
          {step === 4 && summary && (
            <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
              <div className="p-6 space-y-6 text-center">
                <div className={`inline-flex items-center justify-center p-4 rounded-full ${summary.gagal > 0 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"} dark:bg-opacity-10`}>
                  {summary.gagal > 0 ? (
                    <AlertTriangle className="h-10 w-10" />
                  ) : (
                    <CheckCircle2 className="h-10 w-10" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    {summary.gagal > 0 ? "Impor Selesai dengan Catatan" : "Impor Timeline Berhasil! 🎉"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Semua data event telah diproses dari teks yang ditempel.
                  </p>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4">
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.berhasil}</p>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1">Berhasil</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-border rounded-xl p-4">
                    <p className="text-2xl font-black text-muted-foreground">{summary.dilewati}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Dilewati</p>
                  </div>
                  <div className={`border rounded-xl p-4 ${summary.gagal > 0 ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" : "bg-slate-50 dark:bg-slate-900/60 border-border"}`}>
                    <p className={`text-2xl font-black ${summary.gagal > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>{summary.gagal}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${summary.gagal > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>Gagal</p>
                  </div>
                </div>

                {/* Detail Log */}
                {summary.details.length > 0 && (
                  <div className="text-left bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-1.5 mx-auto max-w-lg">
                    {summary.details.map((d, i) => (
                      <p key={i} className="text-[11px] font-medium text-foreground">{d}</p>
                    ))}
                  </div>
                )}

                {/* Tombol Reset */}
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Impor Teks Baru</span>
                </button>
              </div>
            </div>
          )}

          {/* ══ Tombol Impor untuk Langkah 2 (tidak ada duplikat) ════════════ */}
          {step === 2 && dupRows.length === 0 && activeRows.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>{isImporting ? "Mengimpor..." : `Impor ${activeRows.length} Event ke Firestore`}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
