import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3, "Judul event minimal 3 karakter"),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  description: z.string().optional().default(""),
  // Accept both ISO Date string YYYY-MM-DD or standard Date representation
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal mulai harus YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal selesai harus YYYY-MM-DD"),
  location: z.string().optional().default(""),
  color: z.string().optional().default("bg-blue-500"),
});

export const updateEventSchema = createEventSchema.partial();
