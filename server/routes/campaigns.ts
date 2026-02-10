import { Hono } from 'hono';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { campaigns, campaignPeople, people } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

type Env = { Variables: { userId: string } };
const app = new Hono<Env>();

app.use('/*', requireAuth);

// GET /api/campaigns
app.get('/', async (c) => {
  const userId = c.get('userId');
  const rows = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.user_id, userId))
    .orderBy(desc(campaigns.created_at));

  // Attach campaign_people for each campaign
  const ids = rows.map((r) => r.id);
  const cpRows = ids.length
    ? await db.select().from(campaignPeople).where(inArray(campaignPeople.campaign_id, ids))
    : [];

  const cpByCampaign = new Map<string, typeof cpRows>();
  for (const cp of cpRows) {
    const arr = cpByCampaign.get(cp.campaign_id) || [];
    arr.push(cp);
    cpByCampaign.set(cp.campaign_id, arr);
  }

  return c.json(
    rows.map((r) => ({
      ...r,
      budget: Number(r.budget),
      campaign_people: cpByCampaign.get(r.id) || [],
    }))
  );
});

// POST /api/campaigns
app.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const [row] = await db
    .insert(campaigns)
    .values({
      ...body,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      budget: String(body.budget ?? 0),
      user_id: userId,
    })
    .returning();
  return c.json({ ...row, budget: Number(row.budget), campaign_people: [] }, 201);
});

// GET /api/campaigns/:id
app.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.user_id, userId)))
    .limit(1);
  if (!campaign) return c.json({ error: 'Not found' }, 404);

  const cpRows = await db.select().from(campaignPeople).where(eq(campaignPeople.campaign_id, id));

  // Get person details for each campaign person
  const personIds = cpRows.map((cp) => cp.person_id);
  const personRows = personIds.length
    ? await db.select().from(people).where(inArray(people.id, personIds))
    : [];

  const personMap = new Map(personRows.map((p) => [p.id, p]));

  return c.json({
    ...campaign,
    budget: Number(campaign.budget),
    campaign_people: cpRows.map((cp) => ({
      ...cp,
      person: personMap.get(cp.person_id) || null,
    })),
  });
});

// PUT /api/campaigns/:id
app.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const [row] = await db
    .update(campaigns)
    .set({
      ...body,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      budget: String(body.budget ?? 0),
      updated_at: new Date(),
    })
    .where(and(eq(campaigns.id, id), eq(campaigns.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ...row, budget: Number(row.budget) });
});

// DELETE /api/campaigns/:id (cascade campaign_people handled by FK)
app.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [row] = await db
    .delete(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

// PUT /api/campaigns/:id/people — replace all people for a campaign
app.put('/:id/people', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  // Verify campaign ownership
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.user_id, userId)))
    .limit(1);
  if (!campaign) return c.json({ error: 'Not found' }, 404);

  const { person_ids } = await c.req.json<{ person_ids: string[] }>();

  // Delete existing
  await db.delete(campaignPeople).where(eq(campaignPeople.campaign_id, id));

  // Insert new
  if (person_ids.length > 0) {
    await db.insert(campaignPeople).values(
      person_ids.map((person_id) => ({
        campaign_id: id,
        person_id,
        status: 'pending',
      }))
    );
  }

  // Return updated list
  const cpRows = await db.select().from(campaignPeople).where(eq(campaignPeople.campaign_id, id));
  return c.json(cpRows);
});

export default app;
