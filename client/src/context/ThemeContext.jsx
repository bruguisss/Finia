import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(
    () => localStorage.getItem('finia-theme') || 'system'
  );
  const [systemDark, setSystemDark] = useState(getSystemDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = preference === 'dark' || (preference === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const setTheme = (pref) => {
    setPreference(pref);
    localStorage.setItem('finia-theme', pref);
  };

  return (
    <ThemeContext.Provider value={{ preference, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
