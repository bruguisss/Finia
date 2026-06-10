const express = require('express');
const router = express.Router();
const db = require('../db');

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

// GET /api/budgets
router.get('/', (req, res) => {
  try {
    const month = req.query.month || getCurrentMonth();
    const budgets = db.prepare('SELECT * FROM budgets ORDER BY category').all();

    const enriched = budgets.map((b) => {
      const row = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as spent
        FROM transactions
        WHERE category = ? AND type = 'debit' AND strftime('%Y-%m', date) = ?
      `).get(b.category, month);

      const spent = row.spent;
      const percentage = b.monthly_limit > 0 ? Math.round((spent / b.monthly_limit) * 100) : 0;
      return { ...b, spent, percentage };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets
router.post('/', (req, res) => {
  try {
    const { category, monthly_limit, color } = req.body;
    if (!category || !monthly_limit) {
      return res.status(400).json({ error: 'category and monthly_limit are required' });
    }
    const info = db.prepare(
      'INSERT INTO budgets (category, monthly_limit, color) VALUES (?, ?, ?)'
    ).run(category, parseFloat(monthly_limit), color || '#10b981');

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ ...budget, spent: 0, percentage: 0 });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Budget for this category already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/budgets/:id
router.put('/:id', (req, res) => {
  try {
    const { monthly_limit, color } = req.body;
    const info = db.prepare(
      'UPDATE budgets SET monthly_limit = ?, color = ? WHERE id = ?'
    ).run(parseFloat(monthly_limit), color || '#10b981', req.params.id);

    if (info.changes === 0) return res.status(404).json({ error: 'Budget not found' });
    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
