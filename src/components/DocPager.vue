<script setup lang="ts">
/**
 * VitePress 风格的页脚翻页器（上一页 / 下一页）。
 *
 * 用法：
 *   <DocPager
 *     :prev="{ id: 'config', title: '配置说明', desc: 'config.json 的字段' }"
 *     :next="{ id: 'deploy', title: '部署到 Cloudflare', desc: 'Pages Git 集成' }"
 *   />
 *
 * 点击卡片会平滑滚动到对应章节锚点。
 */
import type { DocNavLink } from '../data/sections'

defineProps<{
  prev?: DocNavLink
  next?: DocNavLink
}>()

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <nav class="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
    <!-- 上一页 -->
    <button
      v-if="prev"
      @click="scrollTo(prev.id)"
      class="card group flex flex-col gap-1 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06]"
    >
      <span class="flex items-center gap-1.5 text-xs text-zinc-500">
        <span class="i-lucide-arrow-left h-3.5 w-3.5" />
        上一页
      </span>
      <span class="text-sm font-semibold text-zinc-100 group-hover:text-brand-400 transition-colors">{{ prev.title }}</span>
      <span class="text-xs leading-relaxed text-zinc-500">{{ prev.desc }}</span>
    </button>

    <!-- 占位，避免仅 next 时布局错乱 -->
    <div v-else class="hidden sm:block" />

    <!-- 下一页 -->
    <button
      v-if="next"
      @click="scrollTo(next.id)"
      class="card group flex flex-col gap-1 p-5 text-right transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] sm:col-start-2"
    >
      <span class="flex items-center justify-end gap-1.5 text-xs text-zinc-500">
        下一页
        <span class="i-lucide-arrow-right h-3.5 w-3.5" />
      </span>
      <span class="text-sm font-semibold text-zinc-100 group-hover:text-brand-400 transition-colors">{{ next.title }}</span>
      <span class="text-xs leading-relaxed text-zinc-500">{{ next.desc }}</span>
    </button>
  </nav>
</template>
