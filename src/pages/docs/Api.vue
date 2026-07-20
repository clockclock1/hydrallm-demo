<script setup lang="ts">
import CodeBlock from '../../components/CodeBlock.vue'
import DocContainer from '../../components/DocContainer.vue'

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
  { m: 'POST', p: '/api/model-source/preview', d: '预览远程模型列表（不保存配置）' },
  { m: 'POST', p: '/api/model-source/refresh', d: '刷新远程模型来源（重新拉取模型列表）' },
]
</script>

<template>
  <div>
    <h1>API 参考<a class="header-anchor" href="#api" aria-label="Permalink"></a></h1>
    <p>HydraLLM 提供两类 API：OpenAI 兼容的代理端点和管理端点。</p>

    <h2>OpenAI 兼容端点<a class="header-anchor" href="#proxy-endpoints" aria-label="Permalink"></a></h2>
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
curl http://localhost:8787/v1/chat/completions \
  -H "Authorization: Bearer sk-local-test" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-failover",
    "messages": [{"role":"user","content":"Hello!"}],
    "stream": true
  }'</CodeBlock>

    <h3>预览远程模型来源<a class="header-anchor" href="#model-source-preview" aria-label="Permalink"></a></h3>
    <CodeBlock lang="bash"># 预览第三方 URL 的模型列表（不保存配置）
curl -X POST http://localhost:8787/api/model-source/preview \
  -H "x-admin-session: $ADMIN_SESSION" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.openai.com/v1/models",
    "apiKey": "sk-your-key"
  }'
# 返回：{ "ok": true, "count": 12, "models": ["gpt-4o", "gpt-4.1-mini", ...] }</CodeBlock>

    <h2>管理端点<a class="header-anchor" href="#admin-endpoints" aria-label="Permalink"></a></h2>
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
  </div>
</template>
