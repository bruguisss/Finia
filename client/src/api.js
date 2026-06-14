const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(BASE + url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Transactions
export const getTransactions = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  return request(`/transactions${qs ? `?${qs}` : ''}`);
};

export const deleteTransaction = (id) =>
  request(`/transactions/${id}`, { method: 'DELETE' });

export const updateTransactionCategory = (id, category, subcategory = null) =>
  request(`/transactions/${id}/category`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, subcategory }),
  });

// Summary
export const getSummary = (month) =>
  request(`/summary${month ? `?month=${month}` : ''}`);

// Budgets
export const getBudgets = (month) =>
  request(`/budgets${month ? `?month=${month}` : ''}`);

export const createBudget = (data) =>
  request('/budgets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const updateBudget = (id, data) =>
  request(`/budgets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteBudget = (id) =>
  request(`/budgets/${id}`, { method: 'DELETE' });

// Debts
export const getDebts = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  return request(`/debts${qs ? `?${qs}` : ''}`);
};

export const getDebtsSummary = () => request('/debts/summary');

export const createDebt = (data) =>
  request('/debts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const updateDebt = (id, data) =>
  request(`/debts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteDebt = (id) =>
  request(`/debts/${id}`, { method: 'DELETE' });

// Categories
export const getCategories = () => request('/categories');

export const createCategory = (data) =>
  request('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const updateCategory = (id, data) =>
  request(`/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteCategory = (id) =>
  request(`/categories/${id}`, { method: 'DELETE' });

// Upload
export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request('/upload', { method: 'POST', body: formData });
};

// Analytics helpers
export const getMonthlyTrend = async () => {
  // Get last 6 months of data
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  const results = await Promise.all(months.map((m) => getSummary(m)));
  return months.map((month, i) => ({
    month,
    income: results[i].totalIncome,
    expenses: results[i].totalExpenses,
    categoryBreakdown: results[i].categoryBreakdown,
  }));
};
