import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCategories } from '../api.js';

export const DEFAULT_COLOR = '#3d3d4d';
export const DEFAULT_EMOJI = '❓';

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getCategories();
    setCategories(data);
    return data;
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const getCategory = useCallback(
    (name) => categories.find((c) => c.name === name),
    [categories]
  );

  return (
    <CategoriesContext.Provider value={{ categories, loading, refresh, getCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategories must be used within a CategoriesProvider');
  return ctx;
}
