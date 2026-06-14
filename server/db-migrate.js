const pool = require('./db');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      currency TEXT DEFAULT 'EUR',
      type TEXT CHECK(type IN ('debit','credit')) NOT NULL,
      category TEXT DEFAULT 'Sin categoría',
      subcategory TEXT,
      balance DOUBLE PRECISION,
      raw_description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      category TEXT UNIQUE NOT NULL,
      monthly_limit DOUBLE PRECISION NOT NULL,
      color TEXT DEFAULT '#10b981',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS debts (
      id SERIAL PRIMARY KEY,
      type TEXT CHECK(type IN ('owed_by_me','owed_to_me')) NOT NULL,
      person TEXT NOT NULL,
      description TEXT,
      amount DOUBLE PRECISION NOT NULL,
      currency TEXT DEFAULT 'EUR',
      date_created TEXT NOT NULL,
      date_due TEXT,
      status TEXT CHECK(status IN ('pending','partial','paid')) DEFAULT 'pending',
      amount_paid DOUBLE PRECISION DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      emoji TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*) as count FROM categories');
  if (parseInt(rows[0].count, 10) === 0) {
    const defaults = [
      ['Alimentación', '#f59e0b', '🍽️'],
      ['Transporte', '#60a5fa', '🚗'],
      ['Ocio', '#a78bfa', '🎮'],
      ['Salud', '#34d399', '💊'],
      ['Hogar', '#fb923c', '🏠'],
      ['Compras', '#f472b6', '🛍️'],
      ['Viajes', '#22d3ee', '✈️'],
      ['Servicios', '#94a3b8', '⚙️'],
      ['Transferencias', '#a3e635', '↔️'],
      ['Ingresos', '#6ee7b7', '💰'],
      ['Sin categoría', '#4b5563', '❓'],
    ];
    for (const [name, color, emoji] of defaults) {
      await pool.query(
        'INSERT INTO categories (name, color, emoji) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [name, color, emoji]
      );
    }
  }
}

module.exports = migrate;
