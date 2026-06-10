const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../db');
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
    const checkDuplicate = db.prepare(
      'SELECT id FROM transactions WHERE date = ? AND description = ? AND amount = ? LIMIT 1'
    );

    const debitsToCateg = [];
    const debitsToCategIdx = []; // index in `toInsert`
    const toInsert = [];

    for (const t of parsed) {
      const exists = checkDuplicate.get(t.date, t.description, t.amount);
      if (exists) continue;

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

    // Insert all non-duplicate transactions
    const insertStmt = db.prepare(`
      INSERT INTO transactions (date, description, amount, currency, type, category, subcategory, balance, raw_description)
      VALUES (@date, @description, @amount, @currency, @type, @category, @subcategory, @balance, @raw_description)
    `);

    const insertAll = db.transaction((rows) => {
      const inserted = [];
      for (let i = 0; i < rows.length; i++) {
        const t = { ...rows[i] };
        if (categResults[i]) {
          t.category = categResults[i].category;
          t.subcategory = categResults[i].subcategory;
        }
        const info = insertStmt.run(t);
        inserted.push({ ...t, id: info.lastInsertRowid });
      }
      return inserted;
    });

    const inserted = insertAll(toInsert);
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
