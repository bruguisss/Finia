const express = require('express');
const router = express.Router();
const db = require('../db');

const CATEGORIES = [
  'Alimentación', 'Transporte', 'Ocio', 'Salud', 'Hogar',
  'Compras', 'Viajes', 'Servicios', 'Transferencias', 'Ingresos', 'Sin categoría',
];

// GET /api/transactions
router.get('/', (req, res) => {
  try {
    const { month, category, type, search, limit = 50, offset = 0 } = req.query;

    let where = [];
    const params = {};

    if (month) {
      where.push("strftime('%Y-%m', date) = @month");
      params.month = month;
    }
    if (category) {
      where.push('category = @category');
      params.category = category;
    }
    if (type) {
      where.push('type = @type');
      params.type = type;
    }
    if (search) {
      where.push('description LIKE @search');
      params.search = `%${search}%`;
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM transactions ${whereClause}`).get(params);
    const rows = db.prepare(
      `SELECT * FROM transactions ${whereClause} ORDER BY date DESC, id DESC LIMIT @limit OFFSET @offset`
    ).all({ ...params, limit: parseInt(limit), offset: parseInt(offset) });

    res.json({ total: countRow.total, transactions: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/transactions/:id/category
router.put('/:id/category', (req, res) => {
  try {
    const { category, subcategory } = req.body;
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    const info = db.prepare(
      'UPDATE transactions SET category = ?, subcategory = ? WHERE id = ?'
    ).run(category, subcategory || null, req.params.id);

    if (info.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
