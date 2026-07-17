<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HeroSection from './components/HeroSection.vue'
import FeaturesGrid from './components/FeaturesGrid.vue'
import DemoFlow from './components/DemoFlow.vue'
import StackBadges from './components/StackBadges.vue'
import FooterSection from './components/FooterSection.vue'
import DocsPage from './pages/DocsPage.vue'
import { defaultDocId } from './data/sections'

/**
 * 简单 hash 路由（无新依赖）：
 *   #/                → 首页
 *   #/docs            → 默认 #/docs/intro
 *   #/docs/<id>       → 指定 doc 页
 *
 * 路由对象区分 'home' 与 'docs'，docs 时附带当前 doc id。
 */
const route = ref<{ name: 'home' } | { name: 'docs'; id: string }>({ name: 'home' })

function updateRoute() {
  const hash = location.hash || '#/'
  const m = hash.match(/^#\/docs\/([\w-]+)/)
  if (m) {
    route.value = { name: 'docs', id: m[1] }
  } else if (hash.includes('docs')) {
    // #/docs 不带 id 时：fallback 到默认 doc，并把 hash 改写为 #/docs/<defaultDocId>
    route.value = { name: 'docs', id: defaultDocId }
    if (hash !== `#/docs/${defaultDocId}`) {
      location.replace(`#/docs/${defaultDocId}`)
    }
  } else {
    route.value = { name: 'home' }
  }
}

function navigateToHome() {
  location.hash = '/'
}

function navigateToDocs() {
  location.hash = `#/docs/${defaultDocId}`
}

onMounted(() => {
  updateRoute()
  window.addEventListener('hashchange', updateRoute)
})
onUnmounted(() => {
  window.removeEventListener('hashchange', updateRoute)
})
</script>

<template>
  <div
    class="relative min-h-screen w-full text-zinc-200"
    :class="route.name === 'docs' ? 'doc-page-bg' : ''"
  >
    <!-- 背景网格（首页可见，文档页用 .doc-page-bg 类禁用） -->
    <div class="pointer-events-none absolute inset-0 grid-bg opacity-40" />
    <!-- 顶部背景渐变光晕 -->
    <div class="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

    <div class="relative mx-auto flex w-full max-w-[1160px] flex-col px-6 pb-20 pt-6">
      <!-- 顶部导航栏（极简，无外边框） -->
      <nav class="mb-12 flex items-center justify-between">
        <a href="#/" class="flex items-center gap-2 text-sm font-semibold text-zinc-100 hover:text-brand-400 transition-colors">
          <span class="i-lucide-arrow-left h-4 w-4" v-if="route.name === 'docs'" />
          <span v-else class="text-gradient text-lg font-extrabold tracking-tight">HydraLLM</span>
        </a>
        <div class="flex items-center gap-6 text-sm">
          <button
            @click="navigateToHome"
            :class="[
              'relative py-1 transition-colors duration-200',
              route.name === 'home' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            ]"
          >
            首页
            <span
              v-if="route.name === 'home'"
              class="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-brand-400"
            />
          </button>
          <button
            @click="navigateToDocs"
            :class="[
              'relative py-1 transition-colors duration-200',
              route.name === 'docs' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            ]"
          >
            文档
            <span
              v-if="route.name === 'docs'"
              class="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-brand-400"
            />
          </button>
        </div>
      </nav>

      <!-- 页面内容 -->
      <main class="flex-1">
        <template v-if="route.name === 'home'">
          <HeroSection />
          <FeaturesGrid />
          <DemoFlow />
          <StackBadges />
        </template>
        <template v-else>
          <h1 class="sr-only">HydraLLM 文档</h1>
          <DocsPage :doc-id="route.id" />
        </template>
      </main>

      <FooterSection />
    </div>
  </div>
</template>
