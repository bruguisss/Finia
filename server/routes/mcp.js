const express = require('express');
const router = express.Router();
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { createMcpServer } = require('../mcp/server');

function checkApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!process.env.MCP_API_KEY || apiKey !== process.env.MCP_API_KEY) {
    return res.status(401).json({
      jsonrpc: '2.0',
      error: { code: -32001, message: 'Unauthorized: missing or invalid x-api-key header' },
      id: null,
    });
  }
  next();
}

// POST /mcp — handles MCP JSON-RPC requests (stateless: one server/transport per request)
router.post('/', checkApiKey, async (req, res) => {
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

// GET /mcp — not supported in stateless mode (no server-initiated streams)
router.get('/', checkApiKey, (req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null,
  });
});

module.exports = router;
