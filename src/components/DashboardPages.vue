<script setup lang="ts">
/**
 * 管理 UI 页面卡片 —— 展示上游 HydraLLM React UI 的 8 个管理页面。
 * 列表与 ui/src/components/Sidebar.tsx 的 navItems 一一对应，
 * 点击直接跳转到 /ui/<pageId>。
 */
import { dashboardPages, site } from '../data/sections'
</script>

<template>
  <section class="mb-16">
    <h2 class="mb-2 text-center text-2xl font-bold tracking-tight">
      <span class="text-gradient">可视化管理界面</span>
    </h2>
    <p class="mb-8 text-center text-sm text-zinc-500">
      自带 8 个管理页面，覆盖配置、健康检查、实时观测与回溯
    </p>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <a
        v-for="(p, i) in dashboardPages"
        :key="p.id"
        :href="`${site.demoUrl.replace(/\/dashboard$/, '')}/${p.id}`"
        target="_blank"
        rel="noopener"
        class="card group relative flex flex-col gap-2 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <!-- 图标 -->
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-brand-400 transition-all duration-300 group-hover:border-brand-500/30 group-hover:bg-brand-500/10"
        >
          <span :class="p.icon" class="h-4 w-4" />
        </div>

        <!-- 标题 -->
        <h3 class="text-sm font-semibold text-zinc-100">{{ p.label }}</h3>

        <!-- 描述 -->
        <p class="text-xs leading-relaxed text-zinc-500">{{ p.description }}</p>

        <!-- 右上角箭头 -->
        <span
          class="absolute right-3 top-3 text-zinc-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <span class="i-lucide-arrow-up-right h-3.5 w-3.5" />
        </span>
      </a>
    </div>
  </section>
</template>
