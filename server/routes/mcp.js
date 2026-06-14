const express = require('express');
const router = express.Router({ mergeParams: true });
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { createMcpServer } = require('../mcp/server');

// The secret lives in the URL path itself (/mcp/<MCP_API_KEY>) since claude.ai's
// custom connectors don't support sending a custom x-api-key header.
function checkSecret(req, res, next) {
  if (!process.env.MCP_API_KEY || req.params.secret !== process.env.MCP_API_KEY) {
    // 404 instead of 401/403 so a wrong guess doesn't reveal that /mcp/* exists.
    return res.status(404).json({ error: 'Not found' });
  }
  next();
}

// POST /mcp/:secret — handles MCP JSON-RPC requests (stateless: one server/transport per request)
router.post('/', checkSecret, async (req, res) => {
  try {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => {
      transport.close();
      server.close();
    });
  } catch (err) {
    console.error('Error handling MCP request:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// GET /mcp/:secret — not supported in stateless mode (no server-initiated streams)
router.get('/', checkSecret, (req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null,
  });
});

module.exports = router;
