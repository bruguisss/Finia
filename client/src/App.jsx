import React, { useState } from 'react';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Analytics from './pages/Analytics.jsx';
import Budgets from './pages/Budgets.jsx';

export default function App() {
  const [page, setPage] = useState('dashboard');

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    transactions: <Transactions />,
    analytics: <Analytics />,
    budgets: <Budgets />,
  };

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {pages[page] || pages.dashboard}
    </Layout>
  );
}
