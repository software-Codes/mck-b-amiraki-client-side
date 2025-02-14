import { useState, useEffect } from 'react';
import axios from 'axios';
import { Announcement, AnnouncementsResponse } from '@/types/annoucements';

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => Promise<void>;
}

export const useAnnouncements = (): UseAnnouncementsReturn => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchAnnouncements = async (pageNum: number = 1): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: AnnouncementsResponse }>(
        `/api/announcements?page=${pageNum}&limit=10`
      );
      const { data } = response.data;
      
      if (pageNum === 1) {
        setAnnouncements(data.annoucements);
      } else {
        setAnnouncements(prev => [...prev, ...data.annoucements]);
      }
      
      setHasMore(pageNum < data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = (): void => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchAnnouncements(page);
  }, [page]);

  return { 
    announcements, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refetch: () => fetchAnnouncements(1) 
  };
};