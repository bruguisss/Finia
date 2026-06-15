const express = require('express');
const router = express.Router();
const pool = require('../db');

// Computes the occurrence dates of a planned expense within a given month (YYYY-MM)
function getOccurrenceDates(expense, month) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const nextMonth = expense.next_date.slice(0, 7);
  const nextDay = parseInt(expense.next_date.slice(8, 10), 10);
  const nextMonthNum = parseInt(expense.next_date.slice(5, 7), 10);

  if (expense.frequency === 'once') {
    return nextMonth === month ? [expense.next_date.slice(0, 10)] : [];
  }
  if (expense.frequency === 'monthly') {
    if (nextMonth > month) return [];
    const day = Math.min(nextDay, daysInMonth);
    return [`${month}-${String(day).padStart(2, '0')}`];
  }
  if (expense.frequency === 'weekly') {
    const start = new Date(`${expense.next_date.slice(0, 10)}T00:00:00Z`);
    const occurrences = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(Date.UTC(y, m - 1, day));
      if (current < start) continue;
      const diffDays = Math.round((current - start) / 86400000);
      if (diffDays % 7 === 0) {
        occurrences.push(`${month}-${String(day).padStart(2, '0')}`);
      }
    }
    return occurrences;
  }
  if (expense.frequency === 'yearly') {
    if (nextMonthNum !== m || nextMonth > month) return [];
    const day = Math.min(nextDay, daysInMonth);
    return [`${month}-${String(day).padStart(2, '0')}`];
  }
  return [];
}

// GET /api/planned-expenses
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM planned_expenses ORDER BY next_date');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/planned-expenses/occurrences?month=YYYY-MM
router.get('/occurrences', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const result = await pool.query('SELECT * FROM planned_expenses WHERE active = true');

    const occurrences = [];
    for (const expense of result.rows) {
      for (const date of getOccurrenceDates(expense, month)) {
        occurrences.push({
          id: expense.id,
          name: expense.name,
          amount: parseFloat(expense.amount),
          category: expense.category,
          date,
        });
      }
    }

    res.json(occurrences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/planned-expenses
router.post('/', async (req, res) => {
  try {
    const { name, amount, category, frequency, next_date, active, notes } = req.body;
    if (!name || !amount || !next_date) {
      return res.status(400).json({ error: 'name, amount and next_date are required' });
    }
    if (frequency && !['once', 'monthly', 'weekly', 'yearly'].includes(frequency)) {
      return res.status(400).json({ error: "frequency must be 'once', 'monthly', 'weekly' or 'yearly'" });
    }

    const result = await pool.query(
      'INSERT INTO planned_expenses (name, amount, category, frequency, next_date, active, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, parseFloat(amount), category || 'Sin categoría', frequency || 'monthly', next_date, active !== undefined ? active : true, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/planned-expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM planned_expenses WHERE id = $1', [req.params.id]);
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Planned expense not found' });
    const current = existing.rows[0];

    const {
      name = current.name,
      amount = current.amount,
      category = current.category,
      frequency = current.frequency,
      next_date = current.next_date,
      active = current.active,
      notes = current.notes,
    } = req.body;

    const result = await pool.query(
      'UPDATE planned_expenses SET name = $1, amount = $2, category = $3, frequency = $4, next_date = $5, active = $6, notes = $7 WHERE id = $8 RETURNING *',
      [name, parseFloat(amount), category, frequency, next_date, active, notes, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/planned-expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM planned_expenses WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Planned expense not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
