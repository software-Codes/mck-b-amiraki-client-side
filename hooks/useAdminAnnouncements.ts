import { useState } from "react";
import axios from "axios";
import { Announcement } from "@/types/annoucements";

interface UseAdminAnnouncementsReturn {
  loading: boolean;
  error: string | null;
  createAnnouncement: (title: string, content: string) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;
  updateAnnouncement: (
    id: string,
    data: Partial<Announcement>
  ) => Promise<Announcement>;
}

export const useAdminAnnouncements = (): UseAdminAnnouncementsReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createAnnouncement = async (
    title: string,
    content: string
  ): Promise<Announcement> => {
    try {
      setLoading(true);
      const response = await axios.post<{ data: Announcement }>(
        "/api/announcements",
        { title, content }
      );
      return response.data.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await axios.delete(`/api/announcements/${id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAnnouncement = async (
    id: string,
    data: Partial<Announcement>
  ): Promise<Announcement> => {
    try {
      setLoading(true);
      const response = await axios.put<{ data: Announcement }>(
        `/api/announcements/${id}`,
        data
      );
      return response.data.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnouncement,
  };
};
