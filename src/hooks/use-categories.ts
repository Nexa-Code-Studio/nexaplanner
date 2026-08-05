"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { Category } from "@/types";

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/categories", {
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });
      
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        setError(result.message || "Gagal memuat kategori");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (name: string, color: string, description: string = "") => {
    if (!user) throw new Error("Pengguna tidak terautentikasi");
    
    const idToken = await user.getIdToken();
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify({ name, color, description }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Gagal membuat kategori");
    }

    // Refresh categories
    await fetchCategories();
    return result.data;
  };

  const updateCategory = async (id: string, name: string, color: string, description: string = "") => {
    if (!user) throw new Error("Pengguna tidak terautentikasi");
    
    const idToken = await user.getIdToken();
    const response = await fetch(`/api/categories?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify({ name, color, description }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Gagal memperbarui kategori");
    }

    // Refresh categories
    await fetchCategories();
    return result.data;
  };

  const deleteCategory = async (id: string) => {
    if (!user) throw new Error("Pengguna tidak terautentikasi");

    const idToken = await user.getIdToken();
    const response = await fetch(`/api/categories?id=${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Gagal menghapus kategori");
    }

    // Refresh categories
    await fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
