<script setup lang="ts">
import { features } from '../data/sections'

const icons: Record<string, string> = {
  'i-lucide-plug-zap': 'i-lucide-plug-zap',
  'i-lucide-shuffle': 'i-lucide-shuffle',
  'i-lucide-list-ordered': 'i-lucide-list-ordered',
  'i-lucide-shield-alert': 'i-lucide-shield-alert',
  'i-lucide-waves': 'i-lucide-waves',
  'i-lucide-activity': 'i-lucide-activity',
}
</script>

<template>
  <section class="mb-16">
    <h2 class="mb-8 text-center text-2xl font-bold tracking-tight">
      <span class="text-gradient">核心能力</span>
    </h2>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(f, i) in features"
        :key="f.title"
        class="card group relative flex flex-col gap-3 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
        :style="{ animationDelay: `${i * 80}ms` }"
      >
        <!-- 左上角彩色圆点 -->
        <div
          class="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-brand-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <!-- 图标 -->
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-brand-400 transition-all duration-300 group-hover:border-brand-500/30 group-hover:bg-brand-500/10"
        >
          <span :class="icons[f.icon] || f.icon" class="h-5 w-5" />
        </div>

        <!-- 标题 -->
        <h3 class="text-sm font-semibold text-zinc-100">{{ f.title }}</h3>

        <!-- 描述 -->
        <p class="text-xs leading-relaxed text-zinc-500">{{ f.description }}</p>
      </div>
    </div>
  </section>
</template>