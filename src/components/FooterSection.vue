<script setup lang="ts">
import { site } from '../data/sections'
</script>

<template>
  <footer class="mt-4 border-t border-white/6 pt-8 text-center">
    <!-- 快速链接 -->
    <div class="mb-8 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
      <a
        :href="site.upstream.repo"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-1.5 transition-colors hover:text-zinc-300"
      >
        <span class="i-lucide-github h-3.5 w-3.5" />
        GitHub
      </a>
      <a
        :href="site.upstream.demoRepo"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-1.5 transition-colors hover:text-zinc-300"
      >
        <span class="i-lucide-cloud h-3.5 w-3.5" />
        部署示例
      </a>
      <a
        :href="site.upstream.issues"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-1.5 transition-colors hover:text-zinc-300"
      >
        <span class="i-lucide-bug h-3.5 w-3.5" />
        问题反馈
      </a>
      <span class="flex items-center gap-1.5">
        <span class="i-lucide-scale h-3.5 w-3.5" />
        {{ site.upstream.license }}
      </span>
    </div>

    <!-- 版权 -->
    <p class="text-xs text-zinc-600">
      本示例站基于
      <a
        :href="site.upstream.repo"
        target="_blank"
        rel="noopener"
        class="underline-offset-2 transition-colors hover:underline"
      >HydraLLM</a>
      构建，托管于
      <a
        href="https://pages.cloudflare.com/"
        target="_blank"
        rel="noopener"
        class="underline-offset-2 transition-colors hover:underline"
      >Cloudflare Pages</a>。
      &copy; {{ new Date().getFullYear() }}
    </p>
  </footer>
</template>