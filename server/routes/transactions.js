const express = require('express');
const router = express.Router();
const pool = require('../db');

const CATEGORIES = [
  'Alimentación', 'Transporte', 'Ocio', 'Salud', 'Hogar',
  'Compras', 'Viajes', 'Servicios', 'Transferencias', 'Ingresos', 'Sin categoría',
];

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const { month, category, type, search, limit = 50, offset = 0 } = req.query;

    let where = [];
    const params = [];

    if (month) {
      params.push(month);
      where.push(`LEFT(date, 7) = $${params.length}`);
    }
    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }
    if (type) {
      params.push(type);
      where.push(`type = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`description ILIKE $${params.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM transactions ${whereClause}`, params);

    const limitParam = params.length + 1;
    const offsetParam = params.length + 2;
    const rowsResult = await pool.query(
      `SELECT * FROM transactions ${whereClause} ORDER BY date DESC, id DESC LIMIT $${limitParam} OFFSET $${offsetParam}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ total: parseInt(countResult.rows[0].total, 10), transactions: rowsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/transactions/:id/category
router.put('/:id/category', async (req, res) => {
  try {
    const { category, subcategory } = req.body;
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    const result = await pool.query(
      'UPDATE transactions SET category = $1, subcategory = $2 WHERE id = $3 RETURNING *',
      [category, subcategory || null, req.params.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
