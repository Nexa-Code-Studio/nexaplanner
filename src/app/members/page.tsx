"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import PageHeader from "@/components/layout/page-header";
import { Plus, UserPlus, UserCheck, Shield, Mail, Calendar, Trash2, Edit } from "lucide-react";

export default function MembersPage() {
  const members = [
    { id: 1, name: "Otun (Administrator)", email: "khoirotunnisa2507@gmail.com", role: "admin", status: "Active", joined: "05 Agu 2026" },
    { id: 2, name: "Rian Ariadi", email: "rian.ariadi@nexacode.id", role: "member", status: "Active", joined: "05 Agu 2026" },
    { id: 3, name: "Fathur Rahman", email: "fathur.rahman@nexacode.id", role: "member", status: "Active", joined: "05 Agu 2026" },
    { id: 4, name: "Devina Putri", email: "devina.putri@nexacode.id", role: "member", status: "Active", joined: "05 Agu 2026" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Anggota"
        breadcrumbs={[{ name: "Anggota" }]}
        action={
          <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer">
            <UserPlus className="h-4 w-4" />
            <span>Tambah Anggota</span>
          </button>
        }
      />

      <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-slate-50/20 dark:bg-slate-900/10">
          <h2 className="text-sm font-bold text-foreground mb-1">Daftar Whitelist Email</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hanya pengguna dengan email Google di bawah ini yang dapat masuk ke dasbor NexaPlanner. Administrator dapat menambahkan, menghapus, atau mengubah hak akses role.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Nama Anggota</th>
                <th className="px-6 py-4">Alamat Email</th>
                <th className="px-6 py-4">Role Akses</th>
                <th className="px-6 py-4">Status Akses</th>
                <th className="px-6 py-4">Terdaftar Sejak</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                  {/* Name */}
                  <td className="px-6 py-4 font-semibold text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-50 text-primary-500 dark:bg-primary-500/10 dark:text-primary-400 flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <span>{member.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span>{member.email}</span>
                    </span>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${
                        member.role === "admin"
                          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      }`}
                    >
                      <Shield className="h-3 w-3" />
                      <span className="capitalize">{member.role}</span>
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      <UserCheck className="h-3 w-3" />
                      <span>{member.status}</span>
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span>{member.joined}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Edit Akses">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        disabled={member.email === "khoirotunnisa2507@gmail.com"}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer" 
                        title="Hapus Anggota"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
