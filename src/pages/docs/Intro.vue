<script setup lang="ts">
import DocContainer from '../../components/DocContainer.vue'
</script>

<template>
  <div>
    <h1>Failover-Proxy 使用文档<a class="header-anchor" href="#intro" aria-label="Permalink"></a></h1>

    <p>
      <code>Failover-Proxy</code> 是一个 OpenAI 兼容的 LLM 故障转移代理，在你的应用与上游 LLM API 之间插入一层代理，
      为每个模型配置有序的备选目标链。当主目标返回错误或触发限流（429 等）时，Failover-Proxy 会自动将请求路由到
      链上下一个可用目标，对外表现始终可用。
    </p>

    <p>
      <strong>关于本演示站</strong>：本仓库（<code>failover-proxy-demo</code>）是 Failover-Proxy 项目的 Cloudflare Pages 静态展示站，
      由两个部分组成：
    </p>
    <ul>
      <li><strong>着陆页</strong>（<code>/</code>）— Vue 3 项目介绍页</li>
      <li><strong>交互演示</strong>（<code>/ui/</code>）— React UI + fetch 拦截器模拟 API，自带 8 个管理页面（仪表盘、模型提供商、模型测试、故障转移链、模型统计、代理端点、实时状况、请求日志）</li>
    </ul>

    <DocContainer type="tip" title="一句话总结">
      只需把 OpenAI 客户端的 <code>base_url</code> 指向 Failover-Proxy，就能获得自动故障转移能力，业务代码零改动。
    </DocContainer>

    <DocContainer type="info" title="本站与上游的关系">
      本演示站不含真实后端，<code>/ui/</code> 下的所有 <code>/api/*</code> 请求由内嵌 fetch 拦截器返回预设模拟数据。
      上游 Failover-Proxy 是可独立部署的完整服务（见
      <a href="https://github.com/clockclock1/Failover-Proxy" target="_blank" rel="noopener">GitHub 仓库</a>）。
      UI 目录 (<code>ui/src/</code>) 通过 GitHub Actions 每小时自动同步上游最新代码，因此本演示始终反映上游的当前形态。
    </DocContainer>
  </div>
</template>
