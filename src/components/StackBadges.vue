<script setup lang="ts">
import { stack, endpoints } from '../data/sections'
</script>

<template>
  <!-- 技术栈徽章 -->
  <section class="mb-16">
    <h2 class="mb-8 text-center text-2xl font-bold tracking-tight">
      <span class="text-gradient">技术栈</span>
    </h2>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <span
        v-for="s in stack"
        :key="s.name"
        class="chip border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.07]"
        :style="{ '--icon-color': s.color }"
      >
        <span :class="s.icon" class="h-3.5 w-3.5" />
        {{ s.name }}
      </span>
    </div>
  </section>

  <!-- API 端点参考 -->
  <section class="mb-16">
    <h2 class="mb-8 text-center text-2xl font-bold tracking-tight">
      <span class="text-gradient">OpenAI 兼容 API</span>
    </h2>
    <div class="mx-auto max-w-[680px] overflow-hidden rounded-2xl border border-white/10">
      <div
        v-for="(ep, i) in endpoints"
        :key="ep.path"
        class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
        :class="{ 'border-t border-white/[0.06]': i > 0 }"
      >
        <!-- 方法标签 -->
        <span
          class="mt-px flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider"
          :class="ep.method === 'GET' ? 'bg-green-500/15 text-green-400' : 'bg-brand-500/15 text-brand-400'"
        >
          {{ ep.method }}
        </span>
        <!-- 路径 -->
        <code class="flex-1 font-mono text-xs text-zinc-300">{{ ep.path }}</code>
        <!-- 描述 -->
        <span class="hidden text-right text-xs text-zinc-500 sm:block sm:w-56">{{ ep.description }}</span>
      </div>
    </div>
  </section>
</template>