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
  const navigate = (newPage) => setPage(newPage);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFadingOut(true), 1800);
    const removeTimer = setTimeout(() => setShowSplash(false), 2100);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const pages = {
    dashboard: <Dashboard onNavigate={navigate} />,
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
        {/* Mesh gradient orbs — z:-1 stays behind all content, no stacking context issues */}
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: '75vw', height: '75vw', maxWidth: 400, maxHeight: 400, top: '-10%', right: '-15%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.30) 0%, transparent 70%)', filter: 'blur(70px)' }} />
          <div style={{ position: 'absolute', width: '65vw', height: '65vw', maxWidth: 340, maxHeight: 340, bottom: '10%', left: '-15%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.20) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', width: '55vw', height: '55vw', maxWidth: 280, maxHeight: 280, top: '38%', left: '15%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,150,80,0.10) 0%, transparent 70%)', filter: 'blur(100px)' }} />
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
        <Layout currentPage={page} onNavigate={navigate}>
          {pages[page] || pages.dashboard}
        </Layout>
      </CategoriesProvider>
    </DataProvider>
    </ThemeProvider>
  );
}
