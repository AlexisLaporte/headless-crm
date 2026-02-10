import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { signToken, verifyToken } from '../lib/jwt.js';

const app = new Hono();

const isProd = () => process.env.NODE_ENV === 'production';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setSessionCookie(c: any, token: string) {
  setCookie(c, 'hcrm_session', token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'Lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
    ...(isProd() ? { domain: '.tuls.me' } : {}),
  });
}

// GET /api/auth/google — redirect to Google OAuth
app.get('/google', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'select_account');
  return c.redirect(url.toString());
});

// GET /api/auth/google/callback — handle OAuth callback
app.get('/google/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.redirect(process.env.PUBLIC_URL! + '/?error=no_code');

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return c.redirect(process.env.PUBLIC_URL! + '/?error=token_exchange');
    }

    const tokens = await tokenRes.json() as { access_token: string };

    // Get user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return c.redirect(process.env.PUBLIC_URL! + '/?error=userinfo');
    }

    const profile = await userInfoRes.json() as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };

    // Upsert user
    let [user] = await db.select().from(users).where(eq(users.google_id, profile.id)).limit(1);

    if (!user) {
      // Check if user exists by email
      [user] = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
      if (user) {
        // Link Google ID to existing user
        await db.update(users).set({ google_id: profile.id, updated_at: new Date() }).where(eq(users.id, user.id));
      } else {
        // Create new user
        const avatar = profile.name
          .split(' ')
          .map((n: string) => n.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);

        const [newUser] = await db
          .insert(users)
          .values({
            name: profile.name,
            email: profile.email,
            google_id: profile.id,
            role: '',
            avatar,
          })
          .returning();
        user = newUser;
      }
    }

    const token = await signToken({ sub: user.id, email: user.email });
    setSessionCookie(c, token);

    return c.redirect(process.env.PUBLIC_URL! + '/app');
  } catch (err) {
    console.error('[auth/google/callback]', err);
    return c.redirect(process.env.PUBLIC_URL! + '/?error=oauth');
  }
});

// GET /api/auth/me — current user
app.get('/me', async (c) => {
  // Try cookie
  const cookie = getCookie(c, 'hcrm_session');
  if (!cookie) return c.json({ user: null });

  const payload = await verifyToken(cookie);
  if (!payload?.sub) return c.json({ user: null });

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  if (!user) return c.json({ user: null });

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

// POST /api/auth/logout
app.post('/logout', (c) => {
  deleteCookie(c, 'hcrm_session', {
    path: '/',
    ...(isProd() ? { domain: '.tuls.me' } : {}),
  });
  return c.json({ ok: true });
});

export default app;
