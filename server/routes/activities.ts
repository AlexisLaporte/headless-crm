import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { activities, deals } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

type Env = { Variables: { userId: string } };
const app = new Hono<Env>();

app.use('/*', requireAuth);

// POST /api/activities — create activity + side-effects
app.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  // side-effect: stage_change → update deal.stage
  if (body.type === 'stage_change') {
    if (!body.deal_id) return c.json({ error: 'deal_id required for stage_change' }, 400);
    const newStage = body.changes?.stage?.to;
    if (!newStage) return c.json({ error: 'changes.stage.to required for stage_change' }, 400);

    const [deal] = await db
      .select()
      .from(deals)
      .where(and(eq(deals.id, body.deal_id), eq(deals.user_id, userId)))
      .limit(1);
    if (!deal) return c.json({ error: 'Deal not found' }, 404);

    // Build changes with from if not provided
    const changes = {
      stage: { from: deal.stage, to: newStage },
      ...(body.changes?.closed_reason && { closed_reason: body.changes.closed_reason }),
    };

    // Update deal stage
    const updateData: Record<string, unknown> = { stage: newStage, updated_at: new Date() };
    if (newStage === 'won' || newStage === 'lost') {
      updateData.closed_reason = body.changes?.closed_reason || null;
    }
    await db.update(deals).set(updateData).where(eq(deals.id, body.deal_id));

    const [activity] = await db
      .insert(activities)
      .values({
        type: body.type,
        content: body.content || `Stage changed from ${deal.stage} to ${newStage}`,
        channel: body.channel || null,
        deal_id: body.deal_id,
        person_id: body.person_id || null,
        changes,
        user_id: userId,
      })
      .returning();

    return c.json(activity, 201);
  }

  // Normal activity creation
  const [activity] = await db
    .insert(activities)
    .values({
      type: body.type,
      content: body.content || null,
      channel: body.channel || null,
      deal_id: body.deal_id || null,
      person_id: body.person_id || null,
      changes: body.changes || null,
      user_id: userId,
    })
    .returning();

  return c.json(activity, 201);
});

// GET /api/activities — list with filters
app.get('/', async (c) => {
  const userId = c.get('userId');
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);
  const dealId = c.req.query('deal_id');
  const personId = c.req.query('person_id');
  const type = c.req.query('type');

  const conditions = [eq(activities.user_id, userId)];
  if (dealId) conditions.push(eq(activities.deal_id, dealId));
  if (personId) conditions.push(eq(activities.person_id, personId));
  if (type) conditions.push(eq(activities.type, type as typeof activities.type.enumValues[number]));

  const rows = await db
    .select()
    .from(activities)
    .where(and(...conditions))
    .orderBy(desc(activities.created_at))
    .limit(limit)
    .offset(offset);

  return c.json(rows);
});

// GET /api/activities/:id — detail
app.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [row] = await db
    .select()
    .from(activities)
    .where(and(eq(activities.id, id), eq(activities.user_id, userId)))
    .limit(1);
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

export default app;
