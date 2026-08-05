"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/hooks/use-auth";
import { 
  Plus, 
  Search, 
  Filter, 
  CalendarDays, 
  Tag, 
  Edit, 
  Trash2, 
  X, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  HelpCircle
} from "lucide-react";

export default function CategoriesPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  // Search & Sort State
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "newest" | "oldest">("name");

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("bg-blue-500");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Alert State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const PREDEFINED_COLORS = [
    { name: "Blue", bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" },
    { name: "Green", bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" },
    { name: "Purple", bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10" },
    { name: "Orange", bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10" },
    { name: "Red", bg: "bg-red-500", text: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10" },
    { name: "Yellow", bg: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10" },
    { name: "Gray", bg: "bg-slate-500", text: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10" },
  ];

  const getColorClasses = (colorBg: string) => {
    const matched = PREDEFINED_COLORS.find(c => c.bg === colorBg);
    return matched ? matched.text : "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10";
  };

  // Open Handlers
  const handleOpenAdd = () => {
    setName("");
    setDescription("");
    setColor("bg-blue-500");
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setColor(cat.color || "bg-blue-500");
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (cat: any) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  // Submit Handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Nama kategori wajib diisi");
      return;
    }
    if (name.trim().length < 2) {
      setFormError("Nama kategori minimal 2 karakter");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await createCategory(name.trim(), color, description.trim());
      setIsAddOpen(false);
      showToast(`Kategori "${name}" berhasil ditambahkan!`, "success");
    } catch (err: any) {
      setFormError(err.message || "Gagal menambahkan kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Nama kategori wajib diisi");
      return;
    }
    if (name.trim().length < 2) {
      setFormError("Nama kategori minimal 2 karakter");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await updateCategory(selectedCategory.id, name.trim(), color, description.trim());
      setIsEditOpen(false);
      showToast(`Kategori "${name}" berhasil diperbarui!`, "success");
    } catch (err: any) {
      setFormError(err.message || "Gagal memperbarui kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      await deleteCategory(selectedCategory.id);
      setIsDeleteOpen(false);
      showToast(`Kategori "${selectedCategory.name}" berhasil dihapus!`, "success");
    } catch (err: any) {
      setIsDeleteOpen(false);
      showToast(err.message || "Gagal menghapus kategori", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and Sort Logic
  const filteredAndSorted = (categories || [])
    .filter(cat => cat.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      
      const dateA = a.createdAt 
        ? new Date((a.createdAt as any).seconds ? (a.createdAt as any).seconds * 1000 : (a.createdAt as any)).getTime()
        : 0;
      const dateB = b.createdAt 
        ? new Date((b.createdAt as any).seconds ? (b.createdAt as any).seconds * 1000 : (b.createdAt as any)).getTime()
        : 0;

      if (sortBy === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  const formatFirebaseDate = (createdAt: any) => {
    if (!createdAt) return "-";
    const date = new Date(createdAt.seconds ? createdAt.seconds * 1000 : createdAt);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Kategori"
        breadcrumbs={[{ name: "Kategori" }]}
        action={
          isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Kategori</span>
            </button>
          )
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-border rounded-xl outline-none focus:border-primary-500 transition-all text-foreground"
          />
        </div>

        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full pl-10 pr-8 py-2.5 text-sm bg-white dark:bg-card border border-border rounded-xl outline-none focus:border-primary-500 appearance-none transition-all cursor-pointer text-foreground"
          >
            <option value="name">Urutkan: Nama (A-Z)</option>
            <option value="newest">Urutkan: Terbaru</option>
            <option value="oldest">Urutkan: Terlama</option>
          </select>
        </div>
      </div>

      {/* Categories Table / UI */}
      {loading ? (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded hidden md:block"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-500/20 text-center">
          <p className="text-sm font-semibold mb-2">Gagal Memuat Data</p>
          <p className="text-xs">{error}</p>
        </div>
      ) : filteredAndSorted.length > 0 ? (
        <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Warna</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4">Tanggal Dibuat</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {filteredAndSorted.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    {/* Color Preview */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-4.5 w-4.5 rounded-full ${cat.color} border border-white dark:border-slate-850 shadow-sm shrink-0`} />
                        <span className="text-xs text-muted-foreground font-mono">{cat.color.replace("bg-", "").replace("-500", "")}</span>
                      </div>
                    </td>

                    {/* Category Name badge */}
                    <td className="px-6 py-4 font-semibold text-foreground">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${getColorClasses(cat.color)}`}>
                        {cat.name}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-muted-foreground max-w-sm truncate" title={cat.description}>
                      {cat.description || "-"}
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span>{formatFirebaseDate(cat.createdAt)}</span>
                      </span>
                    </td>

                    {/* Actions Column (Admin Only) */}
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(cat)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto space-y-4">
          <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-full">
            <Tag className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Belum Ada Kategori</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tidak ada kategori yang cocok dengan pencarian Anda atau sistem belum memiliki data kategori. Silakan buat kategori baru.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Buat Kategori Pertama
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Category Dialog Modal */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground text-base">
                {isAddOpen ? "Tambah Kategori Baru" : "Edit Kategori"}
              </h3>
              <button
                onClick={() => isAddOpen ? setIsAddOpen(false) : setIsEditOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Misal: Rapat, Kompetisi, dll"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-medium"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Deskripsi (Opsional)</label>
                <textarea
                  placeholder="Penjelasan singkat mengenai kategori ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground min-h-[80px]"
                />
              </div>

              {/* Color Picker with Predefined Previews */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground block">Pilih Warna Badge</label>
                
                {/* Color Previews Row */}
                <div className="flex flex-wrap gap-2.5 items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-border/50">
                  {PREDEFINED_COLORS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setColor(item.bg)}
                      className={`h-6.5 w-6.5 rounded-full ${item.bg} border-2 transition-all cursor-pointer relative flex items-center justify-center ${
                        color === item.bg 
                          ? "border-primary-500 scale-110 shadow-sm" 
                          : "border-transparent hover:scale-105"
                      }`}
                      title={item.name}
                    >
                      {color === item.bg && (
                        <CheckCircle className="h-3.5 w-3.5 text-white bg-primary-500/80 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Interactive badge preview */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground font-medium">Pratinjau Badge:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold shadow-sm/5 ${getColorClasses(color)}`}>
                    {name || "Label Preview"}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => isAddOpen ? setIsAddOpen(false) : setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 border border-border rounded-xl transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Kategori"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {isDeleteOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full animate-bounce">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base mb-1">Hapus Kategori?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Apakah Anda yakin ingin menghapus kategori <span className="font-semibold text-foreground">"{selectedCategory.name}"</span>? Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>

              {/* Informational Warning */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-left text-[11px] leading-relaxed">
                <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Sistem akan secara otomatis memverifikasi bahwa tidak ada event aktif yang terikat dengan kategori ini sebelum memproses penghapusan.</span>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 border border-border rounded-xl transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  <span>{isSubmitting ? "Menghapus..." : "Ya, Hapus Kategori"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification overlay */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in shadow-2xl">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold bg-white ${
            toast.type === "success" 
              ? "border-emerald-200 text-emerald-600 dark:border-emerald-500/20 dark:text-emerald-400 dark:bg-card" 
              : "border-red-200 text-red-600 dark:border-red-500/20 dark:text-red-400 dark:bg-card"
          }`}>
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
