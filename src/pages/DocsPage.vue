<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { docSections, docMeta, site } from '../data/sections'
import DocContainer from '../components/DocContainer.vue'
import CodeBlock from '../components/CodeBlock.vue'
import DocPager from '../components/DocPager.vue'

// 当前激活的 section id（用于左侧目录与右侧 outline 同步高亮）
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
  document.getElementById(id)?.scrollTo?.({ behavior: 'smooth', block: 'start' } as ScrollIntoViewOptions) ??
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 数据
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

const proxyEndpoints = [
  { m: 'GET', p: '/v1/models', d: '获取所有可用的代理模型列表' },
  { m: 'POST', p: '/v1/chat/completions', d: '聊天补全 —— 自动故障转移、流式透传' },
  { m: 'POST', p: '/v1/embeddings', d: 'Embedding 请求（如果上游支持）' },
  { m: 'GET', p: '/health', d: '健康检查' },
]

const adminEndpoints = [
  { m: 'POST', p: '/api/login', d: '登录（body: {token}）' },
  { m: 'POST', p: '/api/logout', d: '登出' },
  { m: 'GET', p: '/api/config', d: '读取完整配置' },
  { m: 'POST', p: '/api/config', d: '保存配置' },
  { m: 'GET', p: '/api/stats', d: '实时统计（每秒轮询）' },
  { m: 'POST', p: '/api/providers/health', d: '供应商健康检查' },
  { m: 'POST', p: '/api/model-tests/run', d: '运行模型能力测试（text/vision/tool）' },
]

const strategies = [
  { name: 'Priority', desc: '按 targets 数组顺序，从第一个开始尝试，失败后切到下一个。', use: '最常用，适合主备场景。' },
  { name: 'Round Robin', desc: '轮流使用每个 target，均匀分配负载。', use: '适合多个供应商配额均匀时。' },
  { name: 'Weighted', desc: '按 target 的 weight 字段概率分配请求。', use: '适合部分供应商配额/速度有差异时。' },
  { name: 'Latency-based', desc: '优先使用延迟最低的 target。', use: '适合对延迟敏感的应用。' },
]

const faqs = [
  { q: '为什么请求被路由到了备选模型？', a: '检查管理界面「实时状况」或「请求日志」，通常原因有：主目标返回了 429（限流）、5xx（服务端错误）、或连接超时。故障转移链会按顺序尝试所有启用的 target。' },
  { q: '熔断器触发后怎么恢复？', a: '熔断器在 cooldownMinutes（默认 10 分钟）后自动恢复。如果手动恢复，可以在管理界面的「故障转移链」页面点击重置。收到 429 等限流码会触发即时熔断（跳过冷却等待）。' },
  { q: '如何测试单个目标的连通性？', a: '进入管理界面「模型测试」页面，选择目标后点击「开始测试」。会测试文本（视觉）和工具调用三种能力。' },
  { q: '支持哪些上游供应商？', a: '只要供应商提供 OpenAI 兼容的 API 接口即可。已验证：OpenAI、Anthropic（通过兼容层）、DeepSeek、Moonshot、智谱 GLM、通义千问、本地 Ollama/vLLM 等。' },
  { q: '配置文件在哪里？会丢失吗？', a: '配置存储在 data/config.json，通过管理界面保存后自动持久化。使用 Docker 部署时，通过 -v $(pwd)/data:/app/data 挂载数据卷即可确保不丢失。' },
  { q: '本演示站的 ui/ 目录会不会自动更新？', a: '会。GitHub Actions 每小时整点检查上游 HydraLLM 的提交，发现 ui/src/ 有变化会自动 commit 到 main，Cloudflare Pages 的 Git 集成会随之重新部署。' },
]

const webhookCurl = `# 触发一次上游同步（repository_dispatch）
curl -X POST \\
  -H "Accept: application/vnd.github+json" \\
  -H "Authorization: Bearer \$GITHUB_TOKEN" \\
  -d '{"event_type":"sync-upstream"}' \\
  https://api.github.com/repos/clockclock1/hydrallm-demo/dispatches`
</script>

<template>
  <!-- 三栏布局：左侧 sidebar + 中间内容 + 右侧 outline -->
  <div class="grid grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)_192px] gap-8">

    <!-- 左侧 sidebar（章节目录） -->
    <aside class="hidden lg:block">
      <nav class="sticky top-6 flex flex-col gap-0.5">
        <p class="mb-3 text-[14px] font-bold text-[var(--vp-c-text-1)]">目录</p>
        <button
          v-for="s in sections"
          :key="s.id"
          @click="scrollTo(s.id)"
          :class="[
            'flex items-center gap-2 py-1.5 text-left text-[14px] font-medium transition-colors duration-150',
            activeId === s.id
              ? 'text-[var(--vp-c-brand-1)]'
              : 'text-[var(--vp-c-text-2)] hover:text-[var(--vp-c-text-1)]',
          ]"
        >
          <span :class="s.icon" class="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
          {{ s.label }}
        </button>
      </nav>
    </aside>

    <!-- 中间内容区（.vp-doc 样式作用域） -->
    <article class="vp-doc min-w-0">

      <!-- 顶部 meta 行 -->
      <div class="vp-doc-footer !mt-0 !mb-8">
        <div class="edit-info">
          <a
            :href="docMeta.editLink"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-1.5 !text-[14px] !no-underline !text-[var(--vp-c-text-2)] hover:!text-[var(--vp-c-brand-1)]"
          >
            <span class="i-lucide-square-pen h-3.5 w-3.5" />
            在 GitHub 上编辑此页面
          </a>
          <p class="last-updated flex items-center gap-1.5 !text-[14px] !m-0 !text-[var(--vp-c-text-2)]">
            <span class="i-lucide-clock h-3.5 w-3.5" />
            最后更新于：{{ docMeta.lastUpdated }}
          </p>
        </div>
      </div>

      <!-- 简介 -->
      <section id="intro">
        <h1 id="临时邮箱简介" tabindex="-1">
          HydraLLM 使用文档
          <a class="header-anchor" :href="`#intro`" aria-label="Permalink"></a>
        </h1>

        <p>
          <code>HydraLLM</code> 是一个 OpenAI 兼容的 LLM 故障转移代理，在你的应用与上游 LLM API 之间插入一层代理，
          为每个模型配置有序的备选目标链。当主目标返回错误或触发限流（429 等）时，HydraLLM 会自动将请求路由到
          链上下一个可用目标，对外表现始终可用。
        </p>

        <p>
          <strong>关于本演示站</strong>：本仓库（<code>hydrallm-demo</code>）是 HydraLLM 项目的 Cloudflare Pages 静态展示站，
          由两个部分组成：
        </p>
        <ul>
          <li><strong>着陆页</strong>（<code>/</code>）— Vue 3 项目介绍页</li>
          <li><strong>交互演示</strong>（<code>/ui/</code>）— React UI + fetch 拦截器模拟 API</li>
        </ul>

        <DocContainer type="tip" title="一句话总结">
          只需把 OpenAI 客户端的 <code>base_url</code> 指向 HydraLLM，就能获得自动故障转移能力，业务代码零改动。
        </DocContainer>

        <DocContainer type="info" title="本站与上游的关系">
          本演示站不含真实后端，<code>/ui/</code> 下的所有 <code>/api/*</code> 请求由内嵌 fetch 拦截器返回预设模拟数据。
          上游 HydraLLM 是可独立部署的完整服务（见
          <a href="https://github.com/clockclock1/HydraLLM" target="_blank" rel="noopener">GitHub 仓库</a>）。
        </DocContainer>
      </section>

      <!-- 核心特性 -->
      <section id="features">
        <h2>核心特性<a class="header-anchor" href="#features" aria-label="Permalink"></a></h2>
        <p>
          HydraLLM 把"多模型路由 + 故障转移"封装为标准的 OpenAI 兼容接口，让你无需改动业务代码即可获得以下能力。
        </p>
        <ul>
          <li v-for="f in features" :key="f.t">
            <strong>{{ f.t }}</strong>：{{ f.d }}
          </li>
        </ul>
      </section>

      <!-- 快速开始 -->
      <section id="quickstart">
        <h2>快速开始<a class="header-anchor" href="#quickstart" aria-label="Permalink"></a></h2>

        <h3>1. 克隆与安装</h3>
        <CodeBlock lang="bash" :tabs="['pnpm', 'npm', 'yarn']">
pnpm install
===
npm install
===
yarn install
        </CodeBlock>

        <h3>2. 配置</h3>
        <CodeBlock lang="bash"># 复制示例配置
cp data/config.example.json data/config.json

# 编辑配置（填入你的 API Key）
# 修改 data/config.json 中的 providers 和 models</CodeBlock>

        <h3>3. 启动服务</h3>
        <CodeBlock lang="bash"># 开发模式
npm run dev

# 生产模式
npm start
# 服务默认运行在 http://localhost:8787</CodeBlock>

        <DocContainer type="tip">
          启动后访问 <code>http://localhost:8787</code> 即可看到管理界面，默认登录密码是 <code>admin</code>。
        </DocContainer>
      </section>

      <!-- 配置说明 -->
      <section id="config">
        <h2>配置说明<a class="header-anchor" href="#config" aria-label="Permalink"></a></h2>
        <p>
          HydraLLM 使用 <code>data/config.json</code> 存储配置。所有配置都可以通过管理界面修改，无需手动编辑文件。
        </p>

        <h3>顶层字段</h3>
        <table>
          <thead>
            <tr><th>字段</th><th>类型</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="c in configFields" :key="c.f">
              <td><code>{{ c.f }}</code></td>
              <td>{{ c.t }}</td>
              <td>{{ c.d }}</td>
            </tr>
          </tbody>
        </table>

        <h3>故障转移链（models）示例</h3>
        <CodeBlock lang="json">{
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
}</CodeBlock>

        <h3>熔断器配置</h3>
        <CodeBlock lang="json">{
  "circuitBreaker": {
    "failureThreshold": 3,
    "cooldownMinutes": 10,
    "immediateCooldownStatusCodes": [429]
  }
}</CodeBlock>
        <DocContainer type="info" title="字段含义">
          <code>failureThreshold</code>：连续失败多少次后触发熔断；
          <code>cooldownMinutes</code>：冷却时间（分钟）；
          <code>immediateCooldownStatusCodes</code>：收到这些状态码时立即熔断（如 429）。
        </DocContainer>
      </section>

      <!-- API 参考 -->
      <section id="api">
        <h2>API 参考<a class="header-anchor" href="#api" aria-label="Permalink"></a></h2>
        <p>HydraLLM 提供两类 API：OpenAI 兼容的代理端点和管理端点。</p>

        <h3>OpenAI 兼容端点</h3>
        <table>
          <thead>
            <tr><th>方法</th><th>路径</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="ep in proxyEndpoints" :key="ep.p">
              <td>{{ ep.m }}</td>
              <td><code>{{ ep.p }}</code></td>
              <td>{{ ep.d }}</td>
            </tr>
          </tbody>
        </table>

        <p>客户端调用示例：</p>
        <CodeBlock lang="bash"># 把 base_url 指向 HydraLLM，API Key 用 proxyKey
curl http://localhost:8787/v1/chat/completions \\
  -H "Authorization: Bearer sk-local-test" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-failover",
    "messages": [{"role":"user","content":"Hello!"}],
    "stream": true
  }'</CodeBlock>

        <h3>管理端点</h3>
        <DocContainer type="warning" title="需要管理员令牌">
          以下端点需要传入 <code>x-admin-session</code> header（登录后获取），否则返回 401。
        </DocContainer>
        <table>
          <thead>
            <tr><th>方法</th><th>路径</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="ep in adminEndpoints" :key="ep.p">
              <td>{{ ep.m }}</td>
              <td><code>{{ ep.p }}</code></td>
              <td>{{ ep.d }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 故障转移策略 -->
      <section id="failover">
        <h2>故障转移策略<a class="header-anchor" href="#failover" aria-label="Permalink"></a></h2>
        <p>
          每条故障转移链可独立选择调度策略，在 <code>models[].strategy</code> 字段配置，默认为 <code>priority</code>。
        </p>
        <table>
          <thead>
            <tr><th>策略</th><th>描述</th><th>适用场景</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in strategies" :key="s.name">
              <td><strong>{{ s.name }}</strong></td>
              <td>{{ s.desc }}</td>
              <td>{{ s.use }}</td>
            </tr>
          </tbody>
        </table>
        <DocContainer type="tip">
          故障转移策略可在管理界面「故障转移链」页面切换，修改后即时生效，无需重启服务。
        </DocContainer>
      </section>

      <!-- 部署到 Cloudflare Pages -->
      <section id="deploy">
        <h2>部署到 Cloudflare Pages<a class="header-anchor" href="#deploy" aria-label="Permalink"></a></h2>
        <p>
          本演示站使用 <strong>Cloudflare Pages 的 Git 集成</strong>自动部署：<code>main</code> 分支有推送即触发构建。
        </p>

        <h3>1. 创建项目</h3>
        <ol>
          <li>登录 <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener">Cloudflare Dashboard</a> → <strong>Workers & Pages</strong> → <strong>Create</strong> → <strong>Pages</strong> → <strong>Connect to Git</strong></li>
          <li>选择 <code>clockclock1/hydrallm-demo</code> 仓库（或你 fork 的副本）</li>
          <li>按下表填写构建配置</li>
          <li>点击 <strong>Save and Deploy</strong></li>
        </ol>

        <h3>2. 构建配置</h3>
        <table>
          <thead>
            <tr><th>字段</th><th>值</th></tr>
          </thead>
          <tbody>
            <tr><td>Project name</td><td><code>hydrallm-demo</code></td></tr>
            <tr><td>Production branch</td><td><code>main</code></td></tr>
            <tr><td>Framework preset</td><td>None</td></tr>
            <tr><td>Build command</td><td><code>npm install && npm run build</code></td></tr>
            <tr><td>Build output directory</td><td><code>dist</code></td></tr>
            <tr><td>Root directory</td><td><code>/</code></td></tr>
          </tbody>
        </table>

        <DocContainer type="tip" title="为什么不用 wrangler / API Token？">
          Cloudflare Pages 的 Git 集成会自动监听分支推送、自动拉起构建与部署，因此无需配置 GitHub Actions Secrets、无需本地安装 wrangler、无需 CF API Token。
        </DocContainer>

        <h3>3. 自定义域名</h3>
        <p>
          部署成功后会得到形如 <code>hydrallm-demo.pages.dev</code> 的域名。
          在项目的 <strong>Custom domains</strong> 选项卡中添加自有域名，按提示添加 CNAME 即可绑定。
        </p>

        <h3>4. 本地构建预览</h3>
        <CodeBlock lang="bash"># 安装根项目依赖
npm install

# 完整构建（Vue 着陆页 + React UI）
npm run build

# 本地预览 dist/
npx wrangler pages dev dist</CodeBlock>
      </section>

      <!-- 自动同步 Workflow -->
      <section id="sync">
        <h2>自动同步 Workflow<a class="header-anchor" href="#sync" aria-label="Permalink"></a></h2>
        <p>
          本仓库的 <code>ui/src/</code> 目录会自动与上游
          <a href="https://github.com/clockclock1/HydraLLM" target="_blank" rel="noopener">clockclock1/HydraLLM</a>
          保持同步。同步由 <code>.github/workflows/sync-upstream.yml</code> 驱动。
        </p>

        <h3>三种触发方式</h3>
        <table>
          <thead>
            <tr><th>触发方式</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>定时触发</strong></td><td>每小时整点（UTC）通过 <code>cron: '0 * * * *'</code> 检查上游 HEAD SHA，无变化时跳过。</td></tr>
            <tr><td><strong>手动触发</strong></td><td>在仓库 Actions 页选择 "Sync upstream HydraLLM ui/"，点击 Run workflow。</td></tr>
            <tr><td><strong>外部 Webhook</strong></td><td>通过 <code>repository_dispatch</code> 事件触发，用于上游 push 后立即同步。</td></tr>
          </tbody>
        </table>

        <h3>Webhook 触发命令</h3>
        <CodeBlock lang="bash">{{ webhookCurl }}</CodeBlock>

        <h3>同步流程</h3>
        <ol>
          <li>通过 GitHub API 获取上游 <code>HydraLLM</code> 的 HEAD SHA</li>
          <li>从本仓库最近一次同步 commit 信息解析上次 SHA，相同则跳过</li>
          <li>浅克隆上游仓库，用 <code>cp -r</code> 覆盖 <code>ui/src/</code>（保留 <code>vite.config.ts</code> 等定制文件）</li>
          <li>若有 diff，提交 <code>chore(sync): ui/ synced from upstream HydraLLM@&lt;sha&gt;</code></li>
          <li>推送到 <code>main</code>，Cloudflare Pages 自动重新部署</li>
        </ol>

        <DocContainer type="warning" title="定制文件不会被覆盖">
          <code>ui/vite.config.ts</code>、<code>ui/index.html</code>、<code>ui/package.json</code>
          这三份针对 Cloudflare Pages 演示环境定制的文件不会随上游同步被覆盖，仅 <code>ui/src/</code> 会被覆盖。
        </DocContainer>
      </section>

      <!-- 常见问题 -->
      <section id="troubleshoot">
        <h2>常见问题<a class="header-anchor" href="#troubleshoot" aria-label="Permalink"></a></h2>
        <div class="space-y-3">
          <details
            v-for="(f, i) in faqs"
            :key="i"
            class="custom-block info !p-4"
          >
            <summary class="!font-bold !cursor-pointer">{{ f.q }}</summary>
            <p class="!mt-2">{{ f.a }}</p>
          </details>
        </div>
      </section>

      <!-- 页脚 pager + 底部链接 -->
      <footer class="vp-doc-footer">
        <div class="edit-info">
          <a
            :href="docMeta.editLink"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-1.5 !text-[14px] !text-[var(--vp-c-text-2)] hover:!text-[var(--vp-c-brand-1)]"
          >
            <span class="i-lucide-square-pen h-3.5 w-3.5" />
            在 GitHub 上编辑此页面
          </a>
          <p class="!text-[14px] !m-0 !text-[var(--vp-c-text-2)]">
            最后更新于：{{ docMeta.lastUpdated }}
          </p>
        </div>

        <DocPager
          :prev="{ id: 'sync', title: '自动同步 Workflow', desc: '上一页' }"
          :next="{ id: 'intro', title: 'HydraLLM 使用文档', desc: '下一页' }"
        />
      </footer>

      <!-- 底部帮助链接 -->
      <div class="mt-12 rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center">
        <p class="mb-3 text-sm text-[var(--vp-c-text-2)]">需要更多帮助？</p>
        <div class="flex flex-wrap justify-center gap-3">
          <a :href="site.upstream.repo" target="_blank" rel="noopener" class="btn-primary px-5 py-2.5 text-sm">
            <span class="i-lucide-github h-4 w-4" /> GitHub
          </a>
          <a :href="site.upstream.issues" target="_blank" rel="noopener" class="btn-ghost px-5 py-2.5 text-sm">
            <span class="i-lucide-message-square h-4 w-4" /> 问题反馈
          </a>
          <a href="/ui/" target="_blank" class="btn-ghost px-5 py-2.5 text-sm">
            <span class="i-lucide-flask-conical h-4 w-4" /> 体验演示
          </a>
        </div>
      </div>
    </article>

    <!-- 右侧 outline（VPDocAsideOutline 风格） -->
    <aside class="hidden lg:block">
      <div class="vp-outline">
        <p class="outline-title">页面导航</p>
        <ul>
          <li v-for="s in sections" :key="s.id">
            <a
              class="outline-link"
              :class="{ active: activeId === s.id }"
              @click="scrollTo(s.id)"
            >
              {{ s.label }}
            </a>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>
