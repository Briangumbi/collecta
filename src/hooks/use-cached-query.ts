import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getCached, setCached } from '@/lib/cache';

interface UseCachedQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isOffline: boolean;
  isFromCache: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads a cached value immediately (if present), then attempts a live fetch.
 * On success the fetch result replaces the cache. On failure, cached data
 * stays on screen with an `isOffline` flag instead of failing silently — the
 * caller is expected to render an "offline — showing cached data" banner.
 */
export function useCachedQuery<T>(cacheKey: string, fetcher: () => Promise<T>): UseCachedQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(async () => {
    const cached = await getCached<T>(cacheKey);
    if (cached) {
      setData(cached.value);
      setIsFromCache(true);
      setIsLoading(false);
    }

    try {
      const fresh = await fetcherRef.current();
      setData(fresh);
      setIsFromCache(false);
      setIsOffline(false);
      setError(null);
      await setCached(cacheKey, fresh);
    } catch (err) {
      if (cached) {
        setIsOffline(true);
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && isOffline) {
        load();
      }
    });
    return unsubscribe;
  }, [isOffline, load]);

  return { data, isLoading, isOffline, isFromCache, error, refetch: load };
}
