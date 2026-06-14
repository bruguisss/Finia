const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { z } = require('zod');
const pool = require('../db');

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// Wraps a tool handler so unexpected errors are returned as MCP tool errors
// instead of crashing the request.
function safeTool(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
    }
  };
}

function createMcpServer() {
  const server = new McpServer({ name: 'finia-mcp', version: '1.0.0' });

  server.registerTool('add_transaction', {
    title: 'Añadir transacción',
    description: 'Añade una transacción manual a Finia',
    inputSchema: {
      description: z.string().describe('Descripción de la transacción'),
      amount: z.number().describe('Importe: positivo = ingreso, negativo = gasto'),
      category: z.string().optional().describe('Categoría (opcional)'),
      date: z.string().optional().describe('Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)'),
    },
  }, safeTool(async ({ description, amount, category, date }) => {
    const type = amount >= 0 ? 'credit' : 'debit';
    const finalAmount = Math.abs(amount);
    const finalCategory = category || (type === 'credit' ? 'Ingresos' : 'Sin categoría');
    const finalDate = date || getToday();

    const result = await pool.query(`
      INSERT INTO transactions (date, description, amount, currency, type, category, subcategory, raw_description)
      VALUES ($1, $2, $3, 'EUR', $4, $5, NULL, $2)
      RETURNING *
    `, [finalDate, description, finalAmount, type, finalCategory]);

    const t = result.rows[0];
    const sign = type === 'credit' ? 'ingreso' : 'gasto';
    return {
      content: [{
        type: 'text',
        text: `Transacción añadida: "${t.description}" — ${sign} de ${finalAmount.toFixed(2)}€ en la categoría "${t.category}" el ${t.date}.`,
      }],
    };
  }));

  server.registerTool('delete_transaction', {
    title: 'Borrar transacción',
    description: 'Borra una transacción de Finia por su ID',
    inputSchema: {
      id: z.number().describe('ID de la transacción a borrar'),
    },
  }, safeTool(async ({ id }) => {
    const result = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return { content: [{ type: 'text', text: `No se ha encontrado ninguna transacción con el ID ${id}.` }] };
    }

    const t = result.rows[0];
    return {
      content: [{
        type: 'text',
        text: `Transacción borrada: "${t.description}" (${parseFloat(t.amount).toFixed(2)}€, ${t.date}).`,
      }],
    };
  }));

  server.registerTool('get_summary', {
    title: 'Resumen financiero',
    description: 'Obtiene el resumen financiero del mes actual o de un mes concreto',
    inputSchema: {
      month: z.string().optional().describe('Mes en formato YYYY-MM (opcional, por defecto el mes actual)'),
    },
  }, safeTool(async ({ month }) => {
    const targetMonth = month || getCurrentMonth();

    const totalsResult = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as "totalIncome",
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as "totalExpenses"
      FROM transactions WHERE LEFT(date, 7) = $1
    `, [targetMonth]);
    const totals = totalsResult.rows[0];
    const totalIncome = parseFloat(totals.totalIncome);
    const totalExpenses = parseFloat(totals.totalExpenses);
    const balance = totalIncome - totalExpenses;

    const topCategoriesResult = await pool.query(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE type = 'debit' AND LEFT(date, 7) = $1
      GROUP BY category
      ORDER BY total DESC
      LIMIT 5
    `, [targetMonth]);

    let text = `Resumen de ${targetMonth}:\n` +
      `- Ingresos: ${totalIncome.toFixed(2)}€\n` +
      `- Gastos: ${totalExpenses.toFixed(2)}€\n` +
      `- Balance: ${balance.toFixed(2)}€`;

    if (topCategoriesResult.rows.length > 0) {
      const lines = topCategoriesResult.rows.map((c) => `- ${c.category}: ${parseFloat(c.total).toFixed(2)}€`);
      text += `\n\nCategorías con más gasto:\n${lines.join('\n')}`;
    } else {
      text += '\n\nNo hay gastos registrados ese mes.';
    }

    return { content: [{ type: 'text', text }] };
  }));

  server.registerTool('get_transactions', {
    title: 'Listar transacciones',
    description: 'Lista las transacciones recientes',
    inputSchema: {
      limit: z.number().optional().describe('Número máximo de transacciones a devolver (por defecto 10)'),
      category: z.string().optional().describe('Filtrar por categoría (opcional)'),
      month: z.string().optional().describe('Filtrar por mes en formato YYYY-MM (opcional)'),
    },
  }, safeTool(async ({ limit, category, month }) => {
    const where = [];
    const params = [];

    if (month) {
      params.push(month);
      where.push(`LEFT(date, 7) = $${params.length}`);
    }
    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    params.push(limit || 10);

    const result = await pool.query(
      `SELECT * FROM transactions ${whereClause} ORDER BY date DESC, id DESC LIMIT $${params.length}`,
      params
    );

    if (result.rows.length === 0) {
      return { content: [{ type: 'text', text: 'No se han encontrado transacciones con esos filtros.' }] };
    }

    const lines = result.rows.map((t) => {
      const sign = t.type === 'credit' ? '+' : '-';
      return `- ${t.date} | ${t.description} | ${sign}${parseFloat(t.amount).toFixed(2)}€ | ${t.category}`;
    });

    return { content: [{ type: 'text', text: `Transacciones encontradas:\n${lines.join('\n')}` }] };
  }));

  server.registerTool('add_debt', {
    title: 'Registrar deuda',
    description: 'Registra una deuda (dinero que debo o que me deben)',
    inputSchema: {
      person: z.string().describe('Nombre de la persona'),
      amount: z.number().describe('Importe de la deuda'),
      description: z.string().optional().describe('Descripción de la deuda (opcional)'),
      type: z.enum(['owed_by_me', 'owed_to_me']).describe("'owed_by_me' = yo debo, 'owed_to_me' = me deben"),
      date_due: z.string().optional().describe('Fecha límite en formato YYYY-MM-DD (opcional)'),
    },
  }, safeTool(async ({ person, amount, description, type, date_due }) => {
    const result = await pool.query(`
      INSERT INTO debts (type, person, description, amount, currency, date_created, date_due)
      VALUES ($1, $2, $3, $4, 'EUR', $5, $6)
      RETURNING *
    `, [type, person, description || null, Math.abs(amount), getToday(), date_due || null]);

    const d = result.rows[0];
    const phrase = type === 'owed_by_me' ? `Le debes a ${d.person}` : `${d.person} te debe`;
    let text = `Deuda registrada: ${phrase} ${parseFloat(d.amount).toFixed(2)}€`;
    if (d.date_due) text += ` (vence el ${d.date_due})`;
    text += '.';

    return { content: [{ type: 'text', text }] };
  }));

  server.registerTool('get_debts', {
    title: 'Listar deudas',
    description: 'Lista las deudas pendientes',
    inputSchema: {
      type: z.enum(['owed_by_me', 'owed_to_me']).optional().describe('Filtrar por tipo (opcional)'),
    },
  }, safeTool(async ({ type }) => {
    let query = "SELECT * FROM debts WHERE status != 'paid'";
    const params = [];

    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    query += ' ORDER BY (date_due IS NULL), date_due ASC, date_created DESC';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return { content: [{ type: 'text', text: 'No tienes deudas pendientes.' }] };
    }

    const lines = result.rows.map((d) => {
      const remaining = parseFloat(d.amount) - parseFloat(d.amount_paid);
      const phrase = d.type === 'owed_by_me' ? `Debes a ${d.person}` : `${d.person} te debe`;
      let line = `- ${phrase}: ${remaining.toFixed(2)}€ (${d.status})`;
      if (d.date_due) line += ` — vence el ${d.date_due}`;
      return line;
    });

    return { content: [{ type: 'text', text: `Deudas pendientes:\n${lines.join('\n')}` }] };
  }));

  server.registerTool('update_budget', {
    title: 'Actualizar presupuesto',
    description: 'Crea o actualiza un presupuesto mensual por categoría',
    inputSchema: {
      category: z.string().describe('Categoría del presupuesto'),
      monthly_limit: z.number().describe('Límite mensual en euros'),
    },
  }, safeTool(async ({ category, monthly_limit }) => {
    const result = await pool.query(`
      INSERT INTO budgets (category, monthly_limit)
      VALUES ($1, $2)
      ON CONFLICT (category) DO UPDATE SET monthly_limit = $2
      RETURNING *
    `, [category, parseFloat(monthly_limit)]);

    const b = result.rows[0];
    return {
      content: [{
        type: 'text',
        text: `Presupuesto actualizado: "${b.category}" → ${parseFloat(b.monthly_limit).toFixed(2)}€/mes.`,
      }],
    };
  }));

  return server;
}

module.exports = { createMcpServer };
