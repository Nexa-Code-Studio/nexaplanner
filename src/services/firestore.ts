import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, Category, Event, ReminderLog, UserRole } from "@/types";

// ==========================================
// USERS SERVICE
// ==========================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const docRef = doc(db, "users", profile.uid);
  await setDoc(docRef, profile);
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { role });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const colRef = collection(db, "users");
  const q = query(colRef, orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);
  const users: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    users.push(doc.data() as UserProfile);
  });
  return users;
}

// ==========================================
// CATEGORIES SERVICE
// ==========================================

export async function getCategories(): Promise<Category[]> {
  const colRef = collection(db, "categories");
  const q = query(colRef, orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);
  const categories: Category[] = [];
  querySnapshot.forEach((doc) => {
    categories.push({ id: doc.id, ...doc.data() } as Category);
  });
  return categories;
}

export async function createCategory(category: Omit<Category, "id">): Promise<string> {
  const colRef = collection(db, "categories");
  const docRef = await addDoc(colRef, category);
  return docRef.id;
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, "id">>): Promise<void> {
  const docRef = doc(db, "categories", id);
  await updateDoc(docRef, updates);
}

export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, "categories", id);
  await deleteDoc(docRef);
}

// ==========================================
// EVENTS SERVICE
// ==========================================

export async function getEvents(): Promise<Event[]> {
  const colRef = collection(db, "events");
  const q = query(colRef, orderBy("startDate", "asc"));
  const querySnapshot = await getDocs(q);
  const events: Event[] = [];
  querySnapshot.forEach((doc) => {
    events.push({ id: doc.id, ...doc.data() } as Event);
  });
  return events;
}

export async function createEvent(event: Omit<Event, "id">): Promise<string> {
  const colRef = collection(db, "events");
  const docRef = await addDoc(colRef, event);
  return docRef.id;
}

export async function updateEvent(id: string, updates: Partial<Omit<Event, "id">>): Promise<void> {
  const docRef = doc(db, "events", id);
  await updateDoc(docRef, updates);
}

export async function deleteEvent(id: string): Promise<void> {
  const docRef = doc(db, "events", id);
  await deleteDoc(docRef);
}

export async function importEvents(eventsList: Omit<Event, "id">[]): Promise<void> {
  // Batch write or sequential write skeleton
  for (const event of eventsList) {
    await createEvent(event);
  }
}

// ==========================================
// REMINDER LOGS SERVICE
// ==========================================

export async function getReminderLogs(eventId: string): Promise<ReminderLog[]> {
  const colRef = collection(db, "reminder_logs");
  const q = query(colRef, where("eventId", "==", eventId), orderBy("sentAt", "desc"));
  const querySnapshot = await getDocs(q);
  const logs: ReminderLog[] = [];
  querySnapshot.forEach((doc) => {
    logs.push({ id: doc.id, ...doc.data() } as ReminderLog);
  });
  return logs;
}

export async function logReminder(log: Omit<ReminderLog, "id">): Promise<string> {
  const colRef = collection(db, "reminder_logs");
  const docRef = await addDoc(colRef, log);
  return docRef.id;
}
