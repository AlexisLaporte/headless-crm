# Headless CRM

API-first contact management with a built-in **MCP server** — manage people, organizations, deals and activities from AI agents (Claude, etc.) or any REST client.

**Live**: [headless-crm.tuls.me](https://headless-crm.tuls.me)

## Features

- **REST API** — Full CRUD for organizations, people, deals, activities, tasks, campaigns
- **MCP Server** — Remote [Model Context Protocol](https://modelcontextprotocol.io) endpoint with 17 tools, Streamable HTTP transport
- **OAuth 2.1** — MCP authentication with dynamic client registration, PKCE, browser-based consent
- **Google SSO** — Web app authentication via Google OAuth
- **Deal pipeline** — Stage tracking (draft → sent → negotiation → won/lost) with automatic activity logging
- **Task reminders** — Cron-based notifications for overdue tasks
- **PWA** — Installable progressive web app

## MCP Server

Connect any MCP-compatible AI agent to your CRM data. The server exposes 17 tools:

| Category | Tools |
|----------|-------|
| Organizations | `list_organizations`, `get_organization`, `create_organization`, `update_organization` |
| People | `list_people`, `create_person`, `update_person` |
| Deals | `list_deals`, `get_deal`, `create_deal`, `update_deal`, `change_deal_stage` |
| Activities | `list_activities`, `log_activity` |
| Tasks | `list_tasks`, `create_task`, `complete_task` |

### Connect with Claude Code

```bash
claude mcp add --transport http headless-crm https://headless-crm.tuls.me/api/mcp
```

Or add to `.mcp.json`:

```json
{
  "mcpServers": {
    "headless-crm": {
      "type": "http",
      "url": "https://headless-crm.tuls.me/api/mcp"
    }
  }
}
```

No API token needed — OAuth 2.1 handles authentication automatically. On first use, your browser opens for Google SSO consent, then the MCP client caches the token.

### MCP Auth Flow

```
Client                              Server
  ├─ POST /api/mcp ──────────────►  401 + WWW-Authenticate
  ├─ GET /.well-known/oauth-*  ──►  Discovery metadata
  ├─ POST /api/oauth/register  ──►  Dynamic client registration
  ├─ Browser: /api/oauth/authorize  User logs in (Google SSO)
  ├─ POST /api/oauth/token ───────► Exchange code → access_token
  └─ POST /api/mcp (Bearer token) ► MCP JSON-RPC ✓
```

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, react-router-dom v7
- **Backend**: [Hono](https://hono.dev), TypeScript, Node.js
- **Database**: PostgreSQL + [Drizzle ORM](https://orm.drizzle.team)
- **Auth**: JWT (jose), Google OAuth, API tokens (SHA-256 hashed)
- **MCP**: [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) — Streamable HTTP transport

## Self-hosting

### Prerequisites

- Node.js 20+
- PostgreSQL

### Setup

```bash
git clone https://github.com/AlexisLaporte/headless-crm.git
cd headless-crm
npm install
cp .env.example .env  # Edit with your credentials
npm run db:push        # Create database tables
```

### Development

```bash
./dev/start.sh  # Starts Vite (:5173) + API (:5172)
```

### Production

```bash
npm run build                    # Build frontend
npm run start:server             # Start API server (port 3002)
```

The frontend (`dist/`) is served by nginx as static files, with `/api` and `/.well-known/oauth` proxied to the backend.

## API

All endpoints under `/api/`, authenticated via session cookie or `Authorization: Bearer hcrm_...` token.

```
GET|POST       /api/organizations
GET|PUT        /api/organizations/:id
GET|POST       /api/people
PUT            /api/people/:id
GET|POST       /api/deals
GET|PUT        /api/deals/:id
GET|POST       /api/activities
GET|POST       /api/tasks
PUT            /api/tasks/:id
GET|POST       /api/campaigns
GET|POST|DELETE /api/tokens
POST           /api/mcp              # MCP JSON-RPC endpoint
```

## License

MIT
