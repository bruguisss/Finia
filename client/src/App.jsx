import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Analytics from './pages/Analytics.jsx';
import Budgets from './pages/Budgets.jsx';
import Planning from './pages/Planning.jsx';
import Debts from './pages/Debts.jsx';
import Categories from './pages/Categories.jsx';
import { CategoriesProvider } from './context/CategoriesContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadingOut, setSplashFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFadingOut(true), 1800);
    const removeTimer = setTimeout(() => setShowSplash(false), 2100);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    transactions: <Transactions />,
    analytics: <Analytics />,
    budgets: <Budgets />,
    planning: <Planning />,
    debts: <Debts />,
    categories: <Categories />,
  };

  return (
    <ThemeProvider>
    <DataProvider>
      <CategoriesProvider>
        {/* Mesh gradient orbs */}
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: '70vw', height: '70vw', maxWidth: 380, maxHeight: 380, top: '-8%', right: '-12%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.22) 0%, transparent 70%)', filter: 'blur(72px)' }} />
          <div style={{ position: 'absolute', width: '60vw', height: '60vw', maxWidth: 320, maxHeight: 320, bottom: '12%', left: '-12%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.14) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', width: '50vw', height: '50vw', maxWidth: 260, maxHeight: 260, top: '40%', left: '20%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,150,80,0.07) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        </div>
        <svg aria-hidden="true" style={{ display: 'none', position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <filter id="glass-refract" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.008" numOctaves="3" seed="42" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="glass-refract-strong" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.008" numOctaves="3" seed="42" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="48" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        {showSplash && <SplashScreen fadingOut={splashFadingOut} />}
        <Layout currentPage={page} onNavigate={setPage}>
          {pages[page] || pages.dashboard}
        </Layout>
      </CategoriesProvider>
    </DataProvider>
    </ThemeProvider>
  );
}
