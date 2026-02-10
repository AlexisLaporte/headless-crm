import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

type ApiFn = (method: string, path: string, body?: unknown) => Promise<unknown>;

export function makeApiFn(apiUrl: string, token: string): ApiFn {
  return async (method, path, body) => {
    const res = await fetch(`${apiUrl}/api${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    return data;
  };
}

const tools = [
  // Organizations
  {
    name: 'list_organizations',
    description: 'List all organizations in the CRM',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_organization',
    description: 'Get organization details with associated people',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'string', description: 'Organization ID' } },
      required: ['id'],
    },
  },
  {
    name: 'create_organization',
    description: 'Create a new organization',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' },
        industry: { type: 'string' },
        website: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_organization',
    description: 'Update an existing organization',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Organization ID' },
        name: { type: 'string' },
        industry: { type: 'string' },
        website: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['id'],
    },
  },
  // People
  {
    name: 'list_people',
    description: 'List all people (contacts) in the CRM, includes organization_name',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'create_person',
    description: 'Create a new person (contact)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        job_title: { type: 'string' },
        notes: { type: 'string' },
        organization_id: { type: 'string', description: 'Link to an organization' },
      },
      required: ['first_name', 'last_name'],
    },
  },
  {
    name: 'update_person',
    description: 'Update an existing person',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Person ID' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        job_title: { type: 'string' },
        notes: { type: 'string' },
        organization_id: { type: 'string' },
      },
      required: ['id'],
    },
  },
  // Deals
  {
    name: 'list_deals',
    description: 'List all deals with person/organization names. Stages: draft, sent, negotiation, won, lost',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'get_deal',
    description: 'Get deal details with recent activities and open tasks',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'string', description: 'Deal ID' } },
      required: ['id'],
    },
  },
  {
    name: 'create_deal',
    description: 'Create a new deal (auto-creates a deal_created activity)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' },
        stage: { type: 'string', enum: ['draft', 'sent', 'negotiation', 'won', 'lost'] },
        amount: { type: 'number' },
        person_id: { type: 'string' },
        organization_id: { type: 'string' },
        metadata: { type: 'object', description: 'Arbitrary JSON metadata' },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_deal',
    description: 'Update deal fields (title, amount, person, organization). For stage changes, use change_deal_stage.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Deal ID' },
        title: { type: 'string' },
        amount: { type: 'number' },
        person_id: { type: 'string' },
        organization_id: { type: 'string' },
        metadata: { type: 'object' },
      },
      required: ['id'],
    },
  },
  {
    name: 'change_deal_stage',
    description: 'Change a deal stage (creates a stage_change activity). For won/lost, provide closed_reason.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deal_id: { type: 'string' },
        stage: { type: 'string', enum: ['draft', 'sent', 'negotiation', 'won', 'lost'] },
        closed_reason: { type: 'string', description: 'Reason for won/lost' },
        content: { type: 'string', description: 'Optional note about the stage change' },
      },
      required: ['deal_id', 'stage'],
    },
  },
  // Activities
  {
    name: 'list_activities',
    description: 'List activities with optional filters. Types: call, email, meeting, note, linkedin_message, stage_change, deal_created, deal_won, deal_lost, other',
    inputSchema: {
      type: 'object' as const,
      properties: {
        deal_id: { type: 'string' },
        person_id: { type: 'string' },
        type: { type: 'string' },
        limit: { type: 'number', description: 'Max results (default 50)' },
      },
    },
  },
  {
    name: 'log_activity',
    description: 'Log an activity (call, email, meeting, note, etc.) on a deal and/or person',
    inputSchema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: ['call', 'email', 'meeting', 'note', 'linkedin_message', 'other'] },
        content: { type: 'string', description: 'Activity description/notes' },
        channel: { type: 'string' },
        deal_id: { type: 'string' },
        person_id: { type: 'string' },
      },
      required: ['type', 'content'],
    },
  },
  // Tasks
  {
    name: 'list_tasks',
    description: 'List tasks with optional filters',
    inputSchema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['pending', 'done', 'cancelled'] },
        deal_id: { type: 'string' },
        overdue: { type: 'boolean', description: 'Only overdue pending tasks' },
      },
    },
  },
  {
    name: 'create_task',
    description: 'Create a task (follow-up, call, email, meeting, other)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string', enum: ['follow_up', 'call', 'email', 'meeting', 'other'] },
        due_date: { type: 'string', description: 'ISO date string' },
        remind_at: { type: 'string', description: 'ISO datetime for reminder' },
        deal_id: { type: 'string' },
        person_id: { type: 'string' },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task as done (auto-creates a completion activity)',
    inputSchema: {
      type: 'object' as const,
      properties: { id: { type: 'string', description: 'Task ID' } },
      required: ['id'],
    },
  },
];

async function handleTool(api: ApiFn, name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'list_organizations':
      return api('GET', '/organizations');
    case 'get_organization':
      return api('GET', `/organizations/${args.id}`);
    case 'create_organization':
      return api('POST', '/organizations', args);
    case 'update_organization': {
      const { id, ...body } = args;
      return api('PUT', `/organizations/${id}`, body);
    }
    case 'list_people':
      return api('GET', '/people');
    case 'create_person':
      return api('POST', '/people', args);
    case 'update_person': {
      const { id, ...body } = args;
      return api('PUT', `/people/${id}`, body);
    }
    case 'list_deals':
      return api('GET', '/deals');
    case 'get_deal':
      return api('GET', `/deals/${args.id}`);
    case 'create_deal':
      return api('POST', '/deals', args);
    case 'update_deal': {
      const { id, ...body } = args;
      return api('PUT', `/deals/${id}`, body);
    }
    case 'change_deal_stage': {
      const { deal_id, stage, closed_reason, content } = args as {
        deal_id: string; stage: string; closed_reason?: string; content?: string;
      };
      return api('POST', '/activities', {
        type: 'stage_change',
        deal_id,
        content,
        changes: { stage: { to: stage }, ...(closed_reason ? { closed_reason } : {}) },
      });
    }
    case 'list_activities': {
      const params = new URLSearchParams();
      if (args.deal_id) params.set('deal_id', args.deal_id as string);
      if (args.person_id) params.set('person_id', args.person_id as string);
      if (args.type) params.set('type', args.type as string);
      if (args.limit) params.set('limit', String(args.limit));
      const qs = params.toString();
      return api('GET', `/activities${qs ? `?${qs}` : ''}`);
    }
    case 'log_activity':
      return api('POST', '/activities', args);
    case 'list_tasks': {
      const params = new URLSearchParams();
      if (args.status) params.set('status', args.status as string);
      if (args.deal_id) params.set('deal_id', args.deal_id as string);
      if (args.overdue) params.set('overdue', 'true');
      const qs = params.toString();
      return api('GET', `/tasks${qs ? `?${qs}` : ''}`);
    }
    case 'create_task':
      return api('POST', '/tasks', args);
    case 'complete_task':
      return api('PUT', `/tasks/${args.id}`, { status: 'done' });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export function createMcpServer(api: ApiFn): Server {
  const server = new Server(
    { name: 'headless-crm', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const result = await handleTool(api, name, (args || {}) as Record<string, unknown>);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  });

  return server;
}
