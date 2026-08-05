"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { UserProfile } from "@/types";

export function useMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/members", {
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });
      
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      } else {
        setError(result.message || "Gagal memuat anggota");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (email: string, role: "admin" | "member", name: string = "") => {
    if (!user) {
      throw new Error("Pengguna tidak terautentikasi");
    }
    
    const idToken = await user.getIdToken();
    const response = await fetch("/api/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify({ 
        email, 
        role, 
        name: name.trim() || email.split("@")[0],
        photoURL: "" 
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Gagal menambahkan anggota");
    }

    await fetchMembers();
    return result.data;
  };

  const updateMember = async (id: string, role: "admin" | "member") => {
    if (!user) {
      throw new Error("Pengguna tidak terautentikasi");
    }
    
    const idToken = await user.getIdToken();
    const response = await fetch(`/api/members?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify({ role }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Gagal memperbarui role anggota");
    }

    await fetchMembers();
    return result.data;
  };

  const deleteMember = async (id: string) => {
    if (!user) {
      throw new Error("Pengguna tidak terautentikasi");
    }

    const idToken = await user.getIdToken();
    const response = await fetch(`/api/members?id=${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Gagal menghapus anggota");
    }

    await fetchMembers();
  };

  return {
    members,
    loading,
    error,
    refresh: fetchMembers,
    addMember,
    updateMember,
    deleteMember,
  };
}
