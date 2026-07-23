<script setup lang="ts">
import CodeBlock from '../../components/CodeBlock.vue'
import DocContainer from '../../components/DocContainer.vue'
</script>

<template>
  <div>
    <h1>部署到 Cloudflare Pages<a class="header-anchor" href="#deploy" aria-label="Permalink"></a></h1>
    <p>
      本演示站使用 <strong>Cloudflare Pages 的 Git 集成</strong>自动部署：<code>main</code> 分支有推送即触发构建。
    </p>

    <h2>1. 创建项目<a class="header-anchor" href="#create" aria-label="Permalink"></a></h2>
    <ol>
      <li>登录 <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener">Cloudflare Dashboard</a> → <strong>Workers & Pages</strong> → <strong>Create</strong> → <strong>Pages</strong> → <strong>Connect to Git</strong></li>
      <li>选择 <code>clockclock1/failover-proxy-demo</code> 仓库（或你 fork 的副本）</li>
      <li>按下表填写构建配置</li>
      <li>点击 <strong>Save and Deploy</strong></li>
    </ol>

    <h2>2. 构建配置<a class="header-anchor" href="#build-config" aria-label="Permalink"></a></h2>
    <table>
      <thead>
        <tr><th>字段</th><th>值</th></tr>
      </thead>
      <tbody>
        <tr><td>Project name</td><td><code>failover-proxy-demo</code></td></tr>
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

    <h2>3. 自定义域名<a class="header-anchor" href="#custom-domain" aria-label="Permalink"></a></h2>
    <p>
      部署成功后会得到形如 <code>failover-proxy-demo.pages.dev</code> 的域名。
      在项目的 <strong>Custom domains</strong> 选项卡中添加自有域名，按提示添加 CNAME 即可绑定。
    </p>

    <h2>4. 本地构建预览<a class="header-anchor" href="#local-preview" aria-label="Permalink"></a></h2>
    <CodeBlock lang="bash"># 安装根项目依赖
npm install

# 完整构建（Vue 着陆页 + React UI）
npm run build

# 本地预览 dist/
npx wrangler pages dev dist</CodeBlock>
  </div>
</template>
