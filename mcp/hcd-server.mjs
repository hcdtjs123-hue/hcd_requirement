import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

loadLocalEnv()

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL belum diisi. Anda juga bisa memakai VITE_SUPABASE_URL.')
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY belum diisi. Anda juga bisa memakai VITE_SUPABASE_SERVICE_ROLE_KEY.',
  )
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const server = new McpServer(
  {
    name: 'hcd-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      logging: {},
    },
  },
)

const jobRequestSelect = `
  id,
  pt_pembebanan,
  employment_status,
  direct_manager,
  designation,
  site,
  working_location,
  custom_grup_1,
  custom_grup_2,
  custom_grup_3,
  custom_grup_4,
  custom_grup_5,
  custom_grup_6,
  required_date,
  position_status,
  periode_probation,
  main_position,
  created_by,
  created_at,
  updated_at
`

const candidateSelect = `
  *,
  job_request:new_employee_application_form(
    id,
    main_position,
    designation,
    site
  ),
  family_and_emergency(*),
  education(*),
  work_history(*),
  personal_statement(*)
`

const recruitmentTrackingSelect = `
  *,
  files:job_posting_files(*),
  job_request:new_employee_application_form(
    id,
    main_position,
    designation,
    site,
    employment_status,
    required_date
  )
`

const invitationSelect = `
  *,
  interviews:interview_schedules(*)
`

const positiveLimitSchema = z.number().int().min(1).max(100).default(20)

server.registerResource(
  'hcd-guide',
  'hcd://guide/overview',
  {
    title: 'HCD MCP Overview',
    description: 'Ringkasan tool MCP yang tersedia untuk sistem HCD.',
    mimeType: 'text/markdown',
  },
  async () => ({
    contents: [
      {
        uri: 'hcd://guide/overview',
        mimeType: 'text/markdown',
        text: [
          '# HCD MCP',
          '',
          'Server ini menyediakan akses read-only ke data HCD melalui Supabase.',
          '',
          'Tools yang tersedia:',
          '- list_job_requests',
          '- get_job_request',
          '- list_candidates',
          '- get_candidate',
          '- list_recruitment_trackings',
          '- get_recruitment_tracking',
          '- list_candidate_invitations',
        ].join('\n'),
      },
    ],
  }),
)

server.registerTool(
  'list_job_requests',
  {
    title: 'List Job Requests',
    description: 'Ambil daftar job request dengan filter opsional.',
    inputSchema: {
      search: z.string().trim().min(1).optional(),
      site: z.string().trim().min(1).optional(),
      position_status: z.string().trim().min(1).optional(),
      employment_status: z.string().trim().min(1).optional(),
      created_by: z.string().uuid().optional(),
      limit: positiveLimitSchema.optional(),
    },
  },
  async ({ search, site, position_status, employment_status, created_by, limit = 20 }) => {
    let query = supabase
      .from('new_employee_application_form')
      .select(jobRequestSelect)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (site) query = query.eq('site', site)
    if (position_status) query = query.eq('position_status', position_status)
    if (employment_status) query = query.eq('employment_status', employment_status)
    if (created_by) query = query.eq('created_by', created_by)
    if (search) {
      query = query.or(
        [
          `main_position.ilike.%${escapeLike(search)}%`,
          `designation.ilike.%${escapeLike(search)}%`,
          `site.ilike.%${escapeLike(search)}%`,
          `direct_manager.ilike.%${escapeLike(search)}%`,
        ].join(','),
      )
    }

    const { data, error } = await query

    if (error) {
      return errorResult(error.message)
    }

    return successResult({
      total: data?.length ?? 0,
      items: data ?? [],
    })
  },
)

server.registerTool(
  'get_job_request',
  {
    title: 'Get Job Request',
    description: 'Ambil detail satu job request berdasarkan id.',
    inputSchema: {
      id: z.string().uuid(),
    },
  },
  async ({ id }) => {
    const { data, error } = await supabase
      .from('new_employee_application_form')
      .select(jobRequestSelect)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      return errorResult(error.message)
    }

    if (!data) {
      return errorResult(`Job request dengan id ${id} tidak ditemukan.`)
    }

    return successResult(data)
  },
)

server.registerTool(
  'list_candidates',
  {
    title: 'List Candidates',
    description: 'Ambil daftar kandidat dengan filter opsional.',
    inputSchema: {
      job_request_id: z.string().uuid().optional(),
      candidate_id: z.string().uuid().optional(),
      email: z.string().email().optional(),
      name: z.string().trim().min(1).optional(),
      limit: positiveLimitSchema.optional(),
    },
  },
  async ({ job_request_id, candidate_id, email, name, limit = 20 }) => {
    let query = supabase
      .from('main_application_form')
      .select(candidateSelect)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (job_request_id) query = query.eq('job_request_id', job_request_id)
    if (candidate_id) query = query.eq('candidate_id', candidate_id)
    if (email) query = query.eq('personal_email', email)
    if (name) {
      query = query.or(
        [
          `first_name.ilike.%${escapeLike(name)}%`,
          `middle_name.ilike.%${escapeLike(name)}%`,
          `last_name.ilike.%${escapeLike(name)}%`,
        ].join(','),
      )
    }

    const { data, error } = await query

    if (error) {
      return errorResult(error.message)
    }

    const items = (data ?? []).map(normalizeCandidate)

    return successResult({
      total: items.length,
      items,
    })
  },
)

server.registerTool(
  'get_candidate',
  {
    title: 'Get Candidate',
    description: 'Ambil detail satu kandidat berdasarkan id.',
    inputSchema: {
      id: z.string().uuid(),
    },
  },
  async ({ id }) => {
    const { data, error } = await supabase
      .from('main_application_form')
      .select(candidateSelect)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      return errorResult(error.message)
    }

    if (!data) {
      return errorResult(`Kandidat dengan id ${id} tidak ditemukan.`)
    }

    return successResult(normalizeCandidate(data))
  },
)

server.registerTool(
  'list_recruitment_trackings',
  {
    title: 'List Recruitment Trackings',
    description: 'Ambil daftar recruitment tracking dengan filter opsional.',
    inputSchema: {
      job_request_id: z.string().uuid().optional(),
      status: z.string().trim().min(1).optional(),
      limit: positiveLimitSchema.optional(),
    },
  },
  async ({ job_request_id, status, limit = 20 }) => {
    let query = supabase
      .from('recruitment_tracking')
      .select(recruitmentTrackingSelect)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (job_request_id) query = query.eq('job_request_id', job_request_id)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      return errorResult(error.message)
    }

    const items = (data ?? []).map(normalizeTracking)

    return successResult({
      total: items.length,
      items,
    })
  },
)

server.registerTool(
  'get_recruitment_tracking',
  {
    title: 'Get Recruitment Tracking',
    description: 'Ambil detail satu recruitment tracking berdasarkan id.',
    inputSchema: {
      id: z.string().uuid(),
    },
  },
  async ({ id }) => {
    const { data, error } = await supabase
      .from('recruitment_tracking')
      .select(recruitmentTrackingSelect)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      return errorResult(error.message)
    }

    if (!data) {
      return errorResult(`Recruitment tracking dengan id ${id} tidak ditemukan.`)
    }

    return successResult(normalizeTracking(data))
  },
)

server.registerTool(
  'list_candidate_invitations',
  {
    title: 'List Candidate Invitations',
    description: 'Ambil daftar undangan kandidat berdasarkan tracking atau status.',
    inputSchema: {
      tracking_id: z.string().uuid().optional(),
      status: z.string().trim().min(1).optional(),
      limit: positiveLimitSchema.optional(),
    },
  },
  async ({ tracking_id, status, limit = 20 }) => {
    let query = supabase
      .from('candidate_invitations')
      .select(invitationSelect)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (tracking_id) query = query.eq('tracking_id', tracking_id)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      return errorResult(error.message)
    }

    const items = (data ?? []).map(normalizeInvitation)

    return successResult({
      total: items.length,
      items,
    })
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(async (error) => {
  try {
    await server.sendLoggingMessage({
      level: 'error',
      data: String(error instanceof Error ? error.message : error),
    })
  } catch {}

  console.error(error)
  process.exit(1)
})

function successResult(data) {
  return {
    structuredContent: data,
    content: [
      {
        type: 'text',
        text: toJson(data),
      },
    ],
  }
}

function errorResult(message) {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
  }
}

function normalizeCandidate(data) {
  return {
    ...data,
    family_and_emergency: Array.isArray(data.family_and_emergency) ? data.family_and_emergency : [],
    education: Array.isArray(data.education) ? data.education : [],
    work_history: Array.isArray(data.work_history) ? data.work_history : [],
    personal_statement: Array.isArray(data.personal_statement)
      ? data.personal_statement[0] || null
      : data.personal_statement || null,
  }
}

function normalizeTracking(data) {
  return {
    ...data,
    files: Array.isArray(data.files) ? data.files : [],
  }
}

function normalizeInvitation(data) {
  return {
    ...data,
    interviews: Array.isArray(data.interviews) ? data.interviews : [],
  }
}

function toJson(value) {
  return JSON.stringify(value, null, 2)
}

function escapeLike(value) {
  return value.replaceAll('%', '\\%').replaceAll(',', '\\,')
}

function loadLocalEnv() {
  const cwd = process.cwd()
  const candidates = ['.env', '.env.local']

  for (const fileName of candidates) {
    const filePath = resolve(cwd, fileName)
    if (!existsSync(filePath)) continue

    const content = readFileSync(filePath, 'utf8')
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue

      const separatorIndex = line.indexOf('=')
      if (separatorIndex === -1) continue

      const key = line.slice(0, separatorIndex).trim()
      let value = line.slice(separatorIndex + 1).trim()

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  }
}
