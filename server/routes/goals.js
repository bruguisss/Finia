const express = require('express');
const router = express.Router();
const pool = require('../db');

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

// GET /api/goals
router.get('/', async (req, res) => {
  try {
    const month = getCurrentMonth();
    const goalsResult = await pool.query('SELECT * FROM goals ORDER BY created_at');

    const enriched = await Promise.all(goalsResult.rows.map(async (g) => {
      let current_amount = g.current_amount;
      if (g.type === 'spending') {
        const spentResult = await pool.query(`
          SELECT COALESCE(SUM(amount), 0) as spent
          FROM transactions
          WHERE type = 'debit' AND LEFT(date, 7) = $1
        `, [month]);
        current_amount = parseFloat(spentResult.rows[0].spent);
      }

      const percentage = g.target_amount > 0 ? Math.round((current_amount / g.target_amount) * 100) : 0;
      return { ...g, current_amount, percentage };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals
router.post('/', async (req, res) => {
  try {
    const { name, type, target_amount, current_amount, target_date, color } = req.body;
    if (!name || !type || !target_amount) {
      return res.status(400).json({ error: 'name, type and target_amount are required' });
    }
    if (!['savings', 'spending'].includes(type)) {
      return res.status(400).json({ error: "type must be 'savings' or 'spending'" });
    }

    const result = await pool.query(
      'INSERT INTO goals (name, type, target_amount, current_amount, target_date, color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, type, parseFloat(target_amount), parseFloat(current_amount || 0), target_date || null, color || '#5b6af5']
    );

    res.status(201).json({ ...result.rows[0], percentage: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/goals/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM goals WHERE id = $1', [req.params.id]);
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Goal not found' });
    const current = existing.rows[0];

    const {
      name = current.name,
      target_amount = current.target_amount,
      current_amount = current.current_amount,
      target_date = current.target_date,
      color = current.color,
    } = req.body;

    const result = await pool.query(
      'UPDATE goals SET name = $1, target_amount = $2, current_amount = $3, target_date = $4, color = $5 WHERE id = $6 RETURNING *',
      [name, parseFloat(target_amount), parseFloat(current_amount), target_date, color, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM goals WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Goal not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
