import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from 'node:http';
import { exec } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createMcpServer, makeApiFn } from './mcp-tools.js';

const API_URL = process.env.HCRM_API_URL || 'https://headless-crm.tuls.me';
let apiToken = process.env.HCRM_API_TOKEN;

// --- Auto-auth via browser if no token ---

function authenticate(): Promise<string> {
  const AUTH_PORT = 9876;
  const CLAUDE_JSON = join(homedir(), '.claude.json');

  return new Promise((resolve, reject) => {
    const callbackUrl = `http://localhost:${AUTH_PORT}`;
    const setupUrl = `${API_URL}/api/tokens/mcp-setup?callback=${encodeURIComponent(callbackUrl)}`;

    const httpServer = createServer((req, res) => {
      const url = new URL(req.url!, callbackUrl);
      const token = url.searchParams.get('token');
      if (!token) {
        res.writeHead(400);
        res.end('Missing token');
        httpServer.close();
        reject(new Error('No token received'));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1 style="font-family:system-ui">Headless CRM — MCP configured</h1><p>You can close this tab.</p>');
      httpServer.close();

      try {
        const raw = readFileSync(CLAUDE_JSON, 'utf-8');
        const config = JSON.parse(raw);
        for (const [, proj] of Object.entries(config.projects || {}) as [string, Record<string, unknown>][]) {
          const mcpServers = proj.mcpServers as Record<string, Record<string, unknown>> | undefined;
          if (mcpServers?.['headless-crm']?.env) {
            (mcpServers['headless-crm'].env as Record<string, string>).HCRM_API_TOKEN = token;
          }
        }
        writeFileSync(CLAUDE_JSON, JSON.stringify(config, null, 2));
      } catch { /* non-fatal */ }

      resolve(token);
    });

    httpServer.on('error', (err: NodeJS.ErrnoException) => {
      reject(err.code === 'EADDRINUSE' ? new Error(`Port ${AUTH_PORT} in use`) : err);
    });

    httpServer.listen(AUTH_PORT, () => {
      exec(`xdg-open "${setupUrl}"`, () => {});
    });

    setTimeout(() => { httpServer.close(); reject(new Error('Auth timeout (60s)')); }, 60_000);
  });
}

// --- Start ---

if (!apiToken) {
  try {
    apiToken = await authenticate();
  } catch (err) {
    process.stderr.write(`Auth failed: ${err}\nLog into ${API_URL} first, then retry.\n`);
    process.exit(1);
  }
}

const api = makeApiFn(API_URL, apiToken);
const server = createMcpServer(api);
const transport = new StdioServerTransport();
await server.connect(transport);
