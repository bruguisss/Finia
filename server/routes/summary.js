const pool = require('../db');

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getPreviousMonth(month) {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

module.exports = async function summaryHandler(req, res) {
  try {
    const month = req.query.month || getCurrentMonth();
    const prevMonth = getPreviousMonth(month);

    // Totals for current month
    const totalsResult = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as "totalIncome",
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as "totalExpenses"
      FROM transactions WHERE LEFT(date, 7) = $1
    `, [month]);
    const totals = totalsResult.rows[0];

    // Previous month expenses
    const prevResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions WHERE type = 'debit' AND LEFT(date, 7) = $1
    `, [prevMonth]);
    const prev = prevResult.rows[0];

    // Top categories
    const topCategoriesResult = await pool.query(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE type = 'debit' AND LEFT(date, 7) = $1
      GROUP BY category
      ORDER BY total DESC
      LIMIT 10
    `, [month]);
    const topCategories = topCategoriesResult.rows.map((c) => ({
      ...c,
      total: parseFloat(c.total),
      count: parseInt(c.count, 10),
    }));

    // Daily totals
    const dailyTotalsResult = await pool.query(`
      SELECT
        date,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as expenses,
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as income
      FROM transactions
      WHERE LEFT(date, 7) = $1
      GROUP BY date
      ORDER BY date ASC
    `, [month]);
    const dailyTotals = dailyTotalsResult.rows.map((d) => ({
      ...d,
      expenses: parseFloat(d.expenses),
      income: parseFloat(d.income),
    }));

    // Category breakdown with percentages
    const totalExpenses = parseFloat(totals.totalExpenses) || 1;
    const categoryBreakdown = topCategories.map((c) => ({
      ...c,
      percentage: Math.round((c.total / totalExpenses) * 100),
    }));

    // Recent transactions (last 10)
    const recentResult = await pool.query(`
      SELECT * FROM transactions WHERE LEFT(date, 7) = $1
      ORDER BY date DESC, id DESC LIMIT 10
    `, [month]);

    res.json({
      totalIncome: parseFloat(totals.totalIncome),
      totalExpenses: parseFloat(totals.totalExpenses),
      balance: parseFloat(totals.totalIncome) - parseFloat(totals.totalExpenses),
      previousMonthExpenses: parseFloat(prev.total),
      topCategories,
      dailyTotals,
      categoryBreakdown,
      recentTransactions: recentResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
