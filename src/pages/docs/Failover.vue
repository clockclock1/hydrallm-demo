<script setup lang="ts">
import DocContainer from '../../components/DocContainer.vue'

const strategies = [
  { name: 'Priority', desc: '按 targets 数组顺序，从第一个开始尝试，失败后切到下一个。', use: '最常用，适合主备场景。' },
  { name: 'Round Robin', desc: '轮流使用每个 target，均匀分配负载。', use: '适合多个供应商配额均匀时。' },
  { name: 'Weighted', desc: '按 target 的 weight 字段概率分配请求。', use: '适合部分供应商配额/速度有差异时。' },
  { name: 'Latency-based', desc: '优先使用延迟最低的 target。', use: '适合对延迟敏感的应用。' },
]
</script>

<template>
  <div>
    <h1>故障转移策略<a class="header-anchor" href="#failover" aria-label="Permalink"></a></h1>
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
  </div>
</template>
