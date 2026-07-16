// 🧪 HydraLLM Demo — Service Worker Mock API
// 拦截所有 /api/* 请求，返回仅前端演示用模拟数据
// 注册方式：在 React UI 的 index.html 中 <script> 注册

const DEMO_PASSWORD = 'admin'
const DEMO_SESSION = 'demo-session-8f7a3b2c1d'
let isLoggedIn = false

// 模拟统计计数（有记忆，页面刷新后重置）
const mockStats = {
  startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  requests: 1842,
  successes: 1796,
  failures: 46,
  failovers: 38,
  targets: {},
  chains: {},
  channelModels: {},
  logs: [],
  activeThreads: [],
}

function generateMockConfig() {
  return {
    adminToken: 'admin',
    proxyKeys: [
      { name: '开发环境', key: 'sk-dev-key-001', enabled: true },
      { name: '生产环境', key: 'sk-prod-key-002', enabled: true },
      { name: '测试密钥', key: 'sk-test-key-003', enabled: false },
    ],
    failoverStatusCodes: [401, 403, 408, 409, 429, 500, 502, 503, 504],
    requestTimeoutMs: 120000,
    circuitBreaker: {
      failureThreshold: 3,
      cooldownMinutes: 10,
      immediateCooldownStatusCodes: [429],
    },
    modelSource: {
      enabled: false,
      url: '',
      apiKey: '',
      refreshSeconds: 300,
      include: '',
      exclude: '',
      publicPrefix: '',
      publicSuffix: '',
      targets: [
        {
          name: 'primary-openai',
          baseUrl: 'https://api.openai.com/v1',
          apiKey: 'sk-••••••••••••••••',
          modelNameTemplate: '{model}',
          enabled: true,
        },
      ],
    },
    models: [
      {
        publicName: 'primary-gpt',
        enabled: true,
        concurrency: 3,
        releaseDelayMs: 0,
        targets: [
          {
            name: 'primary-openai',
            baseUrl: 'https://api.openai.com/v1',
            apiKey: 'sk-••••••••••••••••',
            modelName: 'gpt-4o',
            enabled: true,
          },
          {
            name: 'backup-openai',
            baseUrl: 'https://api.openai.com/v1',
            apiKey: 'sk-••••••••••••••••',
            modelName: 'gpt-4.1-mini',
            enabled: true,
          },
          {
            name: 'claude-fallback',
            baseUrl: 'https://api.anthropic.com/v1',
            apiKey: 'sk-ant-••••••••••••••••',
            modelName: 'claude-3-opus-20240229',
            enabled: true,
          },
        ],
      },
      {
        publicName: 'deepseek-chat',
        enabled: true,
        concurrency: 2,
        releaseDelayMs: 0,
        targets: [
          {
            name: 'deepseek-provider',
            baseUrl: 'https://api.deepseek.com/v1',
            apiKey: 'sk-••••••••••••••••',
            modelName: 'deepseek-chat',
            enabled: true,
          },
          {
            name: 'backup-openai',
            baseUrl: 'https://api.openai.com/v1',
            apiKey: 'sk-••••••••••••••••',
            modelName: 'gpt-4.1-mini',
            enabled: true,
          },
        ],
      },
      {
        publicName: 'claude-3.5-sonnet',
        enabled: false,
        concurrency: 1,
        releaseDelayMs: 0,
        targets: [
          {
            name: 'claude-fallback',
            baseUrl: 'https://api.anthropic.com/v1',
            apiKey: 'sk-ant-••••••••••••••••',
            modelName: 'claude-3-5-sonnet-20241022',
            enabled: true,
          },
        ],
      },
    ],
    providers: [
      {
        id: 'provider-1',
        name: 'primary-openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-••••••••••••••••',
        models: ['gpt-4o', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4.5-preview', 'o3-mini'],
        status: 'online',
        latency: 234,
        lastCheck: Date.now() - 30000,
      },
      {
        id: 'provider-2',
        name: 'backup-openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-••••••••••••••••',
        models: ['gpt-4.1-mini', 'gpt-4.1-nano'],
        status: 'online',
        latency: 312,
        lastCheck: Date.now() - 24000,
      },
      {
        id: 'provider-3',
        name: 'claude-fallback',
        baseUrl: 'https://api.anthropic.com/v1',
        apiKey: 'sk-ant-••••••••••••••••',
        models: ['claude-3-opus-20240229', 'claude-3-5-sonnet-20241022'],
        status: 'online',
        latency: 567,
        lastCheck: Date.now() - 15000,
      },
      {
        id: 'provider-4',
        name: 'deepseek-provider',
        baseUrl: 'https://api.deepseek.com/v1',
        apiKey: 'sk-••••••••••••••••',
        models: ['deepseek-chat', 'deepseek-reasoner'],
        status: 'offline',
        latency: 0,
        lastCheck: Date.now() - 60000,
      },
    ],
  }
}

function generateMockStats() {
  return {
    startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    requests: 1842,
    successes: 1796,
    failures: 46,
    failovers: 38,
    targets: {
      'primary-gpt/primary-openai/gpt-4o/https://api.openai.com/v1': {
        model: 'primary-gpt',
        target: 'primary-openai',
        upstreamModel: 'gpt-4o',
        baseUrl: 'https://api.openai.com/v1',
        ok: 864,
        error: 12,
        consecutiveFailures: 0,
        disabledUntil: 0,
        lastStatus: 'ok',
        lastError: '',
        lastLatencyMs: 234,
        avgLatencyMs: 287,
      },
      'primary-gpt/backup-openai/gpt-4.1-mini/https://api.openai.com/v1': {
        model: 'primary-gpt',
        target: 'backup-openai',
        upstreamModel: 'gpt-4.1-mini',
        baseUrl: 'https://api.openai.com/v1',
        ok: 312,
        error: 5,
        consecutiveFailures: 1,
        disabledUntil: 0,
        lastStatus: 'ok',
        lastError: '',
        lastLatencyMs: 345,
        avgLatencyMs: 378,
      },
      'primary-gpt/claude-fallback/claude-3-opus-20240229/https://api.anthropic.com/v1': {
        model: 'primary-gpt',
        target: 'claude-fallback',
        upstreamModel: 'claude-3-opus-20240229',
        baseUrl: 'https://api.anthropic.com/v1',
        ok: 45,
        error: 2,
        consecutiveFailures: 0,
        disabledUntil: 0,
        lastStatus: 'ok',
        lastError: '',
        lastLatencyMs: 892,
        avgLatencyMs: 934,
      },
      'deepseek-chat/deepseek-provider/deepseek-chat/https://api.deepseek.com/v1': {
        model: 'deepseek-chat',
        target: 'deepseek-provider',
        upstreamModel: 'deepseek-chat',
        baseUrl: 'https://api.deepseek.com/v1',
        ok: 0,
        error: 14,
        consecutiveFailures: 14,
        disabledUntil: Date.now() + 360000,
        lastStatus: 'error',
        lastError: 'connect ECONNREFUSED 104.18.25.14:443',
        lastLatencyMs: 120000,
        avgLatencyMs: 120000,
      },
      'deepseek-chat/backup-openai/gpt-4.1-mini/https://api.openai.com/v1': {
        model: 'deepseek-chat',
        target: 'backup-openai',
        upstreamModel: 'gpt-4.1-mini',
        baseUrl: 'https://api.openai.com/v1',
        ok: 621,
        error: 13,
        consecutiveFailures: 0,
        disabledUntil: 0,
        lastStatus: 'ok',
        lastError: '',
        lastLatencyMs: 267,
        avgLatencyMs: 302,
      },
    },
    chains: {
      'primary-gpt': { requests: 1221, successes: 1198, failures: 23, failovers: 18 },
      'deepseek-chat': { requests: 621, successes: 598, failures: 23, failovers: 20 },
      'claude-3.5-sonnet': { requests: 0, successes: 0, failures: 0, failovers: 0 },
    },
    channelModels: {
      'https://api.openai.com/v1': {
        name: 'primary-openai',
        baseUrl: 'https://api.openai.com/v1',
        requests: 1797,
        successes: 1756,
        failures: 41,
        models: {
          'gpt-4o': { requests: 864, successes: 855, failures: 9 },
          'gpt-4.1-mini': { requests: 933, successes: 901, failures: 32 },
        },
      },
      'https://api.anthropic.com/v1': {
        name: 'claude-fallback',
        baseUrl: 'https://api.anthropic.com/v1',
        requests: 45,
        successes: 43,
        failures: 2,
        models: {
          'claude-3-opus-20240229': { requests: 45, successes: 43, failures: 2 },
        },
      },
    },
    logs: [
      { id: 'log-01', timestamp: Date.now() - 3000, chainName: 'primary-gpt', originalModel: 'gpt-4o', failedModels: [], finalModel: 'gpt-4o', status: 'ok', latency: 245, error: '' },
      { id: 'log-02', timestamp: Date.now() - 8000, chainName: 'deepseek-chat', originalModel: 'deepseek-chat', failedModels: ['deepseek-chat'], finalModel: 'gpt-4.1-mini', status: 'failover', latency: 1284, error: '' },
      { id: 'log-03', timestamp: Date.now() - 15000, chainName: 'primary-gpt', originalModel: 'gpt-4o', failedModels: [], finalModel: 'gpt-4o', status: 'ok', latency: 312, error: '' },
      { id: 'log-04', timestamp: Date.now() - 22000, chainName: 'primary-gpt', originalModel: 'gpt-4o', failedModels: ['gpt-4o', 'gpt-4.1-mini'], finalModel: 'claude-3-opus-20240229', status: 'failover', latency: 3489, error: '' },
      { id: 'log-05', timestamp: Date.now() - 35000, chainName: 'deepseek-chat', originalModel: 'deepseek-chat', failedModels: ['deepseek-chat'], finalModel: 'gpt-4.1-mini', status: 'failover', latency: 2321, error: '' },
      { id: 'log-06', timestamp: Date.now() - 48000, chainName: 'primary-gpt', originalModel: 'gpt-4o', failedModels: [], finalModel: 'gpt-4o', status: 'ok', latency: 198, error: '' },
      { id: 'log-07', timestamp: Date.now() - 62000, chainName: 'primary-gpt', originalModel: 'gpt-4o', failedModels: [], finalModel: 'gpt-4o', status: 'ok', latency: 276, error: '' },
      { id: 'log-08', timestamp: Date.now() - 81000, chainName: 'deepseek-chat', originalModel: 'deepseek-chat', failedModels: [], finalModel: 'deepseek-chat', status: 'error', latency: 120023, error: 'connect ECONNREFUSED' },
    ],
    activeThreads: [],
  }
}

// ---- 路由处理 ----
async function handleRequest(event: FetchEvent): Promise<Response> {
  const { request } = event
  const url = new URL(request.url)
  const { pathname } = url
  const method = request.method.toUpperCase()

  // 只处理 /api/* 路径
  if (!pathname.startsWith('/api')) {
    return fetch(request)
  }

  // CORS headers（同源 iframe 也需要）
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-session',
    'Access-Control-Allow-Credentials': 'true',
  }

  // OPTIONS 预检
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // 解析 body
  let body: Record<string, unknown> = {}
  if (['POST', 'PUT'].includes(method)) {
    try {
      const text = await request.clone().text()
      if (text) body = JSON.parse(text)
    } catch { /* ignore */ }
  }

  const adminSession = request.headers.get('x-admin-session') || ''
  const isAuthed = isLoggedIn || adminSession === DEMO_SESSION

  // ---- 认证路由 ----
  if (pathname === '/api/login' && method === 'POST') {
    if (body.token === DEMO_PASSWORD) {
      isLoggedIn = true
      return Response.json({ ok: true, session: DEMO_SESSION }, { headers: corsHeaders })
    }
    return Response.json(
      { error: { message: 'Invalid admin token', type: 'proxy_error' } },
      { status: 401, headers: corsHeaders },
    )
  }

  if (pathname === '/api/logout' && method === 'POST') {
    isLoggedIn = false
    return Response.json({ ok: true }, { headers: corsHeaders })
  }

  if (pathname === '/api/session' && method === 'GET') {
    return Response.json({ ok: isAuthed }, { headers: corsHeaders })
  }

  // ---- 需要认证的路由 ----
  if (!isAuthed) {
    return Response.json(
      { error: { message: 'Unauthorized', type: 'proxy_error' } },
      { status: 401, headers: corsHeaders },
    )
  }

  // GET /api/config
  if (pathname === '/api/config' && method === 'GET') {
    return Response.json(generateMockConfig(), { headers: corsHeaders })
  }

  // POST /api/config
  if (pathname === '/api/config' && method === 'POST') {
    return Response.json({ ok: true, config: generateMockConfig() }, { headers: corsHeaders })
  }

  // GET /api/stats
  if (pathname === '/api/stats' && method === 'GET') {
    return Response.json(generateMockStats(), { headers: corsHeaders })
  }

  // POST /api/providers/health
  if (pathname === '/api/providers/health' && method === 'POST') {
    return Response.json({
      ok: true,
      providers: generateMockConfig().providers.map((p) => ({
        id: p.id,
        name: p.name,
        baseUrl: p.baseUrl,
        status: p.status,
        latency: p.latency,
        models: p.models,
        error: '',
      })),
    }, { headers: corsHeaders })
  }

  // POST /api/model-tests/run
  if (pathname === '/api/model-tests/run' && method === 'POST') {
    const targets = (body.targets as any[]) || []
    const capabilities = (body.capabilities as string[]) || ['text', 'vision', 'tool']

    const results = targets.map((t: any) => ({
      id: `${t.providerId || 'unknown'}:${t.modelName || 'unknown'}`,
      providerId: t.providerId || 'unknown',
      providerName: t.providerName || 'Unknown',
      baseUrl: t.baseUrl || '',
      modelName: t.modelName || 'unknown',
      startedAt: Date.now() - 500,
      latencyMs: 823,
      results: capabilities.map((cap: string) => {
        const rand = Math.random()
        let status = 'passed'
        if (rand < 0.1) status = 'failed'
        else if (rand < 0.18) status = 'uncertain'
        return {
          capability: cap,
          status,
          latencyMs: Math.floor(Math.random() * 900) + 200,
          usage: { promptTokens: Math.floor(Math.random() * 200) + 50, completionTokens: Math.floor(Math.random() * 300) + 50, totalTokens: 0 },
          detail: cap === 'text'
            ? 'HTTP 200 and choices[0].message.content is non-empty'
            : cap === 'vision'
              ? 'HTTP 200, image_url was accepted'
              : 'HTTP 200, finish_reason is tool_calls',
          evidence: '{"choices":[{"message":{"content":"模拟响应..."}}]}',
        }
      }),
    }))

    return Response.json({ ok: true, results }, { headers: corsHeaders })
  }

  // POST /api/model-source/preview
  if (pathname === '/api/model-source/preview' && method === 'POST') {
    return Response.json({
      ok: true,
      count: 12,
      models: ['gpt-4o', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4.5-preview', 'o3-mini', 'claude-3-opus-20240229', 'claude-3-5-sonnet-20241022', 'deepseek-chat'],
    }, { headers: corsHeaders })
  }

  // GET /api/health
  if (pathname === '/api/health' && method === 'GET') {
    return Response.json({
      ok: true,
      startedAt: mockStats.startedAt,
      configPath: 'demo/config.json',
      statsPath: 'demo/stats.json',
      models: ['primary-gpt', 'deepseek-chat', 'claude-3.5-sonnet'],
      modelSourceError: '',
    }, { headers: corsHeaders })
  }

  // 兜底：404
  return Response.json(
    { error: { message: `Mock API: ${method} ${pathname} not implemented`, type: 'proxy_error' } },
    { status: 404, headers: corsHeaders },
  )
}

// ---- Install & Activate ----
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()))

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest(event))
})

// TypeScript interface for FetchEvent
declare var self: ServiceWorkerGlobalScope