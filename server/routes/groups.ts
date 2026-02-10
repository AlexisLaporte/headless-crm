import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { groups, groupMemberships, people, organizations } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

type Env = { Variables: { userId: string } };
const app = new Hono<Env>();

app.use('/*', requireAuth);

// GET /api/groups — list
app.get('/', async (c) => {
  const userId = c.get('userId');
  const rows = await db
    .select()
    .from(groups)
    .where(eq(groups.user_id, userId))
    .orderBy(desc(groups.created_at));
  return c.json(rows);
});

// POST /api/groups — create
app.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const [row] = await db
    .insert(groups)
    .values({
      name: body.name,
      description: body.description || null,
      user_id: userId,
    })
    .returning();
  return c.json(row, 201);
});

// GET /api/groups/:id — detail + members
app.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [group] = await db
    .select()
    .from(groups)
    .where(and(eq(groups.id, id), eq(groups.user_id, userId)))
    .limit(1);
  if (!group) return c.json({ error: 'Not found' }, 404);

  const memberships = await db
    .select({
      id: groupMemberships.id,
      group_id: groupMemberships.group_id,
      person_id: groupMemberships.person_id,
      organization_id: groupMemberships.organization_id,
      role: groupMemberships.role,
      notes: groupMemberships.notes,
      created_at: groupMemberships.created_at,
      person_first_name: people.first_name,
      person_last_name: people.last_name,
      person_email: people.email,
      organization_name: organizations.name,
    })
    .from(groupMemberships)
    .leftJoin(people, eq(groupMemberships.person_id, people.id))
    .leftJoin(organizations, eq(groupMemberships.organization_id, organizations.id))
    .where(eq(groupMemberships.group_id, id))
    .orderBy(desc(groupMemberships.created_at));

  return c.json({ ...group, members: memberships });
});

// PUT /api/groups/:id — update
app.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const [row] = await db
    .update(groups)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      updated_at: new Date(),
    })
    .where(and(eq(groups.id, id), eq(groups.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// DELETE /api/groups/:id — cascade memberships
app.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [row] = await db
    .delete(groups)
    .where(and(eq(groups.id, id), eq(groups.user_id, userId)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

// POST /api/groups/:id/members — add member(s)
app.post('/:id/members', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  // Verify group ownership
  const [group] = await db
    .select({ id: groups.id })
    .from(groups)
    .where(and(eq(groups.id, id), eq(groups.user_id, userId)))
    .limit(1);
  if (!group) return c.json({ error: 'Not found' }, 404);

  const body = await c.req.json();
  // Accept single or array
  const members = Array.isArray(body) ? body : [body];

  const rows = await db
    .insert(groupMemberships)
    .values(
      members.map((m: { person_id?: string; organization_id?: string; role?: string; notes?: string }) => ({
        group_id: id,
        person_id: m.person_id || null,
        organization_id: m.organization_id || null,
        role: m.role || null,
        notes: m.notes || null,
      }))
    )
    .onConflictDoNothing()
    .returning();

  return c.json(rows, 201);
});

// DELETE /api/groups/:id/members/:membershipId — remove member
app.delete('/:id/members/:membershipId', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const membershipId = c.req.param('membershipId');

  // Verify group ownership
  const [group] = await db
    .select({ id: groups.id })
    .from(groups)
    .where(and(eq(groups.id, id), eq(groups.user_id, userId)))
    .limit(1);
  if (!group) return c.json({ error: 'Not found' }, 404);

  const [row] = await db
    .delete(groupMemberships)
    .where(and(eq(groupMemberships.id, membershipId), eq(groupMemberships.group_id, id)))
    .returning();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default app;
