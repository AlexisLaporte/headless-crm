import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { apiTokens } from '../db/schema.js';
import { verifyToken } from '../lib/jwt.js';

const app = new Hono();

// --- In-memory stores (ephemeral, cleared on restart) ---

const authCodes = new Map<string, {
  userId: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  expiresAt: number;
}>();

const clients = new Map<string, {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
}>();

// Cleanup expired codes every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [code, data] of authCodes) {
    if (data.expiresAt < now) authCodes.delete(code);
  }
}, 5 * 60 * 1000);

// POST /api/oauth/register — Dynamic Client Registration (RFC 7591)
app.post('/register', async (c) => {
  const body = await c.req.json();

  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();

  clients.set(clientId, {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: body.redirect_uris || [],
  });

  return c.json({
    client_id: clientId,
    client_secret: clientSecret,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris: body.redirect_uris || [],
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
  }, 201);
});

// GET /api/oauth/authorize — OAuth authorization endpoint
app.get('/authorize', async (c) => {
  const clientId = c.req.query('client_id') || '';
  const redirectUri = c.req.query('redirect_uri') || '';
  const codeChallenge = c.req.query('code_challenge') || '';
  const codeChallengeMethod = c.req.query('code_challenge_method') || '';
  const state = c.req.query('state') || '';
  const responseType = c.req.query('response_type');

  if (responseType !== 'code') return c.json({ error: 'unsupported_response_type' }, 400);
  if (!clientId || !redirectUri) return c.json({ error: 'invalid_request' }, 400);

  // Check if user has a valid session (cookie)
  const cookie = getCookie(c, 'hcrm_session');
  if (cookie) {
    const payload = await verifyToken(cookie);
    if (payload?.sub) {
      // Authenticated → auto-approve, generate authorization code
      const code = crypto.randomUUID();
      authCodes.set(code, {
        userId: payload.sub,
        clientId,
        redirectUri,
        codeChallenge,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
      });

      const url = new URL(redirectUri);
      url.searchParams.set('code', code);
      if (state) url.searchParams.set('state', state);
      return c.redirect(url.toString());
    }
  }

  // Not authenticated → redirect to CRM login page with return_to
  // After login (Google SSO, email/password, etc.), the frontend redirects back here
  const base = process.env.PUBLIC_URL || 'http://localhost:5173';
  const returnTo = `/api/oauth/authorize?${c.req.url.split('?')[1] || ''}`;
  return c.redirect(`${base}/?return_to=${encodeURIComponent(returnTo)}`);
});

// POST /api/oauth/token — Exchange authorization code for access token
app.post('/token', async (c) => {
  const body = await c.req.parseBody();
  const grantType = body.grant_type as string;

  if (grantType === 'refresh_token') {
    // We don't support refresh tokens — access tokens are permanent
    return c.json({ error: 'unsupported_grant_type' }, 400);
  }

  if (grantType !== 'authorization_code') {
    return c.json({ error: 'unsupported_grant_type' }, 400);
  }

  const code = body.code as string;
  const codeVerifier = body.code_verifier as string;
  const redirectUri = body.redirect_uri as string;

  const authCode = authCodes.get(code);
  if (!authCode) return c.json({ error: 'invalid_grant', error_description: 'Invalid or expired code' }, 400);

  authCodes.delete(code);

  if (authCode.expiresAt < Date.now()) return c.json({ error: 'invalid_grant', error_description: 'Code expired' }, 400);
  if (authCode.redirectUri !== redirectUri) return c.json({ error: 'invalid_grant', error_description: 'redirect_uri mismatch' }, 400);

  // Verify PKCE (S256)
  if (authCode.codeChallenge && codeVerifier) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
    const computed = Buffer.from(new Uint8Array(hash)).toString('base64url');
    if (computed !== authCode.codeChallenge) {
      return c.json({ error: 'invalid_grant', error_description: 'PKCE verification failed' }, 400);
    }
  }

  // Create API token for the user
  const tokenName = 'mcp-oauth';
  await db.delete(apiTokens).where(and(eq(apiTokens.user_id, authCode.userId), eq(apiTokens.name, tokenName)));

  const rawToken = `hcrm_${crypto.randomUUID().replace(/-/g, '')}`;
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawToken));
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  await db.insert(apiTokens).values({ user_id: authCode.userId, name: tokenName, token_hash: hashHex });

  return c.json({
    access_token: rawToken,
    token_type: 'bearer',
  });
});

export default app;
