import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../lib/jwt.js';
import { db } from '../db/index.js';
import { apiTokens } from '../db/schema.js';

type AuthEnv = {
  Variables: {
    userId: string;
  };
};

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  // Try cookie first
  const cookie = getCookie(c, 'hcrm_session');
  if (cookie) {
    const payload = await verifyToken(cookie);
    if (payload?.sub) {
      c.set('userId', payload.sub);
      return next();
    }
  }

  // Try Bearer token
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    // Try as JWT first
    const payload = await verifyToken(token);
    if (payload?.sub) {
      c.set('userId', payload.sub);
      return next();
    }

    // Try as API token (SHA-256 hash lookup)
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const [apiToken] = await db
      .select()
      .from(apiTokens)
      .where(eq(apiTokens.token_hash, hashHex))
      .limit(1);

    if (apiToken) {
      // Update last_used_at
      await db.update(apiTokens).set({ last_used_at: new Date() }).where(eq(apiTokens.id, apiToken.id));
      c.set('userId', apiToken.user_id);
      return next();
    }
  }

  return c.json({ error: 'Unauthorized' }, 401);
});
