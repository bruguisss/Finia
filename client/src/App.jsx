import React, { useState } from 'react';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Analytics from './pages/Analytics.jsx';
import Budgets from './pages/Budgets.jsx';
import Debts from './pages/Debts.jsx';
import Categories from './pages/Categories.jsx';
import { CategoriesProvider } from './context/CategoriesContext.jsx';

export default function App() {
  const [page, setPage] = useState('dashboard');

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    transactions: <Transactions />,
    analytics: <Analytics />,
    budgets: <Budgets />,
    debts: <Debts />,
    categories: <Categories />,
  };

  return (
    <CategoriesProvider>
      <Layout currentPage={page} onNavigate={setPage}>
        {pages[page] || pages.dashboard}
      </Layout>
    </CategoriesProvider>
  );
}
