import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "member";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: UserRole;
  createdAt: Date | Timestamp;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex (e.g., bg-red-500)
  description?: string;
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface Event {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  location: string;
  color: string; // Tailwind color class (bg-red-500, etc)
  createdBy: string; // user uid
  createdAt: Date | Timestamp;
}

export type ReminderType = "H7" | "H3" | "H1" | "H0";

export interface ReminderLog {
  id: string;
  eventId: string;
  reminderType: ReminderType;
  sentAt: Date | Timestamp;
}
