# Headless CRM

API-first contact management — React SPA + Hono API, PostgreSQL, JWT auth, Google SSO.

## Stack

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS 3, Lucide React, react-router-dom v7
- **Backend**: Hono + @hono/node-server (port 3002), TypeScript
- **DB**: PostgreSQL + Drizzle ORM (`server/db/schema.ts`)
- **Auth**: JWT (jose HS256), cookie `hcrm_session`, Google OAuth, API tokens (`hcrm_...`)
- **MCP**: Remote Streamable HTTP + OAuth 2.1 (`@modelcontextprotocol/sdk`)
- **Dev**: Vite proxy `/api` → API port, `concurrently`

## Architecture

```
src/                              server/
  App.tsx                           index.ts          # Hono app + MCP endpoint
  contexts/                         mcp-tools.ts      # MCP tools (shared stdio/remote)
    AuthContext.tsx                  mcp.ts            # MCP stdio (local dev)
    DataContext.tsx                  cron.ts           # Task reminders (node-cron)
  components/                       db/
    Auth.tsx                          schema.ts       # Drizzle schema (11 tables)
    AuthGuard.tsx                     seed.ts         # Demo data
    Layout.tsx                      routes/
    Organizations.tsx                 auth.ts         # google, me, logout
    OrganizationDetail.tsx            oauth.ts        # OAuth 2.1 (register, authorize, token)
    People.tsx                        organizations.ts
    Campaigns.tsx                     people.ts
    CampaignDetail.tsx                campaigns.ts
    Settings.tsx                      deals.ts        # + auto-activities
  lib/                                activities.ts   # stage_change side-effects
    api.ts                            tasks.ts        # mark done → auto-activity
  data/                               groups.ts       # + membership
    seed.ts  # TS types               tokens.ts       # API tokens + mcp-setup
```

## Commands

```sh
./dev/start.sh         # Vite :5173 + API :5172 (kill-before-start)
npm run build          # Frontend → dist/
npm run typecheck      # tsc --noEmit
npm run mcp            # MCP server (stdio, local dev)
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
- Stage changes on deals MUST go through `POST /api/activities` with `type=stage_change`
- PWA service worker: `navigateFallbackDenylist: [/^\/api\//]` — never intercept API calls

## Auth

- **Cookie**: `hcrm_session`, HttpOnly, Secure (prod), SameSite=Lax, domain `.tuls.me`, 30d
- **API tokens**: SHA-256 hashed, prefix `hcrm_`, returned once on creation
- **Google OAuth**: Client ID `819344317236`, only auth method (no demo/password)
- **MCP OAuth 2.1**: Dynamic Client Registration + PKCE (S256), browser-based consent

## Deployment

- **Prod**: https://headless-crm.tuls.me (51.15.225.121)
- **CI/CD**: `.github/workflows/deploy.yml` — builds frontend, deploys frontend + backend, restarts service
- **Frontend**: scp `dist/` → `/var/www/headless-crm`
- **Backend**: scp `server/` + `package.json` → `/opt/headless-crm`, `npm install`, `systemctl restart`
- **Nginx**: SPA + `/api` proxy → `:3002` + `/.well-known/oauth` proxy → `:3002`
- **DB**: `hcrm` on prod PostgreSQL
- **Preview**: `https://{slug}.headless-crm.tuls.me` per PR

## MCP Server

Remote MCP at `https://headless-crm.tuls.me/api/mcp` — Streamable HTTP transport, stateless (new server per request), 17 tools.

Auth via OAuth 2.1 — clients discover endpoints via `/.well-known/`, register dynamically, authorize via browser (reuses CRM session cookie).

**Config** (`~/.claude.json`):
```json
{
  "headless-crm": {
    "type": "http",
    "url": "https://headless-crm.tuls.me/api/mcp"
  }
}
```

No token needed — OAuth handles auth automatically on first use.

**OAuth endpoints**: `/api/oauth/register`, `/api/oauth/authorize`, `/api/oauth/token`
**Discovery**: `/.well-known/oauth-protected-resource/*`, `/.well-known/oauth-authorization-server`

## Docs

Detailed docs in `docs/`:
- `data-model.md` — Schema tables, fields, relations, enums

MCP + OAuth implementation guide: `/data/alexis/infra/docs/mcp-remote-oauth.md`
