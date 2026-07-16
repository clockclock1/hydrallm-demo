<script setup lang="ts">
import { site, stats } from '../data/sections'
</script>

<template>
  <header class="anim-float mb-16 flex flex-col items-center text-center">
    <!-- Logo + 项目名 -->
    <div class="mb-5 flex items-center gap-3">
      <div class="relative flex h-13 w-13 items-center justify-center rounded-2xl">
        <!-- 外发光 -->
        <div class="absolute inset-0 rounded-2xl bg-brand-500/30 blur-xl fade-pulse" />
        <!-- Logo 图标 -->
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="relative h-10 w-10"
          aria-hidden="true"
        >
          <!-- 六边形底座 -->
          <path
            d="M18 3L31.258 11V25L18 33 4.742 25V11L18 3Z"
            fill="url(#hex-grad)"
            stroke="url(#hex-stroke)"
            stroke-width="1.5"
          />
          <!-- H 字形 -->
          <path
            d="M12 11v14M12 18h12M24 11v14"
            stroke="#fff"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <defs>
            <linearGradient id="hex-grad" x1="18" y1="3" x2="18" y2="33" gradientUnits="userSpaceOnUse">
              <stop stop-color="#0a416c" />
              <stop offset="1" stop-color="#0a1525" />
            </linearGradient>
            <linearGradient id="hex-stroke" x1="4.74" y1="3" x2="31.26" y2="33" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3cb8ff" />
              <stop offset="1" stop-color="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="text-4xl font-extrabold tracking-tight">
        <span class="text-gradient">{{ site.name }}</span>
      </h1>
    </div>

    <!-- 标语 -->
    <p class="mb-3 text-lg font-semibold text-zinc-100">{{ site.tagline }}</p>

    <!-- 描述 -->
    <p class="mb-8 max-w-[640px] text-sm leading-relaxed text-zinc-400">
      {{ site.subtitle }}
    </p>

    <!-- CTA 按钮 -->
    <div class="mb-10 flex flex-wrap items-center justify-center gap-3">
      <a
        :href="site.upstream.repo"
        target="_blank"
        rel="noopener"
        class="btn-primary px-5 py-2.5 text-sm font-semibold"
      >
        <span class="i-lucide-github h-4 w-4" />
        源码
      </a>
      <a
        :href="site.upstream.issues"
        target="_blank"
        rel="noopener"
        class="btn-ghost px-5 py-2.5 text-sm"
      >
        <span class="i-lucide-message-square h-4 w-4" />
        反馈问题
      </a>
    </div>

    <!-- 统计数字 -->
    <div class="grid grid-cols-2 gap-x-12 gap-y-2 rounded-2xl border border-white/8 bg-white/[0.03] px-8 py-5 backdrop-blur sm:grid-cols-4">
      <div v-for="s in stats" :key="s.label" class="flex flex-col items-center">
        <span class="text-2xl font-extrabold text-brand-400" style="font-variant-numeric: tabular-nums;">{{ s.value }}</span>
        <span class="text-xs text-zinc-500">{{ s.label }}</span>
      </div>
    </div>
  </header>
</template>