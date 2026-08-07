"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { useMembers } from "@/hooks/use-members";
import { useAuth } from "@/hooks/use-auth";
import { 
  UserPlus, 
  Search, 
  Filter, 
  CalendarDays, 
  Mail, 
  Shield, 
  UserCheck, 
  Edit, 
  Trash2, 
  X, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  HelpCircle
} from "lucide-react";

export default function MembersPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
  } = useMembers();

  // Search & Sort State
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "newest" | "oldest">("name");

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Form States
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Alert State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Open Handlers
  const handleOpenAdd = () => {
    setEmail("");
    setName("");
    setRole("member");
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setSelectedMember(m);
    setRole(m.role || "member");
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (m: any) => {
    setSelectedMember(m);
    setIsDeleteOpen(true);
  };

  // Submit Handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setFormError("Email wajib diisi");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Format email tidak valid");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await addMember(email.trim(), role, name.trim());
      setIsAddOpen(false);
      showToast(`Email ${email} berhasil didaftarkan ke whitelist!`, "success");
    } catch (err: any) {
      setFormError(err.message || "Gagal menambahkan anggota");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await updateMember(selectedMember.uid, role);
      setIsEditOpen(false);
      showToast(`Akses role untuk ${selectedMember.email} berhasil diperbarui!`, "success");
    } catch (err: any) {
      setFormError(err.message || "Gagal memperbarui role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      await deleteMember(selectedMember.uid);
      setIsDeleteOpen(false);
      showToast(`Anggota ${selectedMember.email} berhasil dihapus dari whitelist!`, "success");
    } catch (err: any) {
      setIsDeleteOpen(false);
      showToast(err.message || "Gagal menghapus anggota", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and Sort Logic
  const filteredAndSorted = (members || [])
    .filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      
      const parseFirebaseDate = (dateVal: any): number => {
        if (!dateVal) return 0;
        const seconds = dateVal._seconds !== undefined ? dateVal._seconds : dateVal.seconds;
        if (seconds !== undefined) return seconds * 1000;
        const date = new Date(dateVal);
        return isNaN(date.getTime()) ? 0 : date.getTime();
      };
      
      const dateA = parseFirebaseDate(a.createdAt);
      const dateB = parseFirebaseDate(b.createdAt);

      if (sortBy === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  const formatFirebaseDate = (createdAt: any) => {
    if (!createdAt) return "-";
    const seconds = createdAt._seconds !== undefined ? createdAt._seconds : createdAt.seconds;
    if (seconds !== undefined) {
      const date = new Date(seconds * 1000);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    }
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Anggota"
        breadcrumbs={[{ name: "Anggota" }]}
        action={
          isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span>Tambah Anggota</span>
            </button>
          )
        }
      />

      {/* Info Banner Whitelist */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground">Sistem Whitelist Keanggotaan</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            Akses masuk hanya diperbolehkan bagi alamat email yang terdaftar di bawah ini. Ketika pengguna masuk menggunakan akun Google untuk pertama kalinya, nama dan avatar mereka akan otomatis disinkronkan.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau alamat email..."
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

      {/* Members Grid/Table Container */}
      {loading ? (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-500/20 text-center">
          <p className="text-sm font-semibold mb-2">Gagal Memuat Anggota</p>
          <p className="text-xs">{error}</p>
        </div>
      ) : filteredAndSorted.length > 0 ? (
        <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Anggota</th>
                  <th className="px-6 py-4">Alamat Email</th>
                  <th className="px-6 py-4">Role Akses</th>
                  <th className="px-6 py-4">Terdaftar</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {filteredAndSorted.map((member) => {
                  const isSelf = member.uid === profile?.uid;
                  const isPrimaryAdmin = member.email.toLowerCase() === "khoirotunnisa2507@gmail.com";
                  return (
                    <tr key={member.uid} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                      
                      {/* Avatar & Name */}
                      <td className="px-6 py-4 font-semibold text-foreground">
                        <div className="flex items-center gap-3">
                          {member.photoURL ? (
                            <img
                              src={member.photoURL}
                              alt={member.name}
                              className="h-8.5 w-8.5 rounded-full object-cover ring-2 ring-primary-50/50 shrink-0"
                            />
                          ) : (
                            <div className="h-8.5 w-8.5 rounded-full bg-slate-100 dark:bg-slate-900 text-muted-foreground flex items-center justify-center font-bold text-xs border border-border shrink-0">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-semibold">{member.name}</span>
                            {isSelf && (
                              <span className="ml-2 text-[10px] bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 px-1.5 py-0.5 rounded font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground/50" />
                          <span>{member.email}</span>
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        {member.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <Shield className="h-3 w-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                            <UserCheck className="h-3 w-3" />
                            <span>Member</span>
                          </span>
                        )}
                      </td>

                      {/* Whitelisted At */}
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/50" />
                          <span>{formatFirebaseDate(member.createdAt)}</span>
                        </span>
                      </td>

                      {/* Actions Column (Admin Only) */}
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(member)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Edit Akses"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(member)}
                              disabled={isSelf || isPrimaryAdmin}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                              title={isSelf ? "Tidak dapat menghapus diri sendiri" : "Hapus Anggota"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto space-y-4">
          <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-full">
            <Mail className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Anggota Tidak Ditemukan</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tidak ada data whitelist email yang cocok dengan pencarian Anda. Silakan daftarkan email baru.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Tambah Anggota Baru
            </button>
          )}
        </div>
      )}

      {/* Add Member Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground text-base">Tambah Anggota Whitelist</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Alamat Email Google</label>
                <input
                  type="email"
                  placeholder="nama@nexacode.id atau nama@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground font-medium"
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  Email ini harus berupa akun Google aktif agar dapat digunakan login.
                </p>
              </div>

              {/* Name Input (Optional Whitelist placeholder name) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Nama Anggota (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Fathur Rahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-border rounded-xl focus:bg-white outline-none focus:border-primary-500 transition-all text-foreground"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground block">Hak Akses Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all select-none ${
                    role === "member" 
                      ? "border-primary-500 bg-primary-50/20 dark:bg-primary-550/10 text-primary-600" 
                      : "border-border hover:bg-slate-50 text-muted-foreground"
                  }`}>
                    <span className="text-xs font-semibold">Member</span>
                    <input
                      type="radio"
                      name="role"
                      checked={role === "member"}
                      onChange={() => setRole("member")}
                      className="text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all select-none ${
                    role === "admin" 
                      ? "border-primary-500 bg-primary-50/20 dark:bg-primary-550/10 text-primary-600" 
                      : "border-border hover:bg-slate-50 text-muted-foreground"
                  }`}>
                    <span className="text-xs font-semibold">Admin</span>
                    <input
                      type="radio"
                      name="role"
                      checked={role === "admin"}
                      onChange={() => setRole("admin")}
                      className="text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
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
                  <span>{isSubmitting ? "Mendaftarkan..." : "Daftarkan Email"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Dialog Modal */}
      {isEditOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground text-base">Ubah Role Anggota</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 font-medium">
              {formError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Disabled Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Alamat Email Whitelist (Terkunci)</label>
                <input
                  type="email"
                  disabled
                  value={selectedMember.email}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border border-border rounded-xl opacity-70 text-muted-foreground font-mono"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground block">Ubah Hak Akses Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all select-none ${
                    role === "member" 
                      ? "border-primary-500 bg-primary-50/20 dark:bg-primary-550/10 text-primary-600" 
                      : "border-border hover:bg-slate-50 text-muted-foreground"
                  }`}>
                    <span className="text-xs font-semibold">Member</span>
                    <input
                      type="radio"
                      name="edit-role"
                      checked={role === "member"}
                      onChange={() => setRole("member")}
                      className="text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all select-none ${
                    role === "admin" 
                      ? "border-primary-500 bg-primary-50/20 dark:bg-primary-550/10 text-primary-600" 
                      : "border-border hover:bg-slate-50 text-muted-foreground"
                  }`}>
                    <span className="text-xs font-semibold">Admin</span>
                    <input
                      type="radio"
                      name="edit-role"
                      checked={role === "admin"}
                      onChange={() => setRole("admin")}
                      className="text-primary-500 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
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
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Dialog Modal */}
      {isDeleteOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full animate-bounce">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base mb-1">Hapus Anggota?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Apakah Anda yakin ingin menghapus email whitelist <span className="font-semibold text-foreground">"{selectedMember.email}"</span>? Pengguna ini tidak akan bisa login lagi ke sistem.
                </p>
              </div>

              {/* Informational Warning */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-left text-[11px] leading-relaxed">
                <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Sistem membatasi penghapusan untuk diri sendiri dan menjamin tidak ada penghapusan jika target merupakan Administrator terakhir demi keamanan sistem.</span>
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
                  <span>{isSubmitting ? "Menghapus..." : "Ya, Hapus Anggota"}</span>
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
