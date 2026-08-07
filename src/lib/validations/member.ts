import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["admin", "member"]),
  photoURL: z.string().optional().default(""),
  username: z.string().min(3, "Username minimal 3 karakter").regex(/^[a-z0-9]+$/, "Username harus huruf kecil dan angka saja").optional(),
  password: z.string().min(5, "Password minimal 5 karakter").optional(),
});

export const updateMemberSchema = createMemberSchema.partial();
