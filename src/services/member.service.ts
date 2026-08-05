import { MemberRepository } from "@/repositories/member.repository";
import { UserProfile } from "@/types";

export class MemberService {
  private repository = new MemberRepository();

  async getAllMembers(): Promise<UserProfile[]> {
    return this.repository.findAll();
  }

  async getMemberById(uid: string): Promise<UserProfile | null> {
    return this.repository.findById(uid);
  }

  async getMemberByEmail(email: string): Promise<UserProfile | null> {
    return this.repository.findByEmail(email);
  }

  async addMember(data: Omit<UserProfile, "createdAt">): Promise<string> {
    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      throw new Error("Email anggota sudah terdaftar");
    }
    return this.repository.create(data);
  }

  async updateMember(uid: string, data: Partial<Omit<UserProfile, "uid" | "createdAt">>): Promise<void> {
    const existing = await this.repository.findById(uid);
    if (!existing) {
      throw new Error("Anggota tidak ditemukan");
    }

    if (data.email && data.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailDup = await this.repository.findByEmail(data.email);
      if (emailDup) {
        throw new Error("Email baru sudah terdaftar pada anggota lain");
      }
    }

    return this.repository.update(uid, data);
  }

  async removeMember(uid: string): Promise<void> {
    const existing = await this.repository.findById(uid);
    if (!existing) {
      throw new Error("Anggota tidak ditemukan");
    }

    // Protection to prevent deleting the primary administrator
    if (existing.email.toLowerCase() === "khoirotunnisa2507@gmail.com") {
      throw new Error("Tidak diperbolehkan menghapus akun Administrator utama");
    }

    // Protection to prevent deleting the last administrator
    if (existing.role === "admin") {
      const allMembers = await this.repository.findAll();
      const adminCount = allMembers.filter((m) => m.role === "admin").length;
      if (adminCount <= 1) {
        throw new Error("Tidak dapat menghapus Administrator terakhir di dalam sistem");
      }
    }

    return this.repository.delete(uid);
  }
}
