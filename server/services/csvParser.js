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

function detectDelimiter(text) {
  const firstLine = text.split('\n')[0];
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  return semicolons > commas ? ';' : ',';
}

function parseCSV(fileContent) {
  const delimiter = detectDelimiter(fileContent);

  const result = Papa.parse(fileContent, {
    delimiter,
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => {
      const norm = normalizeHeader(h);
      return HEADER_MAP[norm] || norm;
    },
  });

  if (result.errors.length > 0) {
    const fatal = result.errors.filter(e => e.type === 'Delimiter' || e.type === 'Quotes');
    if (fatal.length > 0) {
      throw new Error(`CSV parse error: ${fatal[0].message}`);
    }
  }

  const completedStates = new Set(['completed', 'completado']);
  const transactions = [];

  for (const row of result.data) {
    const state = (row.state || '').trim().toLowerCase();
    if (!completedStates.has(state)) continue;

    const rawAmount = (row.amount || '').toString().replace(',', '.').trim();
    const amount = parseFloat(rawAmount);
    if (isNaN(amount)) continue;

    const date = parseDate(row.completed_date || row.started_date);
    if (!date) continue;

    const description = (row.description || '').trim();
    if (!description) continue;

    const currency = (row.currency || 'EUR').trim().toUpperCase();
    const type = amount < 0 ? 'debit' : 'credit';
    const balance = row.balance ? parseFloat((row.balance || '').toString().replace(',', '.')) : null;

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

module.exports = { parseCSV };
