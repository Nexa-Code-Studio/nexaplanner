import { CategoryRepository } from "@/repositories/category.repository";
import { EventRepository } from "@/repositories/event.repository";
import { Category } from "@/types";

export class CategoryService {
  private repository = new CategoryRepository();
  private eventRepository = new EventRepository();

  async getAllCategories(): Promise<Category[]> {
    return this.repository.findAll();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.repository.findById(id);
  }

  async createCategory(data: Omit<Category, "id" | "createdAt">): Promise<string> {
    // Validate category name uniqueness
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new Error("Nama kategori sudah terdaftar");
    }
    return this.repository.create(data);
  }

  async updateCategory(id: string, data: Partial<Omit<Category, "id" | "createdAt">>): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Kategori tidak ditemukan");
    }

    // Validate category name uniqueness if changed
    if (data.name && data.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await this.repository.findByName(data.name);
      if (duplicate && duplicate.id !== id) {
        throw new Error("Nama kategori sudah terdaftar");
      }
    }

    return this.repository.update(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Kategori tidak ditemukan");
    }

    // Prevent deleting categories that are currently referenced by events
    const referencingEvents = await this.eventRepository.findByCategoryId(id);
    if (referencingEvents.length > 0) {
      throw new Error("Kategori tidak dapat dihapus karena masih digunakan oleh beberapa Event aktif");
    }

    return this.repository.delete(id);
  }
}
