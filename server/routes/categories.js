const express = require('express');
const router = express.Router();
const pool = require('../db');

const PROTECTED_CATEGORY = 'Sin categoría';

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, color, emoji } = req.body;
    if (!name || !color || !emoji) {
      return res.status(400).json({ error: 'name, color and emoji are required' });
    }

    const result = await pool.query(
      'INSERT INTO categories (name, color, emoji) VALUES ($1, $2, $3) RETURNING *',
      [name, color, emoji]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, color, emoji } = req.body;
    if (!name || !color || !emoji) {
      return res.status(400).json({ error: 'name, color and emoji are required' });
    }

    const existingResult = await client.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const existing = existingResult.rows[0];

    if (existing.name === PROTECTED_CATEGORY && name !== PROTECTED_CATEGORY) {
      return res.status(400).json({ error: `No se puede renombrar la categoría "${PROTECTED_CATEGORY}"` });
    }

    await client.query('BEGIN');

    const updateResult = await client.query(
      'UPDATE categories SET name = $1, color = $2, emoji = $3 WHERE id = $4 RETURNING *',
      [name, color, emoji, req.params.id]
    );

    if (name !== existing.name) {
      await client.query('UPDATE transactions SET category = $1 WHERE category = $2', [name, existing.name]);
      await client.query('UPDATE budgets SET category = $1 WHERE category = $2', [name, existing.name]);
    }

    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const existingResult = await client.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const existing = existingResult.rows[0];

    if (existing.name === PROTECTED_CATEGORY) {
      return res.status(400).json({ error: `No se puede borrar la categoría "${PROTECTED_CATEGORY}"` });
    }

    await client.query('BEGIN');
    await client.query('UPDATE transactions SET category = $1 WHERE category = $2', [PROTECTED_CATEGORY, existing.name]);
    await client.query('DELETE FROM budgets WHERE category = $1', [existing.name]);
    await client.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');

    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
