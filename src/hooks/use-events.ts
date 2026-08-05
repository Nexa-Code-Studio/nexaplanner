"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { Event } from "@/types";

export interface CreateEventParams {
  title: string;
  categoryId: string;
  description: string;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  location: string;
  color: string;
}

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/events", {
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });
      
      const result = await response.json();
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.message || "Gagal memuat event");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (params: CreateEventParams) => {
    if (!user) throw new Error("Pengguna tidak terautentikasi");
    
    const idToken = await user.getIdToken();
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Gagal membuat event");
    }

    await fetchEvents();
    return result.data;
  };

  const updateEvent = async (id: string, params: Partial<CreateEventParams>) => {
    if (!user) throw new Error("Pengguna tidak terautentikasi");
    
    const idToken = await user.getIdToken();
    const response = await fetch(`/api/events?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Gagal memperbarui event");
    }

    await fetchEvents();
    return result.data;
  };

  const deleteEvent = async (id: string) => {
    if (!user) throw new Error("Pengguna tidak terautentikasi");

    const idToken = await user.getIdToken();
    const response = await fetch(`/api/events?id=${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Gagal menghapus event");
    }

    await fetchEvents();
  };

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
