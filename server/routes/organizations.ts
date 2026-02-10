import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { organizations, people } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

type Env = { Variables: { userId: string } };
const app = new Hono<Env>();

app.use('/*', requireAuth);

// GET /api/organizations
app.get('/', async (c) => {
  const userId = c.get('userId');
  const rows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.user_id, userId))
    .orderBy(desc(organizations.created_at));
  return c.json(rows);
});

// POST /api/organizations
app.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const [row] = await db
    .insert(organizations)
    .values({ ...body, user_id: userId })
    .returning();
  return c.json(row, 201);
});

// GET /api/organizations/:id
app.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [org] = await db
    .select()
    .from(organizations)
    .where(and(eq(organizations.id, id), eq(organizations.user_id, userId)))
    .limit(1);
  if (!org) return c.json({ error: 'Not found' }, 404);

  const orgPeople = await db
    .select()
    .from(people)
    .where(eq(people.organization_id, id));

  return c.json({ ...org, people: orgPeople });
});

// PUT /api/organizations/:id
app.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const [row] = await db
    .update(organizations)
    .set({ ...body, updated_at: new Date() })
    .where(and(eq(organizations.id, id), eq(organizations.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// DELETE /api/organizations/:id
app.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  // Set people organization_id to null before deleting
  await db.update(people).set({ organization_id: null }).where(eq(people.organization_id, id));
  const [row] = await db
    .delete(organizations)
    .where(and(eq(organizations.id, id), eq(organizations.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default app;
