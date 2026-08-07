import { adminDb } from "@/lib/firebase-admin";
import { UserProfile } from "@/types";

export class MemberRepository {
  private collection = adminDb.collection("users");

  async findAll(): Promise<UserProfile[]> {
    const snapshot = await this.collection.orderBy("name", "asc").get();
    const members: UserProfile[] = [];
    for (const doc of snapshot.docs) {
      members.push(doc.data() as UserProfile);
    }
    return members;
  }

  async findById(uid: string): Promise<UserProfile | null> {
    const docSnap = await this.collection.doc(uid).get();
    if (!docSnap.exists) {
      return null;
    }
    return docSnap.data() as UserProfile;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const snapshot = await this.collection
      .where("email", "==", email.toLowerCase().trim())
      .limit(1)
      .get();
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data() as UserProfile;
  }

  async create(data: Omit<UserProfile, "createdAt">): Promise<string> {
    // If we whitelist by email before they ever log in, we can use a sanitized email string as document ID
    const docId = data.uid || data.email.toLowerCase().trim().replace(/[@.]/g, "_");
    const userDocRef = this.collection.doc(docId);
    
    const emailPrefix = data.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    
    const member: UserProfile = {
      uid: data.uid || docId,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      photoURL: data.photoURL || "",
      role: data.role,
      createdAt: new Date(),
      username: data.username || emailPrefix,
      password: data.password || emailPrefix,
    };
    await userDocRef.set(member);
    return userDocRef.id;
  }

  async update(uid: string, data: Partial<Omit<UserProfile, "uid" | "createdAt">>): Promise<void> {
    const updates: any = { ...data };
    if (data.email) {
      updates.email = data.email.toLowerCase().trim();
    }
    await this.collection.doc(uid).update(updates);
  }

  async delete(uid: string): Promise<void> {
    await this.collection.doc(uid).delete();
  }
}
