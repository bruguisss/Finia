const express = require('express');
const multer = require('multer');
const router = express.Router();
const pool = require('../db');
const { parseCSV } = require('../services/csvParser');
const { categorizeTransactions } = require('../services/aiCategorizer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const fileContent = req.file.buffer.toString('utf-8');
    const parsed = parseCSV(fileContent);

    if (parsed.length === 0) {
      return res.json({ imported: 0, skipped: 0, transactions: [] });
    }

    // Identify duplicates
    const debitsToCateg = [];
    const debitsToCategIdx = []; // index in `toInsert`
    const toInsert = [];

    for (const t of parsed) {
      const exists = await pool.query(
        'SELECT id FROM transactions WHERE date = $1 AND description = $2 AND amount = $3 LIMIT 1',
        [t.date, t.description, t.amount]
      );
      if (exists.rows.length > 0) continue;

      const insertIdx = toInsert.length;
      toInsert.push(t);

      if (t.type === 'debit') {
        debitsToCategIdx.push(insertIdx);
        debitsToCateg.push(t);
      }
    }

    // Categorize debits with AI
    let categResults = {};
    if (debitsToCateg.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        const raw = await categorizeTransactions(debitsToCateg);
        // Map results back to toInsert indices
        for (let i = 0; i < debitsToCategIdx.length; i++) {
          const insertIdx = debitsToCategIdx[i];
          if (raw[i]) {
            categResults[insertIdx] = raw[i];
          }
        }
      } catch (err) {
        console.error('AI categorization failed:', err.message);
      }
    }

    // Insert all non-duplicate transactions in a single transaction
    const client = await pool.connect();
    const inserted = [];
    try {
      await client.query('BEGIN');
      for (let i = 0; i < toInsert.length; i++) {
        const t = { ...toInsert[i] };
        if (categResults[i]) {
          t.category = categResults[i].category;
          t.subcategory = categResults[i].subcategory;
        }
        const result = await client.query(`
          INSERT INTO transactions (date, description, amount, currency, type, category, subcategory, balance, raw_description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [t.date, t.description, t.amount, t.currency, t.type, t.category, t.subcategory, t.balance, t.raw_description]);
        inserted.push({ ...t, id: result.rows[0].id });
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const skipped = parsed.length - toInsert.length;

    res.json({
      imported: inserted.length,
      skipped,
      transactions: inserted,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to process file' });
  }
});

module.exports = router;
