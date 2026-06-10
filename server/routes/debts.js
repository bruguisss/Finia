const express = require('express');
const router = express.Router();
const pool = require('../db');

function deriveStatus(amount, amountPaid) {
  if (amountPaid <= 0) return 'pending';
  if (amountPaid >= amount) return 'paid';
  return 'partial';
}

// GET /api/debts/summary
router.get('/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const owedByMe = await pool.query(`
      SELECT COALESCE(SUM(amount - amount_paid), 0) as total
      FROM debts WHERE type = 'owed_by_me' AND status != 'paid'
    `);

    const owedToMe = await pool.query(`
      SELECT COALESCE(SUM(amount - amount_paid), 0) as total
      FROM debts WHERE type = 'owed_to_me' AND status != 'paid'
    `);

    const overdue = await pool.query(`
      SELECT COUNT(*) as count
      FROM debts WHERE status != 'paid' AND date_due IS NOT NULL AND date_due < $1
    `, [today]);

    res.json({
      totalOwedByMe: parseFloat(owedByMe.rows[0].total),
      totalOwedToMe: parseFloat(owedToMe.rows[0].total),
      overdueCount: parseInt(overdue.rows[0].count, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/debts
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM debts WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    query += ' ORDER BY (date_due IS NULL), date_due ASC, date_created DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/debts
router.post('/', async (req, res) => {
  try {
    const { type, person, description, amount, currency, date_created, date_due, notes } = req.body;

    if (!type || !['owed_by_me', 'owed_to_me'].includes(type)) {
      return res.status(400).json({ error: 'type must be owed_by_me or owed_to_me' });
    }
    if (!person || !amount || !date_created) {
      return res.status(400).json({ error: 'person, amount and date_created are required' });
    }

    const result = await pool.query(`
      INSERT INTO debts (type, person, description, amount, currency, date_created, date_due, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      type,
      person,
      description || null,
      parseFloat(amount),
      (currency || 'EUR').toUpperCase(),
      date_created,
      date_due || null,
      notes || null,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/debts/:id
router.put('/:id', async (req, res) => {
  try {
    const existingResult = await pool.query('SELECT * FROM debts WHERE id = $1', [req.params.id]);
    const existing = existingResult.rows[0];
    if (!existing) return res.status(404).json({ error: 'Debt not found' });

    const {
      type = existing.type,
      person = existing.person,
      description = existing.description,
      amount = existing.amount,
      currency = existing.currency,
      date_created = existing.date_created,
      date_due = existing.date_due,
      amount_paid = existing.amount_paid,
      notes = existing.notes,
      status,
    } = req.body;

    const finalAmount = parseFloat(amount);
    const finalAmountPaid = parseFloat(amount_paid);
    const finalStatus = status || deriveStatus(finalAmount, finalAmountPaid);

    const result = await pool.query(`
      UPDATE debts SET type = $1, person = $2, description = $3, amount = $4, currency = $5,
        date_created = $6, date_due = $7, amount_paid = $8, status = $9, notes = $10
      WHERE id = $11
      RETURNING *
    `, [
      type,
      person,
      description || null,
      finalAmount,
      (currency || 'EUR').toUpperCase(),
      date_created,
      date_due || null,
      finalAmountPaid,
      finalStatus,
      notes || null,
      req.params.id,
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/debts/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM debts WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Debt not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
