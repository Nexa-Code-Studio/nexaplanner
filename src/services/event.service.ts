import { EventRepository } from "@/repositories/event.repository";
import { CategoryRepository } from "@/repositories/category.repository";
import { Event } from "@/types";

export interface CreateEventInput {
  title: string;
  categoryId: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  color?: string;
  createdBy: string;
}

export type UpdateEventInput = Partial<Omit<CreateEventInput, "createdBy">>;

function convertToDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  // Handle Firestore Timestamp
  if (value.toDate && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date();
}

export class EventService {
  private repository = new EventRepository();
  private categoryRepository = new CategoryRepository();

  async getAllEvents(): Promise<Event[]> {
    return this.repository.findAll();
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.repository.findById(id);
  }

  async createEvent(data: CreateEventInput): Promise<string> {
    // Validate category exists
    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new Error("Kategori event tidak valid atau tidak ditemukan");
    }
    
    // Ensure start date is <= end date
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start > end) {
      throw new Error("Tanggal mulai tidak boleh melebihi tanggal selesai");
    }

    return this.repository.create({
      title: data.title,
      categoryId: data.categoryId,
      description: data.description || "",
      startDate: start,
      endDate: end,
      location: data.location || "",
      color: data.color || "bg-blue-500",
      createdBy: data.createdBy,
    });
  }

  async updateEvent(id: string, data: UpdateEventInput): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Event tidak ditemukan");
    }

    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new Error("Kategori event tidak valid atau tidak ditemukan");
      }
    }

    // Validate dates if updated
    const start = data.startDate ? new Date(data.startDate) : convertToDate(existing.startDate);
    const end = data.endDate ? new Date(data.endDate) : convertToDate(existing.endDate);
    
    if (start > end) {
      throw new Error("Tanggal mulai tidak boleh melebihi tanggal selesai");
    }

    // Map properties from UpdateEventInput to Firestore Event entity updates
    const updates: Partial<Omit<Event, "id" | "createdAt">> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
    if (data.description !== undefined) updates.description = data.description;
    if (data.startDate !== undefined) updates.startDate = start;
    if (data.endDate !== undefined) updates.endDate = end;
    if (data.location !== undefined) updates.location = data.location;
    if (data.color !== undefined) updates.color = data.color;

    return this.repository.update(id, updates);
  }

  async deleteEvent(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Event tidak ditemukan");
    }
    return this.repository.delete(id);
  }
}
