import { Hono } from 'hono';
import { eq, and, desc, lte } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tasks, activities } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

type Env = { Variables: { userId: string } };
const app = new Hono<Env>();

app.use('/*', requireAuth);

// GET /api/tasks — list with filters
app.get('/', async (c) => {
  const userId = c.get('userId');
  const status = c.req.query('status');
  const dealId = c.req.query('deal_id');
  const overdue = c.req.query('overdue');

  const conditions = [eq(tasks.user_id, userId)];
  if (status) conditions.push(eq(tasks.status, status as typeof tasks.status.enumValues[number]));
  if (dealId) conditions.push(eq(tasks.deal_id, dealId));
  if (overdue === 'true') {
    conditions.push(eq(tasks.status, 'pending'));
    conditions.push(lte(tasks.due_date, new Date()));
  }

  const rows = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.created_at));

  return c.json(rows);
});

// POST /api/tasks — create task
app.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const [task] = await db
    .insert(tasks)
    .values({
      title: body.title,
      description: body.description || null,
      type: body.type || 'other',
      status: body.status || 'pending',
      due_date: body.due_date ? new Date(body.due_date) : null,
      remind_at: body.remind_at ? new Date(body.remind_at) : null,
      deal_id: body.deal_id || null,
      person_id: body.person_id || null,
      user_id: userId,
    })
    .returning();
  return c.json(task, 201);
});

// PUT /api/tasks/:id — update (mark done → auto-activity + set completed_at)
app.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();

  // Fetch current task
  const [current] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.user_id, userId)))
    .limit(1);
  if (!current) return c.json({ error: 'Not found' }, 404);

  const updateData: Record<string, unknown> = { updated_at: new Date() };
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.type !== undefined) updateData.type = body.type;
  if (body.due_date !== undefined) updateData.due_date = body.due_date ? new Date(body.due_date) : null;
  if (body.remind_at !== undefined) updateData.remind_at = body.remind_at ? new Date(body.remind_at) : null;
  if (body.deal_id !== undefined) updateData.deal_id = body.deal_id || null;
  if (body.person_id !== undefined) updateData.person_id = body.person_id || null;

  // Handle status change to done
  if (body.status !== undefined) {
    updateData.status = body.status;
    if (body.status === 'done' && current.status !== 'done') {
      updateData.completed_at = new Date();
      // Auto-create activity for task completion
      await db.insert(activities).values({
        type: 'other',
        content: `Task completed: "${current.title}"`,
        deal_id: current.deal_id,
        person_id: current.person_id,
        user_id: userId,
      });
    }
  }

  const [row] = await db
    .update(tasks)
    .set(updateData)
    .where(and(eq(tasks.id, id), eq(tasks.user_id, userId)))
    .returning();

  return c.json(row);
});

// DELETE /api/tasks/:id
app.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [row] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default app;
