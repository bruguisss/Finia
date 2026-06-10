const Papa = require('papaparse');

// Normalize header names to a canonical form
function normalizeHeader(header) {
  return header.trim().toLowerCase()
    .replace(/[áà]/g, 'a')
    .replace(/[éè]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óò]/g, 'o')
    .replace(/[úù]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, '_');
}

// Map normalized header → canonical field name
const HEADER_MAP = {
  'type': 'type',
  'tipo': 'type',
  'product': 'product',
  'producto': 'product',
  'started_date': 'started_date',
  'fecha_de_inicio': 'started_date',
  'completed_date': 'completed_date',
  'fecha_de_finalizacion': 'completed_date',
  'description': 'description',
  'descripcion': 'description',
  'amount': 'amount',
  'importe': 'amount',
  'fee': 'fee',
  'comision': 'fee',
  'currency': 'currency',
  'moneda': 'currency',
  'state': 'state',
  'estado': 'state',
  'balance': 'balance',
  'saldo': 'balance',
};

// Header signature for the "Consolidated Statement" CSV export
const CONSOLIDATED_HEADERS = [
  'date', 'description', 'category', 'money in/out', 'balance', 'tax withheld', 'other taxes', 'fees',
];

const MONTHS = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function parseDate(dateStr) {
  if (!dateStr) return null;
  // Handle formats: "2024-01-15 12:34:56", "2024-01-15T12:34:56", "15/01/2024"
  const clean = dateStr.trim();
  // ISO-like with space or T separator
  const isoMatch = clean.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  // DD/MM/YYYY
  const euMatch = clean.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (euMatch) return `${euMatch[3]}-${euMatch[2]}-${euMatch[1]}`;
  return null;
}

// Parse "Jan 2, 2026" style dates from the Consolidated Statement export
function parseConsolidatedDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.trim().match(/^([A-Za-z]{3})[a-z]*\s+(\d{1,2}),\s*(\d{4})$/);
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  if (!month) return null;
  const day = match[2].padStart(2, '0');
  return `${match[3]}-${month}-${day}`;
}

// Parse amounts like "-€18.04" or "€482.15" from the Consolidated Statement export
function parseEuroAmount(str) {
  if (!str) return NaN;
  const cleaned = str.replace(/[€\s]/g, '').replace(/,/g, '');
  return parseFloat(cleaned);
}

function detectDelimiter(text) {
  const firstLine = text.split('\n')[0];
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  return semicolons > commas ? ';' : ',';
}

function isConsolidatedHeaderRow(cells) {
  if (cells.length < CONSOLIDATED_HEADERS.length) return false;
  return CONSOLIDATED_HEADERS.every((h, i) => (cells[i] || '').trim().toLowerCase() === h);
}

// Standard Revolut account export: single header row, one section, "State" column
function parseStandardExport(rows) {
  const headerRow = rows[0].map((h) => {
    const norm = normalizeHeader(h);
    return HEADER_MAP[norm] || norm;
  });
  const colIndex = {};
  headerRow.forEach((h, i) => { colIndex[h] = i; });

  const completedStates = new Set(['completed', 'completado']);
  const transactions = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const get = (key) => (colIndex[key] !== undefined ? (row[colIndex[key]] || '') : '');

    const state = get('state').trim().toLowerCase();
    if (!completedStates.has(state)) continue;

    const rawAmount = get('amount').toString().replace(',', '.').trim();
    const amount = parseFloat(rawAmount);
    if (isNaN(amount)) continue;

    const date = parseDate(get('completed_date') || get('started_date'));
    if (!date) continue;

    const description = get('description').trim();
    if (!description) continue;

    const currency = (get('currency') || 'EUR').trim().toUpperCase();
    const type = amount < 0 ? 'debit' : 'credit';
    const balanceRaw = get('balance');
    const balance = balanceRaw ? parseFloat(balanceRaw.toString().replace(',', '.')) : null;

    transactions.push({
      date,
      description,
      amount: Math.abs(amount),
      currency,
      type,
      category: type === 'credit' ? 'Ingresos' : 'Sin categoría',
      subcategory: null,
      balance: isNaN(balance) ? null : balance,
      raw_description: description,
    });
  }

  return transactions;
}

// "Consolidated Statement" export: multiple sections (one per account), each
// preceded by a header row and followed by a "---------" separator row
function parseConsolidatedStatement(rows) {
  const transactions = [];
  let inSection = false;

  for (const row of rows) {
    const cells = row.map((c) => (c || '').trim());

    if (isConsolidatedHeaderRow(cells)) {
      inSection = true;
      continue;
    }

    if (!inSection) continue;

    // Separator row marks the end of a section
    if (cells.length === 0 || /^-+$/.test(cells[0])) {
      inSection = false;
      continue;
    }

    if (cells.length < 5) continue;

    const date = parseConsolidatedDate(cells[0]);
    const description = cells[1];
    const moneyInOut = parseEuroAmount(cells[3]);
    const balance = parseEuroAmount(cells[4]);

    if (!date || !description || isNaN(moneyInOut)) continue;

    const type = moneyInOut < 0 ? 'debit' : 'credit';

    transactions.push({
      date,
      description,
      amount: Math.abs(moneyInOut),
      currency: 'EUR',
      type,
      category: type === 'credit' ? 'Ingresos' : 'Sin categoría',
      subcategory: null,
      balance: isNaN(balance) ? null : balance,
      raw_description: description,
    });
  }

  return transactions;
}

function parseCSV(fileContent) {
  const content = fileContent.replace(/^﻿/, '');
  const delimiter = detectDelimiter(content);

  const result = Papa.parse(content, {
    delimiter,
    header: false,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const fatal = result.errors.filter(e => e.type === 'Delimiter' || e.type === 'Quotes');
    if (fatal.length > 0) {
      throw new Error(`CSV parse error: ${fatal[0].message}`);
    }
  }

  const rows = result.data;
  if (rows.length === 0) return [];

  // Detect the standard single-account export by its header row
  const firstRowNormalized = rows[0].map((h) => {
    const norm = normalizeHeader(h);
    return HEADER_MAP[norm] || norm;
  });

  if (firstRowNormalized.includes('type') || firstRowNormalized.includes('state')) {
    return parseStandardExport(rows);
  }

  // Otherwise, assume it's a Consolidated Statement export
  return parseConsolidatedStatement(rows);
}

module.exports = { parseCSV };
