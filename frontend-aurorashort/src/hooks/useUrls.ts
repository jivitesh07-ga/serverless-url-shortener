import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import type { CreateUrlRequest, CreateUrlResponse, UrlRecord } from '../types/url';

interface UseUrlsResult {
  urls: UrlRecord[];
  isLoading: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;
  addUrlOptimistically: (record: UrlRecord) => void;
  removeUrl: (shortCode: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  deletingCodes: Set<string>;
}

/** Loads and manages the visitor's own shortened URLs (scoped by ownerToken). */
export function useUrls(ownerToken: string): UseUrlsResult {
  const [urls, setUrls] = useState<UrlRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingCodes, setDeletingCodes] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { urls: fetched } = await api.getUrls(ownerToken);
      setUrls(fetched);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Unable to load your URLs.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [ownerToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial mount-time fetch is intentional
    void refresh();
  }, [refresh]);

  const addUrlOptimistically = useCallback((record: UrlRecord) => {
    setUrls((prev) => [record, ...prev]);
  }, []);

  const removeUrl = useCallback(
    async (shortCode: string) => {
      setDeletingCodes((prev) => new Set(prev).add(shortCode));
      try {
        await api.deleteUrl(shortCode, ownerToken);
        setUrls((prev) => prev.filter((u) => u.shortCode !== shortCode));
        return { ok: true as const };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof ApiError ? err.message : 'Unable to delete this link.',
        };
      } finally {
        setDeletingCodes((prev) => {
          const next = new Set(prev);
          next.delete(shortCode);
          return next;
        });
      }
    },
    [ownerToken],
  );

  return { urls, isLoading, loadError, refresh, addUrlOptimistically, removeUrl, deletingCodes };
}

/** Converts a successful create response into a full UrlRecord for optimistic list insertion. */
export function createResponseToRecord(
  response: CreateUrlResponse,
  request: CreateUrlRequest,
): UrlRecord {
  return {
    shortCode: response.shortCode,
    shortUrl: response.shortUrl,
    originalUrl: response.originalUrl,
    alias: request.alias,
    createdAt: response.createdAt,
    expiresAt: response.expiresAt ?? null,
    clickCount: 0,
    lastAccessedAt: null,
    threatStatus: response.threatStatus,
    status: response.status === 'created' ? 'active' : response.status,
  };
}
