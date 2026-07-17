// 站点文案与内容配置 —— 单独抽离便于维护
// 注意：本站是纯展示示例，所有"数据"均为静态展示用，不与真实后端交互。

export const site = {
  name: 'HydraLLM',
  tagline: '接入多个大模型不该是一件头疼的事',
  subtitle:
    '一个 OpenAI 兼容的 LLM 故障转移代理，自带可视化管理界面。模型故障或触发限流时，自动将流量路由到下一个可用目标。',
  upstream: {
    repo: 'https://github.com/clockclock1/HydraLLM',
    issues: 'https://github.com/clockclock1/HydraLLM/issues',
    demoRepo: 'https://github.com/clockclock1/hydrallm-demo',
    license: 'Apache-2.0',
  },
} as const

export interface Feature {
  icon: string
  title: string
  description: string
}

export const features: Feature[] = [
  {
    icon: 'i-lucide-plug-zap',
    title: 'OpenAI 兼容',
    description:
      '兼容 /v1/chat/completions、/v1/models 等端点。切换 base_url 即可生效，业务代码无需任何改动。',
  },
  {
    icon: 'i-lucide-shuffle',
    title: '零代码故障转移',
    description:
      '为每个代理模型配置有序的备选目标，主目标不可用时按顺序自动切换到下一个，对外表现始终可用。',
  },
  {
    icon: 'i-lucide-list-ordered',
    title: '四种调度策略',
    description:
      '内置 priority、round-robin、weighted、latency-based 四种调度策略，按场景选择最合适的路由方式。',
  },
  {
    icon: 'i-lucide-shield-alert',
    title: '熔断器',
    description:
      '连续失败达到阈值后自动熔断目标，冷却期内跳过该目标；429 等限流码可配置为即时熔断。',
  },
  {
    icon: 'i-lucide-waves',
    title: 'SSE 流式透传',
    description:
      '完整支持流式响应（Server-Sent Events）、工具调用与多模态请求，逐字输出无任何拦截或改写。',
  },
  {
    icon: 'i-lucide-activity',
    title: '可观测性',
    description:
      '内置请求统计、成功率、故障转移次数、日志面板与实时状态，所有指标可在管理界面一览无余。',
  },
]

export interface FlowStep {
  id: string
  label: string
  sub: string
  status: 'ok' | 'failover' | 'cooldown' | 'streaming'
}

// 故障转移演示流程：模拟一次请求被依次切流的完整过程
export const flow: FlowStep[] = [
  {
    id: 'primary',
    label: '主目标',
    sub: 'gpt-4.1-mini · OpenAI',
    status: 'failover',
  },
  {
    id: 'secondary',
    label: '备选 1',
    sub: 'claude-3.7 · Anthropic',
    status: 'cooldown',
  },
  {
    id: 'tertiary',
    label: '备选 2',
    sub: 'deepseek-v3 · 第三方',
    status: 'streaming',
  },
]

export interface Stack {
  name: string
  icon: string
  color: string
}

export const stack: Stack[] = [
  { name: 'Node.js', icon: 'i-logos-nodejs-icon', color: '#5fa04e' },
  { name: 'Express', icon: 'i-simple-icons-express', color: '#ffffff' },
  { name: 'React 19', icon: 'i-logos-react', color: '#61dafb' },
  { name: 'TypeScript', icon: 'i-logos-typescript-icon', color: '#3178c6' },
  { name: 'Vite 7', icon: 'i-logos-vitejs', color: '#646cff' },
  { name: 'Tailwind CSS v4', icon: 'i-logos-tailwindcss-icon', color: '#06b6d4' },
  { name: 'Docker', icon: 'i-logos-docker-icon', color: '#2496ed' },
  { name: 'Kubernetes', icon: 'i-logos-kubernetes', color: '#326ce5' },
]

export const stats = [
  { value: '4', label: '调度策略' },
  { value: '0', label: '业务代码改动' },
  { value: '∞', label: '备选目标层数' },
  { value: 'SSE', label: '原样透传' },
]

export interface Endpoint {
  method: 'GET' | 'POST'
  path: string
  description: string
}

export const endpoints: Endpoint[] = [
  { method: 'GET', path: '/v1/models', description: '获取所有可用的代理模型列表' },
  {
    method: 'POST',
    path: '/v1/chat/completions',
    description: '聊天补全 —— 自动故障转移、流式透传、工具调用',
  },
  { method: 'GET', path: '/health', description: '健康检查与存活探测' },
  {
    method: 'GET',
    path: '/admin/config',
    description: '读取当前配置（需管理员令牌）',
  },
]

/* ------------------------------------------------------------------ */
/* 文档站导航与内容元数据                                                */
/* ------------------------------------------------------------------ */

export interface DocSection {
  /** 锚点 id，须与 DocsPage.vue 中 <section :id> 一致 */
  id: string
  /** 侧边栏显示文本 */
  label: string
  /** 图标（lucide 图标类名，前缀 i-lucide-） */
  icon: string
}

/** 文档侧边栏章节顺序 —— 同时被 DocsPage 用于渲染目录 */
export const docSections: DocSection[] = [
  { id: 'intro',         label: '简介',           icon: 'i-lucide-info' },
  { id: 'features',      label: '核心特性',        icon: 'i-lucide-sparkles' },
  { id: 'quickstart',    label: '快速开始',        icon: 'i-lucide-rocket' },
  { id: 'config',        label: '配置说明',        icon: 'i-lucide-settings' },
  { id: 'api',           label: 'API 参考',        icon: 'i-lucide-code' },
  { id: 'failover',      label: '故障转移策略',    icon: 'i-lucide-shuffle' },
  { id: 'deploy',        label: '部署到 Cloudflare', icon: 'i-lucide-cloud' },
  { id: 'sync',          label: '自动同步 Workflow', icon: 'i-lucide-refresh-cw' },
  { id: 'troubleshoot',  label: '常见问题',        icon: 'i-lucide-help-circle' },
]

export interface DocNavLink {
  /** 锚点 id（不带 #） */
  id: string
  /** 显示标题 */
  title: string
  /** 段落简介 */
  desc: string
}

export interface DocMeta {
  /** 上次更新日期，YYYY-MM-DD */
  lastUpdated: string
  /** GitHub 源文件链接（"Edit on GitHub"） */
  editLink: string
  /** 页脚翻页器 */
  prev?: DocNavLink
  next?: DocNavLink
}

/** 文档页元信息 —— 由 DocsPage 在页脚/页头展示 */
export const docMeta: DocMeta = {
  lastUpdated: '2026-07-17',
  editLink: `${site.upstream.demoRepo}/blob/main/src/pages/DocsPage.vue`,
}
