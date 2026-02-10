# Headless CRM

API-first contact management — React SPA + Hono API, PostgreSQL, JWT auth, Google SSO.

## Stack

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS 3, Lucide React, react-router-dom v7
- **Backend**: Hono + @hono/node-server, TypeScript
- **DB**: PostgreSQL + Drizzle ORM (`server/db/schema.ts`)
- **Auth**: JWT (jose HS256), cookie `hcrm_session`, Google OAuth, API tokens (`hcrm_...`)
- **Dev**: Vite proxy `/api` → API port, `concurrently`
- **MCP**: `server/mcp.ts` — MCP server wrapping the REST API (17 tools)

## Architecture

```
src/                              server/
  App.tsx                           index.ts          # Hono app
                                    mcp.ts            # MCP server (stdio)
  contexts/                         cron.ts           # Task reminders (node-cron)
    AuthContext.tsx                  db/
    DataContext.tsx                    schema.ts       # Drizzle schema (11 tables)
  components/                         seed.ts         # Demo data
    Auth.tsx                        routes/
    Layout.tsx                        auth.ts         # demo, google, me, logout
    Organizations.tsx                 organizations.ts
    OrganizationDetail.tsx            people.ts
    People.tsx                        campaigns.ts
    Campaigns.tsx                     deals.ts        # + auto-activities
    CampaignDetail.tsx                activities.ts   # stage_change side-effects
    Settings.tsx                      tasks.ts        # mark done → auto-activity
  data/                               groups.ts       # + membership
    seed.ts  # TS types               tokens.ts
```

## Commands

```sh
./dev/start.sh         # Vite :5173 + API :5172 (kill-before-start)
npm run build          # Frontend → dist/
npm run typecheck      # tsc --noEmit
npm run mcp            # MCP server (stdio, needs HCRM_API_TOKEN)
npm run db:push        # drizzle-kit push (schema → DB)
npm run db:seed        # Insert demo data
npm run start:server   # Production backend
```

## Environment

`.env` (see `.env.example`):
```
DATABASE_URL=postgres://hcrm:...@localhost:5432/hcrm
AUTH_SECRET=...
GOOGLE_CLIENT_ID=819344317236-...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/google/callback
PUBLIC_URL=http://localhost:5173
```

Local dev uses SSH tunnel to prod DB: `DATABASE_URL=postgres://hcrm:...@localhost:15432/hcrm`

## Conventions

- Page components = full CRUD with inline modals
- CRUD via DataContext (async, calls REST API)
- Types in `src/data/seed.ts` — Organization, Person, Campaign, Deal, Activity, Task, Group
- UI in French (except landing page), code in English
- All data filtered by `user_id` server-side
- Stage changes on deals go through activities (not direct update)

## Auth

- **Cookie**: `hcrm_session`, HttpOnly, Secure (prod), SameSite=Lax, domain `.tuls.me`, 30d
- **API tokens**: SHA-256 hashed, prefix `hcrm_`, returned once on creation
- **Google OAuth**: Client ID `819344317236`

## Deployment

- **Prod**: https://headless-crm.tuls.me (51.15.225.121)
- **Frontend**: CI/CD `.github/workflows/deploy.yml` → scp `dist/` → `/var/www/headless-crm`
- **Backend**: systemd `headless-crm.service`, env `/opt/headless-crm/.env`
- **Nginx**: `/etc/nginx/sites-enabled/headless-crm` — SPA + `/api` proxy → `:3002`
- **DB**: `hcrm` on prod PostgreSQL
- **Preview**: `https://{slug}.headless-crm.tuls.me` per PR
- **Old URL**: yacrm.tuls.me → 301 redirect

## MCP Server

`server/mcp.ts` — stdio MCP wrapping the REST API. 17 tools: CRUD organizations/people/deals, log activities, manage tasks, change deal stages.

**Config** (`~/.claude.json` → `/data/alexis`):
```json
{
  "headless-crm": {
    "type": "stdio",
    "command": "npx",
    "args": ["tsx", "/data/alexis/headless-crm/server/mcp.ts"],
    "env": {
      "HCRM_API_URL": "https://headless-crm.tuls.me",
      "HCRM_API_TOKEN": "hcrm_..."
    }
  }
}
```

## Docs

Detailed docs in `docs/`:
- `data-model.md` — Schema tables, fields, relations, enums
