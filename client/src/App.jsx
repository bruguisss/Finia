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
    <DataProvider>
      <CategoriesProvider>
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
  );
}
