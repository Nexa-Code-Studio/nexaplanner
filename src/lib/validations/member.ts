import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["admin", "member"]),
  photoURL: z.string().optional().default(""),
});

export const updateMemberSchema = createMemberSchema.partial();
