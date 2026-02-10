# Data Model

PostgreSQL schema via Drizzle ORM (`server/db/schema.ts`). All tables use UUID PKs, `user_id` FK for multi-tenancy.

## Enums

| Enum | Values |
|------|--------|
| `campaign_type` | email, social, ads, event, other |
| `campaign_status` | draft, active, paused, completed |
| `deal_stage` | draft, sent, negotiation, won, lost |
| `activity_type` | call, email, meeting, note, linkedin_message, stage_change, other |
| `task_status` | pending, done, cancelled |
| `task_type` | follow_up, call, email, meeting, other |
| `campaign_person_status` | pending, sent, opened, clicked, responded |

## Tables

### users

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| name | text | |
| email | text UNIQUE | |
| google_id | text | nullable, for OAuth |
| role | text | |
| avatar | text | initials (e.g. "MD") |
| created_at, updated_at | timestamptz | |

### organizations

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| name | text NOT NULL | |
| industry, website, phone, email | text | all default '' |
| address, city, country | text | all default '' |
| notes | text | default '' |
| user_id | uuid FK users | NOT NULL |
| created_at, updated_at | timestamptz | |

### people

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| first_name, last_name | text NOT NULL | |
| email, phone, job_title, notes | text | all default '' |
| organization_id | uuid FK organizations | SET NULL |
| user_id | uuid FK users | NOT NULL |
| created_at, updated_at | timestamptz | |

### campaigns

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| name | text NOT NULL | |
| type | campaign_type | default 'email' |
| status | campaign_status | default 'draft' |
| start_date, end_date | text | nullable |
| budget | numeric(12,2) | default 0 |
| description, subject, message_body | text | default '' |
| user_id | uuid FK users | NOT NULL |
| created_at, updated_at | timestamptz | |

### campaign_people

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| campaign_id | uuid FK campaigns | CASCADE |
| person_id | uuid FK people | CASCADE |
| status | campaign_person_status | default 'pending' |
| created_at | timestamptz | |
| | UNIQUE | (campaign_id, person_id) |

### deals

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| title | text NOT NULL | |
| stage | deal_stage | default 'draft' |
| amount | numeric(12,2) | nullable |
| closed_reason | text | nullable |
| person_id | uuid FK people | SET NULL |
| organization_id | uuid FK organizations | SET NULL |
| user_id | uuid FK users | NOT NULL |
| metadata | jsonb | nullable |
| created_at, updated_at | timestamptz | |

### activities (append-only)

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| type | activity_type | NOT NULL |
| content | text | nullable |
| channel | text | nullable |
| deal_id | uuid FK deals | CASCADE, nullable |
| person_id | uuid FK people | SET NULL, nullable |
| changes | jsonb | nullable (for stage_change) |
| user_id | uuid FK users | NOT NULL |
| created_at | timestamptz | immutable |

### tasks

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| title | text NOT NULL | |
| description | text | nullable |
| type | task_type | default 'other' |
| status | task_status | default 'pending' |
| due_date | timestamptz | nullable |
| remind_at | timestamptz | nullable (cron checks every 5min) |
| deal_id | uuid FK deals | CASCADE, nullable |
| person_id | uuid FK people | SET NULL, nullable |
| user_id | uuid FK users | NOT NULL |
| completed_at | timestamptz | nullable |
| created_at, updated_at | timestamptz | |

### groups

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| name | text NOT NULL | |
| description | text | nullable |
| user_id | uuid FK users | NOT NULL |
| created_at, updated_at | timestamptz | |

### group_memberships

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| group_id | uuid FK groups | CASCADE |
| person_id | uuid FK people | SET NULL, nullable |
| organization_id | uuid FK organizations | SET NULL, nullable |
| role | text | nullable |
| notes | text | nullable |
| created_at | timestamptz | |
| | UNIQUE | (group_id, person_id) WHERE person_id IS NOT NULL |
| | UNIQUE | (group_id, organization_id) WHERE organization_id IS NOT NULL |

### api_tokens

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| name | text NOT NULL | |
| token_hash | text NOT NULL | SHA-256 of raw token |
| user_id | uuid FK users | CASCADE |
| last_used_at | timestamptz | nullable |
| created_at | timestamptz | |

## Relations

```
Organization 1──N People
Organization 1──N Deals
Organization 1──N GroupMemberships

Person 1──N Deals
Person 1──N Activities
Person 1──N Tasks
Person 1──N CampaignPeople
Person 1──N GroupMemberships

Deal 1──N Activities (CASCADE)
Deal 1──N Tasks (CASCADE)

Campaign 1──N CampaignPeople (CASCADE)
Group 1──N GroupMemberships (CASCADE)

User 1──N [all entities]
```

## API Endpoints

### Auth (public)
- `POST /api/auth/demo` `{ email }` → set cookie
- `GET /api/auth/google` → redirect to Google
- `GET /api/auth/google/callback` → set cookie → redirect /app
- `GET /api/auth/me` → current user
- `POST /api/auth/logout` → clear cookie

### Protected (all filtered by user_id)
- `GET/POST /api/organizations`, `GET/PUT/DELETE /:id`
- `GET/POST /api/people`, `PUT/DELETE /:id`
- `GET/POST /api/campaigns`, `GET/PUT/DELETE /:id`, `PUT /:id/people { person_ids }`
- `GET/POST /api/deals`, `GET/PUT/DELETE /:id`, `GET /:id/activities`, `GET /:id/tasks`
- `POST/GET /api/activities`, `GET /:id`
- `GET/POST /api/tasks`, `PUT/DELETE /:id`
- `GET/POST /api/groups`, `GET/PUT/DELETE /:id`, `POST /:id/members`, `DELETE /:id/members/:mid`
- `GET/POST /api/tokens`, `DELETE /:id`

## Seed Data

| Entity | Count |
|--------|-------|
| Users | 3 |
| Organizations | 8 |
| People | 14 |
| Campaigns | 5 |
| CampaignPeople | 19 |
