<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { site } from '../data/sections'

// 当前激活的 section id
const activeId = ref('intro')

// 目录结构
const sections = [
  { id: 'intro',       label: '简介',       icon: 'i-lucide-info' },
  { id: 'features',    label: '核心特性',   icon: 'i-lucide-sparkles' },
  { id: 'quickstart',  label: '快速开始',   icon: 'i-lucide-rocket' },
  { id: 'config',      label: '配置说明',   icon: 'i-lucide-settings' },
  { id: 'api',         label: 'API 参考',   icon: 'i-lucide-code' },
  { id: 'failover',    label: '故障转移策略',icon: 'i-lucide-shuffle' },
  { id: 'deploy',      label: '部署指南',   icon: 'i-lucide-cloud' },
  { id: 'troubleshoot',label: '常见问题',   icon: 'i-lucide-help-circle' },
]

// 监听滚动高亮当前目录
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeId.value = entry.target.id
      }
    })
  }, { rootMargin: '-20% 0px -70% 0px' })
  sections.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })
  onUnmounted(() => observer.disconnect())
})

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
    <!-- 左侧目录 -->
    <aside class="hidden lg:block">
      <nav class="sticky top-6 flex flex-col gap-1">
        <button
          v-for="s in sections"
          :key="s.id"
          @click="scrollTo(s.id)"
          :class="[
            'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-150',
            activeId === s.id
              ? 'bg-brand-500/15 text-brand-400 font-medium'
              : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200',
          ]"
        >
          <span :class="s.icon" class="h-4 w-4 flex-shrink-0" />
          {{ s.label }}
        </button>
      </nav>
    </aside>

    <!-- 文档主体 -->
    <article class="min-w-0 space-y-16">

      <!-- 简介 -->
      <section id="intro">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-info h-5 w-5 text-brand-400" />
          简介
        </h2>
        <p class="mb-4 text-sm leading-relaxed text-zinc-300">
          <strong class="text-zinc-100">HydraLLM</strong> 是一个
          <strong class="text-zinc-100">OpenAI 兼容的 LLM 故障转移代理</strong>，
          适用于将你的应用与多个大语言模型供应商无缝对接。
        </p>
        <p class="mb-6 text-sm leading-relaxed text-zinc-300">
          它的工作方式是：在你的应用与上游 LLM API 之间插入一层代理，为每个模型配置有序的备选目标链。
          当主目标返回错误或触发限流（429 等）时，HydraLLM 会自动将请求路由到链上下一个可用目标，对外表现始终可用。
        </p>
        <div class="card p-4">
          <p class="text-xs text-zinc-400">
            💡 <strong class="text-zinc-300">一句话总结：</strong>只需把 OpenAI 的
            <code class="font-mono text-brand-400">base_url</code> 指向 HydraLLM，
            就能获得自动故障转移能力，业务代码零改动。
          </p>
        </div>
      </section>

      <!-- 核心特性 -->
      <section id="features">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-sparkles h-5 w-5 text-brand-400" />
          核心特性
        </h2>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="f in [
            { t: 'OpenAI 兼容端点', d: '/v1/chat/completions、/v1/models 等，无需改动客户端代码' },
            { t: '故障转移链', d: '按顺序自动切换目标，透明 failover' },
            { t: '四种调度策略', d: 'priority / round-robin / weighted / latency-based' },
            { t: '熔断器', d: '连续失败后自动跳过目标，冷却期后恢复；429 即时熔断' },
            { t: 'SSE 流式透传', d: '支持流式响应、工具调用和多模态请求' },
            { t: '可视化管理界面', d: '配置、监控、统计、日志一目了然' },
            { t: '模型来源拉取', d: '可从远程 URL 拉取模型列表，支持 include/exclude 过滤' },
            { t: 'Docker / K8s 部署', d: '提供 Docker Compose 和 Kubernetes 清单，开箱即用' },
          ]" :key="f.t" class="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4">
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

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">1. 安装</h3>
        <pre class="mb-6 overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code>git clone https://github.com/clockclock1/HydraLLM.git
cd HydraLLM
npm install</code></pre>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">2. 配置</h3>
        <pre class="mb-6 overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code># 复制示例配置
cp data/config.example.json data/config.json

# 编辑配置（填入你的 API Key）
# 修改 data/config.json 中的 providers 和 models</code></pre>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">3. 启动</h3>
        <pre class="mb-4 overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code># 开发模式
npm run dev

# 生产模式
npm start
# 服务默认运行在 http://localhost:8787</code></pre>
        <p class="text-xs text-zinc-500">
          启动后访问 <code class="font-mono text-brand-400">http://localhost:8787</code> 即可看到管理界面。
        </p>
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
              <tr><th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">字段</th><th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">类型</th><th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">说明</th></tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr><td class="px-4 py-2 font-mono text-xs text-brand-400">adminToken</td><td class="px-4 py-2 text-xs text-zinc-400">string</td><td class="px-4 py-2 text-xs text-zinc-400">管理员登录密码，默认 <code>admin</code></td></tr>
              <tr><td class="px-4 py-2 font-mono text-xs text-brand-400">proxyKeys</td><td class="px-4 py-2 text-xs text-zinc-400">array</td><td class="px-4 py-2 text-xs text-zinc-400">代理 API 密钥列表，客户端用此认证</td></tr>
              <tr><td class="px-4 py-2 font-mono text-xs text-brand-400">failoverStatusCodes</td><td class="px-4 py-2 text-xs text-zinc-400">number[]</td><td class="px-4 py-2 text-xs text-zinc-400">触发故障转移的状态码（默认含 429、5xx）</td></tr>
              <tr><td class="px-4 py-2 font-mono text-xs text-brand-400">requestTimeoutMs</td><td class="px-4 py-2 text-xs text-zinc-400">number</td><td class="px-4 py-2 text-xs text-zinc-400">请求超时（毫秒），默认 120000</td></tr>
              <tr><td class="px-4 py-2 font-mono text-xs text-brand-400">circuitBreaker</td><td class="px-4 py-2 text-xs text-zinc-400">object</td><td class="px-4 py-2 text-xs text-zinc-400">熔断器配置（阈值、冷却时间等）</td></tr>
              <tr><td class="px-4 py-2 font-mono text-xs text-brand-400">modelSource</td><td class="px-4 py-2 text-xs text-zinc-400">object</td><td class="px-4 py-2 text-xs text-zinc-400">远程模型来源配置</td></tr>
              <tr><td class="px-4 py-2 font-mono text-xs text-brand-400">models</td><td class="px-4 py-2 text-xs text-zinc-400">array</td><td class="px-4 py-2 text-xs text-zinc-400">故障转移链配置（核心）</td></tr>
              <tr><td class="px-4 py-2 font-mono text-xs text-brand-400">providers</td><td class="px-4 py-2 text-xs text-zinc-400">array</td><td class="px-4 py-2 text-xs text-zinc-400">上游供应商配置（baseUrl + apiKey）</td></tr>
            </tbody>
          </table>
        </div>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">故障转移链（models）示例</h3>
        <pre class="mb-4 overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code>{
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
}</code></pre>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">熔断器配置</h3>
        <pre class="overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code>{
  "circuitBreaker": {
    "failureThreshold": 3,
    "cooldownMinutes": 10,
    "immediateCooldownStatusCodes": [429]
  }
}</code></pre>
        <p class="mt-2 text-xs text-zinc-500">
          <code class="font-mono text-brand-400">failureThreshold</code>：连续失败多少次后触发熔断；
          <code class="font-mono text-brand-400">cooldownMinutes</code>：冷却时间（分钟）；
          <code class="font-mono text-brand-400">immediateCooldownStatusCodes</code>：收到这些状态码时立即熔断（如 429）。
        </p>
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
              <tr><th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">方法</th><th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">路径</th><th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">说明</th></tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr><td class="px-4 py-2"><span class="rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-bold text-green-400">GET</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/v1/models</td><td class="px-4 py-2 text-xs text-zinc-400">获取所有可用的代理模型列表</td></tr>
              <tr><td class="px-4 py-2"><span class="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">POST</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/v1/chat/completions</td><td class="px-4 py-2 text-xs text-zinc-400">聊天补全 —— 自动故障转移、流式透传</td></tr>
              <tr><td class="px-4 py-2"><span class="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">POST</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/v1/embeddings</td><td class="px-4 py-2 text-xs text-zinc-400">Embedding 请求（如果上游支持）</td></tr>
              <tr><td class="px-4 py-2"><span class="rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-bold text-green-400">GET</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/health</td><td class="px-4 py-2 text-xs text-zinc-400">健康检查</td></tr>
            </tbody>
          </table>
        </div>

        <p class="mb-2 text-xs text-zinc-400">客户端调用示例：</p>
        <pre class="mb-6 overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code># 把 base_url 指向 HydraLLM，API Key 用 proxyKey
curl http://localhost:8787/v1/chat/completions \
  -H "Authorization: Bearer sk-local-test" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-failover",
    "messages": [{"role":"user","content":"Hello!"}],
    "stream": true
  }'</code></pre>

        <h3 class="mb-3 text-lg font-semibold text-zinc-100">管理端点</h3>
        <p class="mb-2 text-xs text-zinc-400">
          以下端点需要传入 <code class="font-mono text-brand-400">x-admin-session</code> header（登录后获取）。
        </p>
        <div class="overflow-x-auto rounded-xl border border-white/8">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-white/8 bg-white/[0.03]">
              <tr><th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">方法</th><th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">路径</th><th class="px-4 py-2.5 text-xs font-semibold text-zinc-300">说明</th></tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr><td class="px-4 py-2"><span class="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">POST</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/api/login</td><td class="px-4 py-2 text-xs text-zinc-400">登录（body: {token}）</td></tr>
              <tr><td class="px-4 py-2"><span class="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">POST</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/api/logout</td><td class="px-4 py-2 text-xs text-zinc-400">登出</td></tr>
              <tr><td class="px-4 py-2"><span class="rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-bold text-green-400">GET</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/api/config</td><td class="px-4 py-2 text-xs text-zinc-400">读取完整配置</td></tr>
              <tr><td class="px-4 py-2"><span class="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">POST</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/api/config</td><td class="px-4 py-2 text-xs text-zinc-400">保存配置</td></tr>
              <tr><td class="px-4 py-2"><span class="rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-bold text-green-400">GET</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/api/stats</td><td class="px-4 py-2 text-xs text-zinc-400">实时统计（每秒轮询）</td></tr>
              <tr><td class="px-4 py-2"><span class="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">POST</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/api/providers/health</td><td class="px-4 py-2 text-xs text-zinc-400">供应商健康检查</td></tr>
              <tr><td class="px-4 py-2"><span class="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">POST</span></td><td class="px-4 py-2 font-mono text-xs text-zinc-300">/api/model-tests/run</td><td class="px-4 py-2 text-xs text-zinc-400">运行模型能力测试（text/vision/tool）</td></tr>
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
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="s in [
            { name:'Priority', desc:'按 targets 数组顺序，从第一个开始尝试，失败后切到下一个。', use:'最常用，适合主备场景。' },
            { name:'Round Robin', desc:'轮流使用每个 target，均匀分配负载。', use:'适合多个供应商配额均匀时。' },
            { name:'Weighted', desc:'按 target 的 weight 字段概率分配请求。', use:'适合部分供应商配额/速度有差异时。' },
            { name:'Latency-based', desc:'优先使用延迟最低的 target。', use:'适合对延迟敏感的应用。' },
          ]" :key="s.name" class="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <h4 class="mb-1 text-sm font-semibold text-brand-400">{{ s.name }}</h4>
            <p class="mb-2 text-xs text-zinc-300">{{ s.desc }}</p>
            <p class="text-[11px] text-zinc-500">适用场景：{{ s.use }}</p>
          </div>
        </div>
        <div class="card mt-6 p-4">
          <p class="text-xs text-zinc-400">
            💡 故障转移策略在链级别（<code class="font-mono text-brand-400">models[].strategy</code>）配置，默认为
            <code class="font-mono text-brand-400">priority</code>。可在管理界面「故障转移链」页面切换。
          </p>
        </div>
      </section>

      <!-- 部署指南 -->
      <section id="deploy">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-cloud h-5 w-5 text-brand-400" />
          部署指南
        </h2>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">Docker Compose（推荐）</h3>
        <pre class="mb-6 overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code># 1. 克隆仓库
git clone https://github.com/clockclock1/HydraLLM.git
cd HydraLLM

# 2. 创建 .env 文件
cp deploy/compose/.env.example .env

# 3. 编辑 .env，填入你的配置
# 4. 启动
docker compose -f deploy/compose/docker-compose.yml up -d

# 访问 http://localhost:8787
docker compose -f deploy/compose/docker-compose.yml logs -f</code></pre>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">Docker 单容器</h3>
        <pre class="mb-6 overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code>docker build -t hydrallm .
docker run -d \
  -p 8787:8787 \
  -v $(pwd)/data:/app/data \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=8787 \
  hydrallm</code></pre>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">Kubernetes</h3>
        <pre class="mb-6 overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code># 使用 kustomize 部署
kubectl apply -k deploy/kubernetes/base/

# 自定义配置
cp deploy/kubernetes/base/configmap.yaml.example \
   deploy/kubernetes/base/configmap.yaml
# 编辑后重新 apply</code></pre>

        <h3 class="mb-2 text-lg font-semibold text-zinc-100">直接运行</h3>
        <pre class="overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs text-zinc-300"><code>node server.js
# 或 Windows
.\start.bat</code></pre>
      </section>

      <!-- 常见问题 -->
      <section id="troubleshoot">
        <h2 class="mb-4 flex items-center gap-2 text-2xl font-bold">
          <span class="i-lucide-help-circle h-5 w-5 text-brand-400" />
          常见问题
        </h2>

        <div class="space-y-6">
          <div class="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <h4 class="mb-1 text-sm font-semibold text-zinc-100">为什么请求被路由到了备选模型？</h4>
            <p class="text-xs leading-relaxed text-zinc-400">
              检查管理界面「实时状况」或「请求日志」，通常原因有：主目标返回了 <code class="font-mono text-brand-400">429</code>（限流）、
              <code class="font-mono text-brand-400">5xx</code>（服务端错误）、或连接超时。
              故障转移链会按顺序尝试所有启用的 target。
            </p>
          </div>

          <div class="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <h4 class="mb-1 text-sm font-semibold text-zinc-100">熔断器触发后怎么恢复？</h4>
            <p class="text-xs leading-relaxed text-zinc-400">
              熔断器在 <code class="font-mono text-brand-400">cooldownMinutes</code>（默认 10 分钟）后自动恢复。
              如果手动恢复，可以在管理界面的「故障转移链」页面点击重置。收到 429 等限流码会触发即时熔断（跳过冷却等待）。
            </p>
          </div>

          <div class="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <h4 class="mb-1 text-sm font-semibold text-zinc-100">如何测试单个目标的连通性？</h4>
            <p class="text-xs leading-relaxed text-zinc-400">
              进入管理界面「模型测试」页面，选择目标后点击「开始测试」。会测试文本（text）、视觉（vision）和工具调用（tool）三种能力。
            </p>
          </div>

          <div class="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <h4 class="mb-1 text-sm font-semibold text-zinc-100">支持哪些上游供应商？</h4>
            <p class="text-xs leading-relaxed text-zinc-400">
              只要供应商提供 OpenAI 兼容的 API 接口即可。已验证：OpenAI、Anthropic（通过兼容层）、DeepSeek、Moonshot、智谱 GLM、
              通义千问、本地 Ollama/vLLM 等。
            </p>
          </div>

          <div class="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <h4 class="mb-1 text-sm font-semibold text-zinc-100">配置文件在哪里？会丢失吗？</h4>
            <p class="text-xs leading-relaxed text-zinc-400">
              配置存储在 <code class="font-mono text-brand-400">data/config.json</code>，通过管理界面保存后自动持久化。
              使用 Docker 部署时，通过 <code class="font-mono text-brand-400">-v $(pwd)/data:/app/data</code> 挂载数据卷即可确保不丢失。
            </p>
          </div>
        </div>
      </section>

      <!-- 底部链接 -->
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p class="mb-3 text-sm text-zinc-300">需要更多帮助？</p>
        <div class="flex flex-wrap justify-center gap-3">
          <a :href="site.upstream.repo" target="_blank" rel="noopener" class="btn-primary px-5 py-2.5 text-sm">
            <span class="i-lucide-github h-4 w-4" /> GitHub
          </a>
          <a :href="site.upstream.issues" target="_blank" rel="noopener" class="btn-ghost px-5 py-2.5 text-sm">
            <span class="i-lucide-message-square h-4 w-4" /> 问题反馈
          </a>
          <a :href="'/ui/'" target="_blank" class="btn-ghost px-5 py-2.5 text-sm">
            <span class="i-lucide-flask-conical h-4 w-4" /> 体验演示
          </a>
        </div>
      </div>
    </article>
  </div>
</template>
