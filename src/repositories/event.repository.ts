import { adminDb } from "@/lib/firebase-admin";
import { Event } from "@/types";

export class EventRepository {
  private collection = adminDb.collection("events");

  async findAll(): Promise<Event[]> {
    const snapshot = await this.collection.orderBy("startDate", "asc").get();
    const events: Event[] = [];
    for (const doc of snapshot.docs) {
      events.push({ id: doc.id, ...doc.data() } as Event);
    }
    return events;
  }

  async findById(id: string): Promise<Event | null> {
    const docSnap = await this.collection.doc(id).get();
    if (!docSnap.exists) {
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as Event;
  }

  async findByCategoryId(categoryId: string): Promise<Event[]> {
    const snapshot = await this.collection
      .where("categoryId", "==", categoryId)
      .limit(1)
      .get();
    const events: Event[] = [];
    for (const doc of snapshot.docs) {
      events.push({ id: doc.id, ...doc.data() } as Event);
    }
    return events;
  }

  async create(data: Omit<Event, "id" | "createdAt">): Promise<string> {
    const newDoc = this.collection.doc();
    
    // Parse Dates correctly (if they are string, we convert to date objects for backend representation)
    const startDateObj = typeof data.startDate === "string" ? new Date(data.startDate) : data.startDate;
    const endDateObj = typeof data.endDate === "string" ? new Date(data.endDate) : data.endDate;

    const event: Event = {
      id: newDoc.id,
      ...data,
      startDate: startDateObj,
      endDate: endDateObj,
      createdAt: new Date(),
    };
    await newDoc.set(event);
    return newDoc.id;
  }

  async update(id: string, data: Partial<Omit<Event, "id" | "createdAt">>): Promise<void> {
    const updates: any = { ...data };
    
    if (data.startDate && typeof data.startDate === "string") {
      updates.startDate = new Date(data.startDate);
    }
    if (data.endDate && typeof data.endDate === "string") {
      updates.endDate = new Date(data.endDate);
    }

    await this.collection.doc(id).update(updates);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
