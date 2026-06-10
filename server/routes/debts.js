const express = require('express');
const router = express.Router();
const db = require('../db');

function deriveStatus(amount, amountPaid) {
  if (amountPaid <= 0) return 'pending';
  if (amountPaid >= amount) return 'paid';
  return 'partial';
}

// GET /api/debts/summary
router.get('/summary', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const owedByMe = db.prepare(`
      SELECT COALESCE(SUM(amount - amount_paid), 0) as total
      FROM debts WHERE type = 'owed_by_me' AND status != 'paid'
    `).get();

    const owedToMe = db.prepare(`
      SELECT COALESCE(SUM(amount - amount_paid), 0) as total
      FROM debts WHERE type = 'owed_to_me' AND status != 'paid'
    `).get();

    const overdue = db.prepare(`
      SELECT COUNT(*) as count
      FROM debts WHERE status != 'paid' AND date_due IS NOT NULL AND date_due < ?
    `).get(today);

    res.json({
      totalOwedByMe: owedByMe.total,
      totalOwedToMe: owedToMe.total,
      overdueCount: overdue.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/debts
router.get('/', (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM debts WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    query += ' ORDER BY (date_due IS NULL), date_due ASC, date_created DESC';

    const debts = db.prepare(query).all(...params);
    res.json(debts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/debts
router.post('/', (req, res) => {
  try {
    const { type, person, description, amount, currency, date_created, date_due, notes } = req.body;

    if (!type || !['owed_by_me', 'owed_to_me'].includes(type)) {
      return res.status(400).json({ error: 'type must be owed_by_me or owed_to_me' });
    }
    if (!person || !amount || !date_created) {
      return res.status(400).json({ error: 'person, amount and date_created are required' });
    }

    const info = db.prepare(`
      INSERT INTO debts (type, person, description, amount, currency, date_created, date_due, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      type,
      person,
      description || null,
      parseFloat(amount),
      (currency || 'EUR').toUpperCase(),
      date_created,
      date_due || null,
      notes || null
    );

    const debt = db.prepare('SELECT * FROM debts WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(debt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/debts/:id
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM debts WHERE id = ?').get(req.params.id);
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

    db.prepare(`
      UPDATE debts SET type = ?, person = ?, description = ?, amount = ?, currency = ?,
        date_created = ?, date_due = ?, amount_paid = ?, status = ?, notes = ?
      WHERE id = ?
    `).run(
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
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM debts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/debts/:id
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM debts WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Debt not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
