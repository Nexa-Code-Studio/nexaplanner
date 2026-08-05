import { adminDb } from "@/lib/firebase-admin";
import { Category } from "@/types";

export class CategoryRepository {
  private collection = adminDb.collection("categories");

  async findAll(): Promise<Category[]> {
    const snapshot = await this.collection.orderBy("name", "asc").get();
    const categories: Category[] = [];
    for (const doc of snapshot.docs) {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    }
    return categories;
  }

  async findById(id: string): Promise<Category | null> {
    const docSnap = await this.collection.doc(id).get();
    if (!docSnap.exists) {
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as Category;
  }

  async findByName(name: string): Promise<Category | null> {
    const snapshot = await this.collection
      .where("name", "==", name.trim())
      .limit(1)
      .get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Category;
  }

  async create(data: Omit<Category, "id" | "createdAt">): Promise<string> {
    const newDoc = this.collection.doc();
    const category: Category = {
      id: newDoc.id,
      ...data,
      createdAt: new Date(),
    };
    await newDoc.set(category);
    return newDoc.id;
  }

  async update(id: string, data: Partial<Omit<Category, "id" | "createdAt">>): Promise<void> {
    await this.collection.doc(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
