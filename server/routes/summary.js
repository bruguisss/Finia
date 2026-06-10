const db = require('../db');

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getPreviousMonth(month) {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

module.exports = function summaryHandler(req, res) {
  try {
    const month = req.query.month || getCurrentMonth();
    const prevMonth = getPreviousMonth(month);

    const monthFilter = "strftime('%Y-%m', date) = ?";

    // Totals for current month
    const totals = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as totalExpenses
      FROM transactions WHERE ${monthFilter}
    `).get(month);

    // Previous month expenses
    const prev = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions WHERE type = 'debit' AND ${monthFilter}
    `).get(prevMonth);

    // Top categories
    const topCategories = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE type = 'debit' AND ${monthFilter}
      GROUP BY category
      ORDER BY total DESC
      LIMIT 10
    `).all(month);

    // Daily totals
    const dailyTotals = db.prepare(`
      SELECT
        date,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as expenses,
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as income
      FROM transactions
      WHERE ${monthFilter}
      GROUP BY date
      ORDER BY date ASC
    `).all(month);

    // Category breakdown with percentages
    const totalExpenses = totals.totalExpenses || 1;
    const categoryBreakdown = topCategories.map((c) => ({
      ...c,
      percentage: Math.round((c.total / totalExpenses) * 100),
    }));

    // Recent transactions (last 10)
    const recentTransactions = db.prepare(`
      SELECT * FROM transactions WHERE ${monthFilter}
      ORDER BY date DESC, id DESC LIMIT 10
    `).all(month);

    res.json({
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      balance: totals.totalIncome - totals.totalExpenses,
      previousMonthExpenses: prev.total,
      topCategories,
      dailyTotals,
      categoryBreakdown,
      recentTransactions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
