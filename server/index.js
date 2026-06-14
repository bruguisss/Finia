require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');

const migrate = require('./db-migrate');

const transactionsRouter = require('./routes/transactions');
const budgetsRouter = require('./routes/budgets');
const uploadRouter = require('./routes/upload');
const debtsRouter = require('./routes/debts');
const categoriesRouter = require('./routes/categories');
const mcpRouter = require('./routes/mcp');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/upload', uploadRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/debts', debtsRouter);
app.use('/api/categories', categoriesRouter);

// Summary endpoint
app.get('/api/summary', require('./routes/summary'));

// MCP (Model Context Protocol) server — mounted at /mcp/<MCP_API_KEY>
// (the secret lives in the URL path since claude.ai custom connectors don't
// support sending a custom x-api-key header)
app.use('/mcp/:secret', mcpRouter);

// Serve built React app in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Finia server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database migration failed:', err);
    process.exit(1);
  });
