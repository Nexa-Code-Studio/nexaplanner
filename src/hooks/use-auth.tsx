"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: "admin" | "member";
  createdAt: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Set persistence to session persistence or default local persistence
    setPersistence(auth, browserSessionPersistence).catch((err) => {
      console.warn("Firebase persistence error:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          if (!firebaseUser.email) {
            console.error("No email in google account");
            await signOut(auth);
            setUser(null);
            setProfile(null);
            router.push("/unauthorized");
            setLoading(false);
            return;
          }

          // Fetch ID Token to pass to server-side authentication
          const idToken = await firebaseUser.getIdToken(true);
          
          const response = await fetch("/api/users", {
            headers: {
              "Authorization": `Bearer ${idToken}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setProfile(result.data);
              setUser(firebaseUser);
              
              // If they are on login page, redirect to dashboard
              if (pathname === "/login" || pathname === "/") {
                router.push("/dashboard");
              }
            } else {
              console.warn("User is not authorized in Firestore members list");
              await signOut(auth);
              setUser(null);
              setProfile(null);
              router.push("/unauthorized");
            }
          } else {
            console.warn("Failed to verify user profile from server");
            await signOut(auth);
            setUser(null);
            setProfile(null);
            router.push("/unauthorized");
          }
        } else {
          setUser(null);
          setProfile(null);
          // If not logged in and not on login/unauthorized page, redirect to login
          if (pathname !== "/login" && pathname !== "/unauthorized") {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Auth state synchronization error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in error:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
