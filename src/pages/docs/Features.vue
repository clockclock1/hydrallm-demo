<script setup lang="ts">
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
</script>

<template>
  <div>
    <h1>核心特性<a class="header-anchor" href="#features" aria-label="Permalink"></a></h1>
    <p>
      Failover-Proxy 把"多模型路由 + 故障转移"封装为标准的 OpenAI 兼容接口，让你无需改动业务代码即可获得以下能力。
    </p>
    <ul>
      <li v-for="f in features" :key="f.t">
        <strong>{{ f.t }}</strong>：{{ f.d }}
      </li>
    </ul>
  </div>
</template>
