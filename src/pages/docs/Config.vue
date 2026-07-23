<script setup lang="ts">
import CodeBlock from '../../components/CodeBlock.vue'
import DocContainer from '../../components/DocContainer.vue'

const configFields = [
  { f: 'adminToken', t: 'string', d: '管理员登录密码，默认 admin' },
  { f: 'proxyKeys', t: 'array', d: '代理 API 密钥列表，客户端用此认证' },
  { f: 'failoverStatusCodes', t: 'number[]', d: '触发故障转移的状态码（默认含 429、5xx）' },
  { f: 'requestTimeoutMs', t: 'number', d: '请求超时（毫秒），默认 120000' },
  { f: 'circuitBreaker', t: 'object', d: '熔断器配置（阈值、冷却时间等）' },
  { f: 'modelSource', t: 'object', d: '远程模型来源配置（可从第三方 URL 自动拉取模型列表）' },
  { f: 'models', t: 'array', d: '故障转移链配置（核心）' },
  { f: 'providers', t: 'array', d: '上游供应商配置（baseUrl + apiKey）' },
]
</script>

<template>
  <div>
    <h1>配置说明<a class="header-anchor" href="#config" aria-label="Permalink"></a></h1>
    <p>
      Failover-Proxy 使用 <code>data/config.json</code> 存储配置。所有配置都可以通过管理界面修改，无需手动编辑文件。
    </p>

    <h2>顶层字段<a class="header-anchor" href="#top-level" aria-label="Permalink"></a></h2>
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

    <h2>故障转移链（models）示例<a class="header-anchor" href="#failover-chain" aria-label="Permalink"></a></h2>
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

    <h2>熔断器配置<a class="header-anchor" href="#circuit-breaker" aria-label="Permalink"></a></h2>
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

    <h2>远程模型来源（modelSource）<a class="header-anchor" href="#model-source" aria-label="Permalink"></a></h2>
    <p>
      <code>modelSource</code> 可配置一个第三方 URL，Failover-Proxy 会自动从该 URL 拉取模型列表，
      支持通过 <code>include</code> / <code>exclude</code> 正则过滤，并可在模型名前后添加 <code>publicPrefix</code> / <code>publicSuffix</code>。
    </p>
    <CodeBlock lang="json">{
  "modelSource": {
    "enabled": true,
    "url": "https://api.openai.com/v1/models",
    "apiKey": "sk-your-key",
    "refreshSeconds": 300,
    "include": "^(gpt|o3).*$",
    "exclude": "^(gpt-3|gpt-4).*$",
    "publicPrefix": "",
    "publicSuffix": "-public",
    "targets": []
  }
}</CodeBlock>
    <DocContainer type="tip">
      <code>targets</code> 数组用于指定特定的 baseUrl/apiKey 组合来拉取模型列表，
      如果为空则使用 <code>url</code> 和 <code>apiKey</code> 直接请求。
    </DocContainer>
  </div>
</template>
