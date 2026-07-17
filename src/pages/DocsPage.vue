<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { docSections, docMeta } from '../data/sections'
import DocContainer from '../components/DocContainer.vue'
import CodeBlock from '../components/CodeBlock.vue'
import DocPager from '../components/DocPager.vue'

// 当前激活的 section id（用于左侧目录高亮）
const activeId = ref('intro')

const sections = docSections

// 监听滚动高亮当前目录
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    { rootMargin: '-20% 0px -70% 0px' },
  )
  sections.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })
  onUnmounted(() => observer.disconnect())
})

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 核心特性卡片
const features = [
  { t: 'OpenAI 兼容端点', d: '/v1/chat/completions、/v1/models 等，无需改动客户端代码' },
  { t: '故障转移链', d: '按顺序自动切换目标，透明 failover' },
  { t: '四种调度策略', d: 'priority / round-robin / weighted / latency-based' },
  { t: '熔断器', d: '连续失败后自动跳过目标，冷却期后恢复；429 即时熔断' },
  { t: 'SSE 流式透传', d: '支持流式响应、工具调用和多模态请求' },
  { t: '可视化管理界面', d: '配置、监控、统计、日志一目了然' },
  { t: '模型来源拉取', d: '可从远程 URL 拉取模型列表，支持 include/exclude 过滤' },
  { t: 'Docker / K8s 部署', d: '提供 Docker Compose 和 Kubernetes 清单，开箱即用' },
]

// 顶层 config 字段
const configFields = [
  { f: 'adminToken', t: 'string', d: '管理员登录密码，默认 admin' },
  { f: 'proxyKeys', t: 'array', d: '代理 API 密钥列表，客户端用此认证' },
  { f: 'failoverStatusCodes', t: 'number[]', d: '触发故障转移的状态码（默认含 429、5xx）' },
  { f: 'requestTimeoutMs', t: 'number', d: '请求超时（毫秒），默认 120000' },
  { f: 'circuitBreaker', t: 'object', d: '熔断器配置（阈值、冷却时间等）' },
  { f: 'modelSource', t: 'object', d: '远程模型来源配置' },
  { f: 'models', t: 'array', d: '故障转移链配置（核心）' },
  { f: 'providers', t: 'array', d: '上游供应商配置（baseUrl + apiKey）' },
]

// OpenAI 兼容端点
const proxyEndpoints = [
  { m: 'GET', p: '/v1/models', d: '获取所有可用的代理模型列表' },
  { m: 'POST', p: '/v1/chat/completions', d: '聊天补全 —— 自动故障转移、流式透传' },
  { m: 'POST', p: '/v1/embeddings', d: 'Embedding 请求（如果上游支持）' },
  { m: 'GET', p: '/health', d: '健康检查' },
]

// 管理端点
const adminEndpoints = [
  { m: 'POST', p: '/api/login', d: '登录（body: {token}）' },
  { m: 'POST', p: '/api/logout', d: '登出' },
  { m: 'GET', p: '/api/config', d: '读取完整配置' },
  { m: 'POST', p: '/api/config', d: '保存配置' },
  { m: 'GET', p: '/api/stats', d: '实时统计（每秒轮询）' },
  { m: 'POST', p: '/api/providers/health', d: '供应商健康检查' },
  { m: 'POST', p: '/api/model-tests/run', d: '运行模型能力测试（text/vision/tool）' },
]

// 调度策略
const strategies = [
  { name: 'Priority', desc: '按 targets 数组顺序，从第一个开始尝试，失败后切到下一个。', use: '最常用，适合主备场景。' },
  { name: 'Round Robin', desc: '轮流使用每个 target，均匀分配负载。', use: '适合多个供应商配额均匀时。' },
  { name: 'Weighted', desc: '按 target 的 weight 字段概率分配请求。', use: '适合部分供应商配额/速度有差异时。' },
  { name: 'Latency-based', desc: '优先使用延迟最低的 target。', use: '适合对延迟敏感的应用。' },
]

// FAQ
const faqs = [
  { q: '为什么请求被路由到了备选模型？', a: '检查管理界面「实时状况」或「请求日志」，通常原因有：主目标返回了 429（限流）、5xx（服务端错误）、或连接超时。故障转移链会按顺序尝试所有启用的 target。' },
  { q: '熔断器触发后怎么恢复？', a: '熔断器在 cooldownMinutes（默认 10 分钟）后自动恢复。如果手动恢复，可以在管理界面的「故障转移链」页面点击重置。收到 429 等限流码会触发即时熔断（跳过冷却等待）。' },
  { q: '如何测试单个目标的连通性？', a: '进入管理界面「模型测试」页面，选择目标后点击「开始测试」。会测试文本（text）、视觉（vision）和工具调用（tool）三种能力。' },
  { q: '支持哪些上游供应商？', a: '只要供应商提供 OpenAI 兼容的 API 接口即可。已验证：OpenAI、Anthropic（通过兼容层）、DeepSeek、Moonshot、智谱 GLM、通义千问、本地 Ollama/vLLM 等。' },
  { q: '配置文件在哪里？会丢失吗？', a: '配置存储在 data/config.json，通过管理界面保存后自动持久化。使用 Docker 部署时，通过 -v $(pwd)/data:/app/data 挂载数据卷即可确保不丢失。' },
  { q: '本演示站的 ui/ 目录会不会自动更新？', a: '会。GitHub Actions 每小时整点检查上游 HydraLLM 的提交，发现 ui/src/ 有变化会自动 commit 到 main，Cloudflare Pages 的 Git 集成会随之重新部署。' },
]

// 触发同步的命令（多语言 tab）
const webhookCurl = `# 触发一次上游同步（repository_dispatch）
curl -X POST \\
  -H "Accept: application/vnd.github+json" \\
  -H "Authorization: Bearer \$GITHUB_TOKEN" \\
  -d '{"event_type":"sync-upstream"}' \\
  https://api.github.com/repos/clockclock1/hydrallm-demo/dispatches`
</script>

<template>
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
    <!-- 左侧目录 -->
    <aside class="hidden lg:block">
      <nav class="sticky top-6 flex flex-col gap-0.5 border-l border-white/8 pl-4">
        <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
          目录
        </p>
        <button
          v-for="s in sections"
          :key="s.id"
          @click="scrollTo(s.id)"
          :class="[
            'group relative flex items-center gap-2 py-1.5 text-left text-sm transition-colors duration-150',
            activeId === s.id
              ? 'text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300',
          ]"
        >
          <span
            :class="[
              'absolute -left-4 top-1/2 h-5 -translate-y-1/2 rounded-r bg-brand-400 transition-all duration-200',
              activeId === s.id ? 'w-0.5 opacity-100' : 'w-0 opacity-0 group-hover:w-0.5 group-hover:opacity-60',
            ]"
          />
          <span :class="s.icon" class="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
          {{ s.label }}
        </button>
      </nav>
    </aside>

    <!-- 文档主体 -->
    <article class="min-w-0 space-y-16">

      <!-- 顶部元信息 -->
      <div class="flex items-center justify-between text-xs text-zinc-500">
        <span class="flex items-center gap-1.5">
          <span class="i-lucide-clock h-3.5 w-3.5" />
          上次更新：{{ docMeta.lastUpdated }}
        </span>
        <a :href="docMeta.editLink" target="_blank" rel="noopener" class="flex items-center gap-1.5 transition-colors hover:text-zinc-300">
          <span class="i-lucide-edit h-3.5 w-3.5" />
          在 GitHub 上编辑
        </a>
      </div>

      <!-- 简介 -->
      <section id="intro">
        <h1 class="mb-3 text-3xl font-extrabold tracking-tight">
          <span class="text-gradient">HydraLLM</span> 使用文档
        </h1>
        <p class="mb-4 text-base leading-relaxed text-zinc-300">
          <strong class="text-zinc-100">HydraLLM</strong> 是一个
          <strong class="text-zinc-100">OpenAI 兼容的 LLM 故障转移代理</strong>，
          在你的应用与上游 LLM API 之间插入一层代理，为每个模型配置有序的备选目标链。
        </p>
        <p class="mb-6 text-base leading-relaxed text-zinc-300">
          当主目标返回错误或触发限流（429 等）时，HydraLLM 会自动将请求路由到链上下一个可用目标，对外表现始终可用。
        </p>

        <p class="mb-3 text-sm leading-relaxed text-zinc-400">
          <strong class="text-zinc-200">关于本演示站</strong>：本仓库（<code class="font-mono text-brand-400">hydrallm-demo</code>）是 HydraLLM 项目的
          Cloudflare Pages 静态展示站，由两个部分组成：
        </p>
        <ul class="mb-6 space-y-1.5 text-sm text-zinc-400">
          <li class="flex items-start gap-2">
            <span class="i-lucide-chevron-right mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-400" />
            <span><strong class="text-zinc-200">着陆页</strong>（<code class="font-mono text-brand-400">/</code>）— Vue 3 项目介绍页</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="i-lucide-chevron-right mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-400" />
            <span><strong class="text-zinc-200">交互演示</strong>（<code class="font-mono text-brand-400">/ui/</code>）— React UI + fetch 拦截器模拟 API</span>
          </li>
        </ul>

        <DocContainer type="tip" title="一句话总结">
          只需把 OpenAI 客户端的 <code class="font-mono text-green-400">base_url</code> 指向 HydraLLM，就能获得自动故障转移能力，业务代码零改动。
        </DocContainer>

        <DocContainer type="info" title="本站与上游的关系">
          本演示站不含真实后端，<code class="font-mono text-brand-300">/ui/</code> 下的所有 <code class="font-mono text-brand-300">/api/*</code> 请求由内嵌 fetch 拦截器返回预设模拟数据。
          上游 HydraLLM 是可独立部署的完整服务（见 <a href="https://github.com/clockclock1/HydraLLM" target="_blank" rel="noopener" class="text-brand-300 underline-offset-2 hover:underline">GitHub 仓库</a>）。
        </DocContainer>
      </section>

      <!-- 核心特性 -->
      <section id="features">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-sparkles h-5 w-5 text-brand-400" />
          核心特性
        </h2>
        <p class="mb-5 text-sm text-zinc-400">
          HydraLLM 把"多模型路由 + 故障转移"封装为标准的 OpenAI 兼容接口，让你无需改动业务代码即可获得以下能力。
        </p>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li
            v-for="f in features"
            :key="f.t"
            class="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
          >
            <span class="i-lucide-check-circle-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
            <div>
              <p class="text-sm font-semibold text-zinc-100">{{ f.t }}</p>
              <p class="mt-0.5 text-xs text-zinc-500">{{ f.d }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- 快速开始 -->
      <section id="quickstart">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-rocket h-5 w-5 text-brand-400" />
          快速开始
        </h2>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">1. 克隆与安装</h3>
        <CodeBlock lang="bash" :tabs="['pnpm','npm','yarn']">
pnpm install
===
npm install
===
yarn install
        </CodeBlock>

        <h3 class="mb-2 mt-6 text-lg font-semibold text-zinc-100">2. 配置</h3>
        <CodeBlock lang="bash">
# 复制示例配置
cp data/config.example.json data/config.json

# 编辑配置（填入你的 API Key）
# 修改 data/config.json 中的 providers 和 models
        </CodeBlock>

        <h3 class="mb-2 mt-6 text-lg font-semibold text-zinc-100">3. 启动服务</h3>
        <CodeBlock lang="bash">
# 开发模式
npm run dev

# 生产模式
npm start
# 服务默认运行在 http://localhost:8787
        </CodeBlock>

        <DocContainer type="tip">
          启动后访问 <code class="font-mono text-green-400">http://localhost:8787</code> 即可看到管理界面，默认登录密码是 <code class="font-mono text-green-400">admin</code>。
        </DocContainer>
      </section>

      <!-- 配置说明 -->
      <section id="config">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-settings h-5 w-5 text-brand-400" />
          配置说明
        </h2>
        <p class="mb-4 text-sm text-zinc-300">
          HydraLLM 使用 <code class="font-mono text-brand-400">data/config.json</code> 存储配置。所有配置都可以通过管理界面修改，无需手动编辑文件。
        </p>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">顶层字段</h3>
        <div class="mb-6 overflow-x-auto rounded-xl border border-white/8">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-white/8 bg-white/[0.03]">
              <tr>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">字段</th>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">类型</th>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="c in configFields" :key="c.f">
                <td class="px-4 py-2 font-mono text-xs text-brand-400">{{ c.f }}</td>
                <td class="px-4 py-2 text-xs text-zinc-400">{{ c.t }}</td>
                <td class="px-4 py-2 text-xs text-zinc-400" v-html="c.d"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">故障转移链（models）示例</h3>
        <CodeBlock lang="json">
{
  "publicName": "gpt-failover",
  "enabled": true,
  "concurrency": 3,
  "releaseDelayMs": 0,
  "targets": [
    {
      "name": "primary-openai",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "sk-your-key",
      "modelName": "gpt-4o",
      "enabled": true
    },
    {
      "name": "backup-openai",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "sk-your-key",
      "modelName": "gpt-4.1-mini",
      "enabled": true
    },
    {
      "name": "claude-fallback",
      "baseUrl": "https://api.anthropic.com/v1",
      "apiKey": "sk-ant-your-key",
      "modelName": "claude-3-opus-20240229",
      "enabled": true
    }
  ]
}
        </CodeBlock>

        <h3 class="mb-2 mt-6 text-lg font-semibold text-zinc-100">熔断器配置</h3>
        <CodeBlock lang="json">
{
  "circuitBreaker": {
    "failureThreshold": 3,
    "cooldownMinutes": 10,
    "immediateCooldownStatusCodes": [429]
  }
}
        </CodeBlock>
        <DocContainer type="info" title="字段含义">
          <code class="font-mono text-brand-300">failureThreshold</code>：连续失败多少次后触发熔断；
          <code class="font-mono text-brand-300">cooldownMinutes</code>：冷却时间（分钟）；
          <code class="font-mono text-brand-300">immediateCooldownStatusCodes</code>：收到这些状态码时立即熔断（如 429）。
        </DocContainer>
      </section>

      <!-- API 参考 -->
      <section id="api">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-code h-5 w-5 text-brand-400" />
          API 参考
        </h2>
        <p class="mb-4 text-sm text-zinc-300">
          HydraLLM 提供两类 API：OpenAI 兼容的代理端点和管理端点。
        </p>

        <h3 class="mb-3 text-lg font-semibold text-zinc-100">OpenAI 兼容端点</h3>
        <div class="mb-6 overflow-x-auto rounded-xl border border-white/8">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-white/8 bg-white/[0.03]">
              <tr>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">方法</th>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">路径</th>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="ep in proxyEndpoints" :key="ep.p">
                <td class="px-4 py-2">
                  <span
                    :class="[
                      'rounded px-1.5 py-0.5 text-[10px] font-bold',
                      ep.m === 'GET' ? 'bg-green-500/15 text-green-400' : 'bg-brand-500/15 text-brand-400',
                    ]"
                  >{{ ep.m }}</span>
                </td>
                <td class="px-4 py-2 font-mono text-xs text-zinc-300">{{ ep.p }}</td>
                <td class="px-4 py-2 text-xs text-zinc-400">{{ ep.d }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mb-2 text-xs text-zinc-400">客户端调用示例：</p>
        <CodeBlock lang="bash">
# 把 base_url 指向 HydraLLM，API Key 用 proxyKey
curl http://localhost:8787/v1/chat/completions \\
  -H "Authorization: Bearer sk-local-test" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-failover",
    "messages": [{"role":"user","content":"Hello!"}],
    "stream": true
  }'
        </CodeBlock>

        <h3 class="mb-3 mt-6 text-lg font-semibold text-zinc-100">管理端点</h3>
        <DocContainer type="warning" title="需要管理员令牌">
          以下端点需要传入 <code class="font-mono text-amber-400">x-admin-session</code> header（登录后获取），否则返回 401。
        </DocContainer>
        <div class="overflow-x-auto rounded-xl border border-white/8">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-white/8 bg-white/[0.03]">
              <tr>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">方法</th>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">路径</th>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="ep in adminEndpoints" :key="ep.p">
                <td class="px-4 py-2">
                  <span
                    :class="[
                      'rounded px-1.5 py-0.5 text-[10px] font-bold',
                      ep.m === 'GET' ? 'bg-green-500/15 text-green-400' : 'bg-brand-500/15 text-brand-400',
                    ]"
                  >{{ ep.m }}</span>
                </td>
                <td class="px-4 py-2 font-mono text-xs text-zinc-300">{{ ep.p }}</td>
                <td class="px-4 py-2 text-xs text-zinc-400">{{ ep.d }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 故障转移策略 -->
      <section id="failover">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-shuffle h-5 w-5 text-brand-400" />
          故障转移策略
        </h2>
        <p class="mb-5 text-sm text-zinc-400">
          每条故障转移链可独立选择调度策略，在 <code class="font-mono text-brand-400">models[].strategy</code> 字段配置，默认为 <code class="font-mono text-brand-400">priority</code>。
        </p>
        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="s in strategies"
            :key="s.name"
            class="rounded-xl border border-white/8 bg-white/[0.02] p-4"
          >
            <h4 class="mb-1 text-sm font-semibold text-brand-400">{{ s.name }}</h4>
            <p class="mb-2 text-xs text-zinc-300">{{ s.desc }}</p>
            <p class="text-[11px] text-zinc-500">适用场景：{{ s.use }}</p>
          </div>
        </div>
        <DocContainer type="tip">
          故障转移策略可在管理界面「故障转移链」页面切换，修改后即时生效，无需重启服务。
        </DocContainer>
      </section>

      <!-- 部署到 Cloudflare Pages -->
      <section id="deploy">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-cloud h-5 w-5 text-brand-400" />
          部署到 Cloudflare Pages
        </h2>
        <p class="mb-5 text-sm text-zinc-300">
          本演示站使用 <strong class="text-zinc-100">Cloudflare Pages 的 Git 集成</strong>自动部署：
          <code class="font-mono text-brand-400">main</code> 分支有推送即触发构建。
        </p>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">1. 创建项目</h3>
        <ol class="mb-5 list-decimal space-y-1.5 pl-5 text-sm text-zinc-400">
          <li>登录 <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener" class="text-brand-400 underline-offset-2 hover:underline">Cloudflare Dashboard</a> → <strong class="text-zinc-200">Workers & Pages</strong> → <strong class="text-zinc-200">Create</strong> → <strong class="text-zinc-200">Pages</strong> → <strong class="text-zinc-200">Connect to Git</strong></li>
          <li>选择 <code class="font-mono text-brand-400">clockclock1/hydrallm-demo</code> 仓库（或你 fork 的副本）</li>
          <li>按下表填写构建配置</li>
          <li>点击 <strong class="text-zinc-200">Save and Deploy</strong></li>
        </ol>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">2. 构建配置</h3>
        <div class="mb-6 overflow-x-auto rounded-xl border border-white/8">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-white/8 bg-white/[0.03]">
              <tr>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">字段</th>
                <th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">值</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr><td class="px-4 py-2 text-xs text-zinc-400">Project name</td><td class="px-4 py-2 font-mono text-xs text-brand-400">hydrallm-demo</td></tr>
              <tr><td class="px-4 py-2 text-xs text-zinc-400">Production branch</td><td class="px-4 py-2 font-mono text-xs text-brand-400">main</td></tr>
              <tr><td class="px-4 py-2 text-xs text-zinc-400">Framework preset</td><td class="px-4 py-2 font-mono text-xs text-brand-400">None</td></tr>
              <tr><td class="px-4 py-2 text-xs text-zinc-400">Build command</td><td class="px-4 py-2 font-mono text-xs text-brand-400">npm install &amp;&amp; npm run build</td></tr>
              <tr><td class="px-4 py-2 text-xs text-zinc-400">Build output directory</td><td class="px-4 py-2 font-mono text-xs text-brand-400">dist</td></tr>
              <tr><td class="px-4 py-2 text-xs text-zinc-400">Root directory</td><td class="px-4 py-2 font-mono text-xs text-brand-400">/</td></tr>
            </tbody>
          </table>
        </div>

        <DocContainer type="tip" title="为什么不用 wrangler / API Token？">
          Cloudflare Pages 的 Git 集成会自动监听分支推送、自动拉起构建与部署，因此无需配置 GitHub Actions Secrets、无需本地安装 wrangler、无需 CF API Token。
        </DocContainer>

        <h3 class="mb-2 mt-6 text-lg font-semibold text-zinc-100">3. 自定义域名</h3>
        <p class="mb-3 text-sm text-zinc-400">
          部署成功后会得到形如 <code class="font-mono text-brand-400">hydrallm-demo.pages.dev</code> 的域名。
          在项目的 <strong class="text-zinc-200">Custom domains</strong> 选项卡中添加自有域名，按提示添加 CNAME 即可绑定。
        </p>

        <h3 class="mb-2 mt-6 text-lg font-semibold text-zinc-100">4. 本地构建预览</h3>
        <CodeBlock lang="bash">
# 安装根项目依赖
npm install

# 完整构建（Vue 着陆页 + React UI）
npm run build

# 本地预览 dist/
npx wrangler pages dev dist
        </CodeBlock>
      </section>

      <!-- 自动同步 Workflow -->
      <section id="sync">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-refresh-cw h-5 w-5 text-brand-400" />
          自动同步 Workflow
        </h2>
        <p class="mb-5 text-sm text-zinc-300">
          本仓库的 <code class="font-mono text-brand-400">ui/src/</code> 目录会自动与上游
          <a href="https://github.com/clockclock1/HydraLLM" target="_blank" rel="noopener" class="text-brand-400 underline-offset-2 hover:underline">clockclock1/HydraLLM</a>
          保持同步。同步由 <code class="font-mono text-brand-400">.github/workflows/sync-upstream.yml</code> 驱动。
        </p>

        <h3 class="mb-3 text-lg font-semibold text-zinc-100">三种触发方式</h3>
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <div class="mb-2 flex items-center gap-2 text-brand-400">
              <span class="i-lucide-clock h-4 w-4" />
              <span class="text-xs font-semibold">定时触发</span>
            </div>
            <p class="text-xs text-zinc-400">每小时整点（UTC）通过 <code class="font-mono text-brand-400">cron: '0 * * * *'</code> 检查上游 HEAD SHA，无变化时跳过。</p>
          </div>
          <div class="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <div class="mb-2 flex items-center gap-2 text-brand-400">
              <span class="i-lucide-hand h-4 w-4" />
              <span class="text-xs font-semibold">手动触发</span>
            </div>
            <p class="text-xs text-zinc-400">在仓库 <strong class="text-zinc-200">Actions</strong> 页选择 "Sync upstream HydraLLM ui/"，点击 <strong class="text-zinc-200">Run workflow</strong>。</p>
          </div>
          <div class="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <div class="mb-2 flex items-center gap-2 text-brand-400">
              <span class="i-lucide-webhook h-4 w-4" />
              <span class="text-xs font-semibold">外部 Webhook</span>
            </div>
            <p class="text-xs text-zinc-400">通过 <code class="font-mono text-brand-400">repository_dispatch</code> 事件触发，用于上游 push 后立即同步。</p>
          </div>
        </div>

        <h3 class="mb-2 mt-6 text-lg font-semibold text-zinc-100">Webhook 触发命令</h3>
        <CodeBlock lang="bash">
{{ webhookCurl }}
        </CodeBlock>

        <h3 class="mb-2 mt-6 text-lg font-semibold text-zinc-100">同步流程</h3>
        <ol class="mb-5 list-decimal space-y-1.5 pl-5 text-sm text-zinc-400">
          <li>通过 GitHub API 获取上游 <code class="font-mono text-brand-400">HydraLLM</code> 的 HEAD SHA</li>
          <li>从本仓库最近一次同步 commit 信息解析上次 SHA，相同则跳过</li>
          <li>浅克隆上游仓库，用 <code class="font-mono text-brand-400">cp -r</code> 覆盖 <code class="font-mono text-brand-400">ui/src/</code>（保留 <code class="font-mono text-brand-400">vite.config.ts</code> 等定制文件）</li>
          <li>若有 diff，提交 <code class="font-mono text-brand-400">chore(sync): ui/ synced from upstream HydraLLM@&lt;sha&gt;</code></li>
          <li>推送到 <code class="font-mono text-brand-400">main</code>，Cloudflare Pages 自动重新部署</li>
        </ol>

        <DocContainer type="warning" title="定制文件不会被覆盖">
          <code class="font-mono text-amber-400">ui/vite.config.ts</code>、<code class="font-mono text-amber-400">ui/index.html</code>、<code class="font-mono text-amber-400">ui/package.json</code>
          这三份针对 Cloudflare Pages 演示环境定制的文件不会随上游同步被覆盖，仅 <code class="font-mono text-amber-400">ui/src/</code> 会被覆盖。
        </DocContainer>
      </section>

      <!-- 常见问题 -->
      <section id="troubleshoot">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-help-circle h-5 w-5 text-brand-400" />
          常见问题
        </h2>
        <div class="space-y-3">
          <details
            v-for="(f, i) in faqs"
            :key="i"
            class="group rounded-xl border border-white/8 bg-white/[0.02] p-4"
          >
            <summary class="flex cursor-pointer items-center justify-between text-sm font-semibold text-zinc-100">
              <span>{{ f.q }}</span>
              <span class="i-lucide-chevron-down h-4 w-4 flex-shrink-0 text-zinc-500 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-2 text-xs leading-relaxed text-zinc-400">{{ f.a }}</p>
          </details>
        </div>
      </section>

      <!-- 页脚翻页器 -->
      <DocPager
        :prev="{ id: 'troubleshoot', title: '常见问题', desc: 'FAQ 与故障排查' }"
        :next="{ id: 'intro', title: '简介', desc: '回到顶部' }"
      />

      <!-- 底部链接 -->
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p class="mb-3 text-sm text-zinc-300">需要更多帮助？</p>
        <div class="flex flex-wrap justify-center gap-3">
          <a href="https://github.com/clockclock1/HydraLLM" target="_blank" rel="noopener" class="btn-primary px-5 py-2.5 text-sm">
            <span class="i-lucide-github h-4 w-4" /> GitHub
          </a>
          <a href="https://github.com/clockclock1/HydraLLM/issues" target="_blank" rel="noopener" class="btn-ghost px-5 py-2.5 text-sm">
            <span class="i-lucide-message-square h-4 w-4" /> 问题反馈
          </a>
          <a href="/ui/" target="_blank" class="btn-ghost px-5 py-2.5 text-sm">
            <span class="i-lucide-flask-conical h-4 w-4" /> 体验演示
          </a>
        </div>
      </div>
    </article>
  </div>
</template>
