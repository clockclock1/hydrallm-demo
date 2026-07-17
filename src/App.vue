<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HeroSection from './components/HeroSection.vue'
import FeaturesGrid from './components/FeaturesGrid.vue'
import DemoFlow from './components/DemoFlow.vue'
import StackBadges from './components/StackBadges.vue'
import FooterSection from './components/FooterSection.vue'
import DocsPage from './pages/DocsPage.vue'

// 简单 hash 路由：/#/ → 首页，/#/docs → 文档页
const route = ref<'home' | 'docs'>('home')

function updateRoute() {
  const hash = location.hash || '#/'
  route.value = hash.includes('docs') ? 'docs' : 'home'
}

function navigate(r: 'home' | 'docs') {
  location.hash = r === 'home' ? '/' : '/docs'
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
  <div class="relative min-h-screen w-full text-zinc-200">
    <!-- 背景网格 -->
    <div class="pointer-events-none absolute inset-0 grid-bg opacity-40" />
    <!-- 顶部背景渐变光晕 -->
    <div class="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

    <div class="relative mx-auto flex w-full max-w-[1160px] flex-col px-6 pb-20 pt-6">
      <!-- 顶部导航栏 -->
      <nav class="mb-12 flex items-center justify-between">
        <a href="#/" class="flex items-center gap-2 text-sm font-semibold text-zinc-100 hover:text-brand-400 transition-colors">
          <span class="i-lucide-arrow-left h-4 w-4" v-if="route === 'docs'" />
          <span v-else class="text-gradient text-lg font-extrabold tracking-tight">HydraLLM</span>
        </a>
        <div class="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-0.5">
          <button
            @click="navigate('home')"
            :class="[
              'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200',
              route === 'home'
                ? 'bg-brand-500/20 text-brand-400'
                : 'text-zinc-400 hover:text-zinc-200'
            ]"
          >首页</button>
          <button
            @click="navigate('docs')"
            :class="[
              'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200',
              route === 'docs'
                ? 'bg-brand-500/20 text-brand-400'
                : 'text-zinc-400 hover:text-zinc-200'
            ]"
          >文档</button>
        </div>
      </nav>

      <!-- 页面内容 -->
      <main class="flex-1">
        <template v-if="route === 'home'">
          <HeroSection />
          <FeaturesGrid />
          <DemoFlow />
          <StackBadges />
        </template>
        <template v-else>
          <h1 class="mb-8 text-3xl font-extrabold tracking-tight">
            <span class="text-gradient">文档</span>
          </h1>
          <DocsPage />
        </template>
      </main>

      <FooterSection />
    </div>
  </div>
</template>