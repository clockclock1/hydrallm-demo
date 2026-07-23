<script setup lang="ts">
const faqs = [
  { q: '为什么请求被路由到了备选模型？', a: '检查管理界面「实时状况」或「请求日志」，通常原因有：主目标返回了 429（限流）、5xx（服务端错误）、或连接超时。故障转移链会按顺序尝试所有启用的 target。' },
  { q: '熔断器触发后怎么恢复？', a: '熔断器在 cooldownMinutes（默认 10 分钟）后自动恢复。如果手动恢复，可以在管理界面的「故障转移链」页面点击重置。收到 429 等限流码会触发即时熔断（跳过冷却等待）。' },
  { q: '如何测试单个目标的连通性？', a: '进入管理界面「模型测试」页面，选择目标后点击「开始测试」。会测试文本、视觉和工具调用三种能力。' },
  { q: '支持哪些上游供应商？', a: '只要供应商提供 OpenAI 兼容的 API 接口即可。已验证：OpenAI、Anthropic（通过兼容层）、DeepSeek、Moonshot、智谱 GLM、通义千问、本地 Ollama/vLLM 等。' },
  { q: '配置文件在哪里？会丢失吗？', a: '配置存储在 data/config.json，通过管理界面保存后自动持久化。使用 Docker 部署时，通过 -v $(pwd)/data:/app/data 挂载数据卷即可确保不丢失。' },
  { q: '本演示站的 ui/ 目录会不会自动更新？', a: '会。GitHub Actions 每小时整点（UTC）检查上游 Failover-Proxy 的提交，发现 ui/src/ 有变化会自动 commit 到 main，Cloudflare Pages 的 Git 集成会随之重新部署。也可在 Actions 页手动触发，或通过 repository_dispatch webhook 即时触发。' },
]
</script>

<template>
  <div>
    <h1>常见问题<a class="header-anchor" href="#troubleshoot" aria-label="Permalink"></a></h1>
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
  </div>
</template>
