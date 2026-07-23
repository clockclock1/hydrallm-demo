<script setup lang="ts">
import CodeBlock from '../../components/CodeBlock.vue'
import DocContainer from '../../components/DocContainer.vue'

// 注意：模板里的 <sha> 是 HTML 实体，避免 Vue 把它解析为子元素标签
const webhookCurl = `# 触发一次上游同步（repository_dispatch）
curl -X POST \\
  -H "Accept: application/vnd.github+json" \\
  -H "Authorization: Bearer \$GITHUB_TOKEN" \\
  -d '{"event_type":"sync-upstream"}' \\
  https://api.github.com/repos/clockclock1/failover-proxy-demo/dispatches`
</script>

<template>
  <div>
    <h1>自动同步 Workflow<a class="header-anchor" href="#sync" aria-label="Permalink"></a></h1>
    <p>
      本仓库的 <code>ui/src/</code> 目录会自动与上游
      <a href="https://github.com/clockclock1/Failover-Proxy" target="_blank" rel="noopener">clockclock1/Failover-Proxy</a>
      保持同步。同步由 <code>.github/workflows/sync-upstream.yml</code> 驱动。
    </p>

    <h2>三种触发方式<a class="header-anchor" href="#triggers" aria-label="Permalink"></a></h2>
    <table>
      <thead>
        <tr><th>触发方式</th><th>说明</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>定时触发</strong></td><td>每小时整点（UTC）通过 <code>cron: '0 * * * *'</code> 检查上游 HEAD SHA，无变化时跳过。</td></tr>
        <tr><td><strong>手动触发</strong></td><td>在仓库 Actions 页选择 "Sync upstream Failover-Proxy ui/"，点击 Run workflow。</td></tr>
        <tr><td><strong>外部 Webhook</strong></td><td>通过 <code>repository_dispatch</code> 事件触发，用于上游 push 后立即同步。</td></tr>
      </tbody>
    </table>

    <h2>Webhook 触发命令<a class="header-anchor" href="#webhook-cmd" aria-label="Permalink"></a></h2>
    <CodeBlock lang="bash">{{ webhookCurl }}</CodeBlock>

    <h2>同步流程<a class="header-anchor" href="#flow" aria-label="Permalink"></a></h2>
    <ol>
      <li>通过 GitHub API 获取上游 <code>Failover-Proxy</code> 的 HEAD SHA</li>
      <li>从本仓库最近一次同步 commit 信息解析上次 SHA，相同则跳过</li>
      <li>浅克隆上游仓库，用 <code>cp -r</code> 覆盖 <code>ui/src/</code>（保留 <code>vite.config.ts</code>、<code>index.html</code>、<code>package.json</code> 等定制文件）</li>
      <li>若 <code>ui/src/</code> 有 diff，提交 <code>chore(sync): ui/ synced from upstream Failover-Proxy&#64;sha</code></li>
      <li>推送到 <code>main</code>，Cloudflare Pages 自动重新部署</li>
    </ol>

    <h2>同步覆盖的内容<a class="header-anchor" href="#scope" aria-label="Permalink"></a></h2>
    <p>
      <code>ui/src/</code> 目录整体覆盖，目前包含上游 Failover-Proxy 当前版本的：
    </p>
    <ul>
      <li><code>App.tsx</code> / <code>main.tsx</code> / <code>store.tsx</code> / <code>types.ts</code> — 应用入口、状态管理、类型定义</li>
      <li><code>components/</code> — 12 个 UI 组件（Sidebar、Dashboard、Login、Loading、FailoverChains、LiveStatus、Logs、ModelStats、ModelTests、Providers、ProxyEndpoints、AnimatedGlyph）</li>
      <li><code>pages/</code> — 8 个独立路由页面（与 Sidebar 导航对应）</li>
      <li><code>hooks/usePageNavigation.ts</code> — 页面切换 hook（封装 <code>history.pushState</code>/<code>popstate</code>）</li>
      <li><code>index.css</code> / <code>utils/cn.ts</code> — 全局样式与 <code>clsx + tailwind-merge</code> 工具</li>
    </ul>
    <DocContainer type="warning" title="定制文件不会被覆盖">
      <code>ui/vite.config.ts</code>、<code>ui/index.html</code>、<code>ui/package.json</code>、<code>ui/public/</code>
      这些针对 Cloudflare Pages 演示环境定制的文件不会随上游同步被覆盖，仅 <code>ui/src/</code> 会被覆盖。
    </DocContainer>
  </div>
</template>
