import { pgTable, pgEnum, uuid, text, timestamp, numeric, unique, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default(''),
  avatar: text('avatar').notNull().default(''),
  google_id: text('google_id'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  industry: text('industry').notNull().default(''),
  website: text('website').notNull().default(''),
  phone: text('phone').notNull().default(''),
  email: text('email').notNull().default(''),
  address: text('address').notNull().default(''),
  city: text('city').notNull().default(''),
  country: text('country').notNull().default(''),
  notes: text('notes').notNull().default(''),
  user_id: uuid('user_id').notNull().references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull().default(''),
  phone: text('phone').notNull().default(''),
  job_title: text('job_title').notNull().default(''),
  notes: text('notes').notNull().default(''),
  organization_id: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  user_id: uuid('user_id').notNull().references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull().default('email'),
  status: text('status').notNull().default('draft'),
  start_date: text('start_date'),
  end_date: text('end_date'),
  budget: numeric('budget', { precision: 12, scale: 2 }).notNull().default('0'),
  description: text('description').notNull().default(''),
  subject: text('subject').notNull().default(''),
  message_body: text('message_body').notNull().default(''),
  user_id: uuid('user_id').notNull().references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const campaignPeople = pgTable('campaign_people', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaign_id: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  person_id: uuid('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.campaign_id, t.person_id),
]);

export const apiTokens = pgTable('api_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  token_hash: text('token_hash').notNull(),
  last_used_at: timestamp('last_used_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- AI-first CRM enums & tables ---

export const dealStageEnum = pgEnum('deal_stage', [
  'draft', 'sent', 'negotiation', 'won', 'lost',
]);

export const activityTypeEnum = pgEnum('activity_type', [
  'call', 'email', 'meeting', 'note', 'linkedin_message',
  'stage_change', 'deal_created', 'deal_won', 'deal_lost', 'other',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'pending', 'done', 'cancelled',
]);

export const taskTypeEnum = pgEnum('task_type', [
  'follow_up', 'call', 'email', 'meeting', 'other',
]);

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  stage: dealStageEnum('stage').notNull().default('draft'),
  amount: numeric('amount', { precision: 12, scale: 2 }),
  closed_reason: text('closed_reason'),
  person_id: uuid('person_id').references(() => people.id, { onDelete: 'set null' }),
  organization_id: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  user_id: uuid('user_id').notNull().references(() => users.id),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: activityTypeEnum('type').notNull(),
  content: text('content'),
  channel: text('channel'),
  deal_id: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  person_id: uuid('person_id').references(() => people.id, { onDelete: 'set null' }),
  changes: jsonb('changes'),
  user_id: uuid('user_id').notNull().references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  type: taskTypeEnum('type').notNull().default('other'),
  status: taskStatusEnum('status').notNull().default('pending'),
  due_date: timestamp('due_date', { withTimezone: true }),
  remind_at: timestamp('remind_at', { withTimezone: true }),
  deal_id: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  person_id: uuid('person_id').references(() => people.id, { onDelete: 'set null' }),
  user_id: uuid('user_id').notNull().references(() => users.id),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- Groups ---

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  user_id: uuid('user_id').notNull().references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const groupMemberships = pgTable('group_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  group_id: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  person_id: uuid('person_id').references(() => people.id, { onDelete: 'set null' }),
  organization_id: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  role: text('role'),
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.group_id, t.person_id),
  unique().on(t.group_id, t.organization_id),
]);
