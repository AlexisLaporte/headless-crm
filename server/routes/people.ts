import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { people, organizations } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

type Env = { Variables: { userId: string } };
const app = new Hono<Env>();

app.use('/*', requireAuth);

// GET /api/people
app.get('/', async (c) => {
  const userId = c.get('userId');
  const rows = await db
    .select({
      id: people.id,
      first_name: people.first_name,
      last_name: people.last_name,
      email: people.email,
      phone: people.phone,
      job_title: people.job_title,
      notes: people.notes,
      organization_id: people.organization_id,
      user_id: people.user_id,
      created_at: people.created_at,
      updated_at: people.updated_at,
      organization_name: organizations.name,
    })
    .from(people)
    .leftJoin(organizations, eq(people.organization_id, organizations.id))
    .where(eq(people.user_id, userId))
    .orderBy(desc(people.created_at));
  return c.json(rows);
});

// POST /api/people
app.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const [row] = await db
    .insert(people)
    .values({
      ...body,
      organization_id: body.organization_id || null,
      user_id: userId,
    })
    .returning();
  return c.json(row, 201);
});

// PUT /api/people/:id
app.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const [row] = await db
    .update(people)
    .set({
      ...body,
      organization_id: body.organization_id || null,
      updated_at: new Date(),
    })
    .where(and(eq(people.id, id), eq(people.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// DELETE /api/people/:id (cascade campaign_people handled by FK)
app.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [row] = await db
    .delete(people)
    .where(and(eq(people.id, id), eq(people.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default app;
