import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { deals, activities, tasks, people, organizations } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

type Env = { Variables: { userId: string } };
const app = new Hono<Env>();

app.use('/*', requireAuth);

// GET /api/deals — list with person/organization join
app.get('/', async (c) => {
  const userId = c.get('userId');
  const rows = await db
    .select({
      id: deals.id,
      title: deals.title,
      stage: deals.stage,
      amount: deals.amount,
      closed_reason: deals.closed_reason,
      person_id: deals.person_id,
      organization_id: deals.organization_id,
      user_id: deals.user_id,
      metadata: deals.metadata,
      created_at: deals.created_at,
      updated_at: deals.updated_at,
      person_first_name: people.first_name,
      person_last_name: people.last_name,
      organization_name: organizations.name,
    })
    .from(deals)
    .leftJoin(people, eq(deals.person_id, people.id))
    .leftJoin(organizations, eq(deals.organization_id, organizations.id))
    .where(eq(deals.user_id, userId))
    .orderBy(desc(deals.created_at));

  return c.json(rows.map((r) => ({ ...r, amount: r.amount ? Number(r.amount) : null })));
});

// POST /api/deals — create deal + auto-activity 'deal_created'
app.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const [deal] = await db
    .insert(deals)
    .values({
      title: body.title,
      stage: body.stage || 'draft',
      amount: body.amount != null ? String(body.amount) : null,
      person_id: body.person_id || null,
      organization_id: body.organization_id || null,
      metadata: body.metadata || null,
      user_id: userId,
    })
    .returning();

  // auto-create deal_created activity
  await db.insert(activities).values({
    type: 'deal_created',
    content: `Deal "${deal.title}" created`,
    deal_id: deal.id,
    person_id: deal.person_id,
    user_id: userId,
  });

  return c.json({ ...deal, amount: deal.amount ? Number(deal.amount) : null }, 201);
});

// GET /api/deals/:id — detail + 10 last activities + open tasks
app.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [deal] = await db
    .select({
      id: deals.id,
      title: deals.title,
      stage: deals.stage,
      amount: deals.amount,
      closed_reason: deals.closed_reason,
      person_id: deals.person_id,
      organization_id: deals.organization_id,
      user_id: deals.user_id,
      metadata: deals.metadata,
      created_at: deals.created_at,
      updated_at: deals.updated_at,
      person_first_name: people.first_name,
      person_last_name: people.last_name,
      organization_name: organizations.name,
    })
    .from(deals)
    .leftJoin(people, eq(deals.person_id, people.id))
    .leftJoin(organizations, eq(deals.organization_id, organizations.id))
    .where(and(eq(deals.id, id), eq(deals.user_id, userId)))
    .limit(1);
  if (!deal) return c.json({ error: 'Not found' }, 404);

  const recentActivities = await db
    .select()
    .from(activities)
    .where(eq(activities.deal_id, id))
    .orderBy(desc(activities.created_at))
    .limit(10);

  const openTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.deal_id, id), eq(tasks.status, 'pending')));

  return c.json({
    ...deal,
    amount: deal.amount ? Number(deal.amount) : null,
    activities: recentActivities,
    tasks: openTasks,
  });
});

// PUT /api/deals/:id — update fields (stage change FORBIDDEN)
app.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();

  if (body.stage !== undefined) {
    return c.json({ error: 'Stage changes must go through POST /api/activities with type=stage_change' }, 400);
  }

  const { person_id, organization_id, amount, ...rest } = body;
  const [row] = await db
    .update(deals)
    .set({
      ...rest,
      ...(person_id !== undefined && { person_id: person_id || null }),
      ...(organization_id !== undefined && { organization_id: organization_id || null }),
      ...(amount !== undefined && { amount: amount != null ? String(amount) : null }),
      updated_at: new Date(),
    })
    .where(and(eq(deals.id, id), eq(deals.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ...row, amount: row.amount ? Number(row.amount) : null });
});

// DELETE /api/deals/:id — cascade activities + tasks via FK
app.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [row] = await db
    .delete(deals)
    .where(and(eq(deals.id, id), eq(deals.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

// GET /api/deals/:id/activities — timeline paginée
app.get('/:id/activities', async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  // verify deal ownership
  const [deal] = await db
    .select({ id: deals.id })
    .from(deals)
    .where(and(eq(deals.id, id), eq(deals.user_id, userId)))
    .limit(1);
  if (!deal) return c.json({ error: 'Not found' }, 404);

  const rows = await db
    .select()
    .from(activities)
    .where(eq(activities.deal_id, id))
    .orderBy(desc(activities.created_at))
    .limit(limit)
    .offset(offset);

  return c.json(rows);
});

// GET /api/deals/:id/tasks — tasks du deal
app.get('/:id/tasks', async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');

  // verify deal ownership
  const [deal] = await db
    .select({ id: deals.id })
    .from(deals)
    .where(and(eq(deals.id, id), eq(deals.user_id, userId)))
    .limit(1);
  if (!deal) return c.json({ error: 'Not found' }, 404);

  const rows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.deal_id, id))
    .orderBy(desc(tasks.created_at));

  return c.json(rows);
});

export default app;
