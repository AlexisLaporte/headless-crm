import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { apiTokens } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

type Env = { Variables: { userId: string } };
const app = new Hono<Env>();

app.use('/*', requireAuth);

// GET /api/tokens
app.get('/', async (c) => {
  const userId = c.get('userId');
  const rows = await db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      last_used_at: apiTokens.last_used_at,
      created_at: apiTokens.created_at,
    })
    .from(apiTokens)
    .where(eq(apiTokens.user_id, userId));
  return c.json(rows);
});

// POST /api/tokens
app.post('/', async (c) => {
  const userId = c.get('userId');
  const { name } = await c.req.json<{ name: string }>();
  if (!name) return c.json({ error: 'Name required' }, 400);

  // Generate random token
  const rawToken = `hcrm_${crypto.randomUUID().replace(/-/g, '')}`;

  // Hash for storage
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawToken));
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const [row] = await db
    .insert(apiTokens)
    .values({ user_id: userId, name, token_hash: hashHex })
    .returning();

  return c.json({
    id: row.id,
    name: row.name,
    value: rawToken, // Only returned once
    created_at: row.created_at,
  }, 201);
});

// GET /api/tokens/mcp-setup?callback=http://localhost:9876
// Creates a token and redirects to the callback with the token value
app.get('/mcp-setup', async (c) => {
  const userId = c.get('userId');
  const callback = c.req.query('callback');
  if (!callback) return c.json({ error: 'callback parameter required' }, 400);

  const name = 'mcp-claude-code';

  // Delete existing mcp token for this user
  await db.delete(apiTokens).where(and(eq(apiTokens.user_id, userId), eq(apiTokens.name, name)));

  // Generate token
  const rawToken = `hcrm_${crypto.randomUUID().replace(/-/g, '')}`;
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawToken));
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  await db.insert(apiTokens).values({ user_id: userId, name, token_hash: hashHex });

  const url = new URL(callback);
  url.searchParams.set('token', rawToken);
  return c.redirect(url.toString());
});

// DELETE /api/tokens/:id
app.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [row] = await db
    .delete(apiTokens)
    .where(and(eq(apiTokens.id, id), eq(apiTokens.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default app;
