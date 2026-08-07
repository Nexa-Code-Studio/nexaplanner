import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  color: z.string().min(3, "Warna harus ditentukan"),
  description: z.string().optional().default(""),
});

export const updateCategorySchema = createCategorySchema.partial();
