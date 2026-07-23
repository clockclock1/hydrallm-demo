<script setup lang="ts">
import { flow } from '../data/sections'

const statusConfig = {
  ok: { label: '✓ 正常', color: '#22c55e', bg: 'bg-green-500/10', dot: 'bg-green-400' },
  failover: { label: '⟳ 故障转移', color: '#f59e0b', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  cooldown: { label: '⏸ 熔断中', color: '#ef4444', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  streaming: { label: '→ SSE 流式', color: '#06b6d4', bg: 'bg-cyan-500/10', dot: 'bg-cyan-400' },
} as const

type Status = keyof typeof statusConfig
</script>

<template>
  <section class="mb-16">
    <h2 class="mb-2 text-center text-2xl font-bold tracking-tight">
      <span class="text-gradient">故障转移过程</span>
    </h2>
    <p class="mb-8 text-center text-sm text-zinc-500">
      模拟一次 /v1/chat/completions 请求在三个目标之间的完整切换流程
    </p>

    <!-- 流程图 -->
    <div class="card overflow-hidden p-6">
      <!-- 顶部：请求输入 -->
      <div class="mb-8 flex items-center justify-center gap-4">
        <div
          class="flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-xs font-mono text-brand-400"
        >
          <span class="i-lucide-terminal h-3.5 w-3.5" />
          POST /v1/chat/completions
        </div>
        <div class="flex items-center gap-1.5 text-xs text-zinc-500">
          <span class="i-lucide-arrow-right h-3.5 w-3.5" />
          Failover-Proxy
        </div>
        <div class="flex items-center gap-1.5 text-xs text-zinc-500">
          <span class="i-lucide-shuffle h-3.5 w-3.5" />
          自动路由
        </div>
      </div>

      <!-- 三个目标节点 -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          v-for="(step, i) in flow"
          :key="step.id"
          class="relative flex flex-col rounded-xl border p-4 transition-all duration-500"
          :class="statusConfig[step.status as Status].bg"
        >
          <!-- 序号 & 标签 -->
          <div class="mb-3 flex items-center gap-2">
            <div
              class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold"
              :style="{ borderColor: statusConfig[step.status as Status].color, color: statusConfig[step.status as Status].color }"
            >
              {{ i + 1 }}
            </div>
            <span class="text-xs font-semibold" :style="{ color: statusConfig[step.status as Status].color }">
              {{ step.label }}
            </span>
          </div>

          <!-- 目标信息 -->
          <p class="mb-2 font-mono text-xs text-zinc-300">{{ step.sub }}</p>

          <!-- 状态标签 -->
          <span
            class="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
            :style="{
              background: statusConfig[step.status as Status].bg,
              color: statusConfig[step.status as Status].color,
            }"
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="statusConfig[step.status as Status].dot"
            />
            {{ statusConfig[step.status as Status].label }}
          </span>

          <!-- 箭头（不显示在最后一个） -->
          <div
            v-if="i < flow.length - 1"
            class="pointer-events-none absolute -right-6 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center sm:left-full"
          >
            <div
              class="flex h-8 w-12 items-center justify-center text-lg"
              style="color: #f59e0b; transform: translateX(0.5rem) rotate(0deg);"
            >
              →
            </div>
          </div>
        </div>
      </div>

      <!-- 底部：成功响应 -->
      <div class="mt-8 flex items-center justify-center gap-3">
        <span class="text-xs text-zinc-500">最终响应：</span>
        <div
          class="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400"
        >
          <span class="i-lucide-check-circle-2 h-3.5 w-3.5" />
          200 OK · SSE Stream
        </div>
      </div>
    </div>
  </section>
</template>