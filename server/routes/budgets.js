const express = require('express');
const router = express.Router();
const pool = require('../db');

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

// GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const month = req.query.month || getCurrentMonth();
    const budgetsResult = await pool.query('SELECT * FROM budgets ORDER BY category');

    const enriched = await Promise.all(budgetsResult.rows.map(async (b) => {
      const spentResult = await pool.query(`
        SELECT COALESCE(SUM(amount), 0) as spent
        FROM transactions
        WHERE category = $1 AND type = 'debit' AND LEFT(date, 7) = $2
      `, [b.category, month]);

      const spent = parseFloat(spentResult.rows[0].spent);
      const percentage = b.monthly_limit > 0 ? Math.round((spent / b.monthly_limit) * 100) : 0;
      return { ...b, spent, percentage };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets
router.post('/', async (req, res) => {
  try {
    const { category, monthly_limit, color } = req.body;
    if (!category || !monthly_limit) {
      return res.status(400).json({ error: 'category and monthly_limit are required' });
    }

    const result = await pool.query(
      'INSERT INTO budgets (category, monthly_limit, color) VALUES ($1, $2, $3) RETURNING *',
      [category, parseFloat(monthly_limit), color || '#10b981']
    );

    res.status(201).json({ ...result.rows[0], spent: 0, percentage: 0 });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Budget for this category already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/budgets/:id
router.put('/:id', async (req, res) => {
  try {
    const { monthly_limit, color } = req.body;
    const result = await pool.query(
      'UPDATE budgets SET monthly_limit = $1, color = $2 WHERE id = $3 RETURNING *',
      [parseFloat(monthly_limit), color || '#10b981', req.params.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM budgets WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
