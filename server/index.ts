import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import organizationsRoutes from './routes/organizations.js';
import peopleRoutes from './routes/people.js';
import campaignsRoutes from './routes/campaigns.js';
import tokensRoutes from './routes/tokens.js';
import dealsRoutes from './routes/deals.js';
import activitiesRoutes from './routes/activities.js';
import tasksRoutes from './routes/tasks.js';
import groupsRoutes from './routes/groups.js';
import { verifyToken } from './lib/jwt.js';
import { db } from './db/index.js';
import { apiTokens } from './db/schema.js';
import { eq } from 'drizzle-orm';
import { createMcpServer, makeApiFn } from './mcp-tools.js';
import { startCron } from './cron.js';

const port = parseInt(process.env.PORT || '3002', 10);

const app = new Hono();

app.use('*', logger());

// CORS for /api/* and /.well-known/*
const corsMiddleware = cors({
  origin: (origin) => origin || '*',
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'mcp-session-id', 'mcp-protocol-version'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['mcp-session-id'],
});
app.use('/api/*', corsMiddleware);
app.use('/.well-known/*', corsMiddleware);

// --- OAuth 2.1 discovery (RFC 9728 + RFC 8414) ---

const serverUrl = () => process.env.PUBLIC_URL || `http://localhost:${port}`;

// Protected Resource Metadata (RFC 9728)
app.get('/.well-known/oauth-protected-resource/*', (c) => {
  const base = serverUrl();
  return c.json({
    resource: base,
    authorization_servers: [base],
    bearer_methods_supported: ['header'],
    scopes_supported: [],
  });
});

// Authorization Server Metadata (RFC 8414)
app.get('/.well-known/oauth-authorization-server', (c) => {
  const base = serverUrl();
  return c.json({
    issuer: base,
    authorization_endpoint: `${base}/api/oauth/authorize`,
    token_endpoint: `${base}/api/oauth/token`,
    registration_endpoint: `${base}/api/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'none'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: [],
  });
});

// --- API routes ---

app.get('/api/health', (c) => c.json({ ok: true }));

app.route('/api/auth', authRoutes);
app.route('/api/oauth', oauthRoutes);
app.route('/api/organizations', organizationsRoutes);
app.route('/api/people', peopleRoutes);
app.route('/api/campaigns', campaignsRoutes);
app.route('/api/tokens', tokensRoutes);
app.route('/api/deals', dealsRoutes);
app.route('/api/activities', activitiesRoutes);
app.route('/api/tasks', tasksRoutes);
app.route('/api/groups', groupsRoutes);

// --- MCP endpoint (remote, stateless) ---

app.all('/api/mcp', async (c) => {
  let token = '';

  // Try Bearer token (API token or JWT)
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);

    // Verify as JWT
    const payload = await verifyToken(token);
    if (payload?.sub) {
      // Valid JWT — proceed
    } else {
      // Try as API token (SHA-256 hash lookup)
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
      const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      const [apiToken] = await db.select().from(apiTokens).where(eq(apiTokens.token_hash, hashHex)).limit(1);

      if (apiToken) {
        await db.update(apiTokens).set({ last_used_at: new Date() }).where(eq(apiTokens.id, apiToken.id));
      } else {
        token = ''; // Invalid token
      }
    }
  }

  if (!token) {
    const base = serverUrl();
    c.header('WWW-Authenticate', `Bearer resource_metadata="${base}/.well-known/oauth-protected-resource/api/mcp"`);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const apiUrl = `http://localhost:${port}`;
  const api = makeApiFn(apiUrl, token);
  const transport = new WebStandardStreamableHTTPServerTransport();
  const mcpServer = createMcpServer(api);
  await mcpServer.connect(transport);
  return transport.handleRequest(c.req.raw);
});

console.log(`Server running on http://localhost:${port}`);

startCron();

serve({ fetch: app.fetch, port });
