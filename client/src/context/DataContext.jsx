import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';

const CacheContext = createContext(null);

export function DataProvider({ children }) {
  const cacheRef = useRef({});
  const [version, setVersion] = useState(0);

  const invalidate = useCallback(() => {
    cacheRef.current = {};
    setVersion((v) => v + 1);
  }, []);

  return (
    <CacheContext.Provider value={{ cacheRef, version, invalidate }}>
      {children}
    </CacheContext.Provider>
  );
}

// Triggers a background refresh of all cached data (e.g. after creating a
// transaction), without forcing a full page reload or skeleton flash.
export function useInvalidateData() {
  const { invalidate } = useContext(CacheContext);
  return invalidate;
}

// Returns cached data for `key` instantly (if present) while `fetcher` refreshes
// it in the background. `loading` is only true the first time `key` is seen.
export function useCachedData(key, fetcher) {
  const { cacheRef, version } = useContext(CacheContext);
  const [activeKey, setActiveKey] = useState(key);
  const [data, setData] = useState(() => cacheRef.current[key]);
  const [loading, setLoading] = useState(cacheRef.current[key] === undefined);

  if (key !== activeKey) {
    setActiveKey(key);
    setData(cacheRef.current[key]);
    setLoading(cacheRef.current[key] === undefined);
  }

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      cacheRef.current[key] = result;
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [key, cacheRef, version]);

  useEffect(() => {
    load();
  }, [load]);

  const mutate = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      cacheRef.current[key] = next;
      return next;
    });
  }, [key, cacheRef]);

  return { data, loading, refresh: load, mutate };
}
