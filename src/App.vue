<script setup lang="ts">
import HeroSection from './components/HeroSection.vue'
import FeaturesGrid from './components/FeaturesGrid.vue'
import DemoFlow from './components/DemoFlow.vue'
import StackBadges from './components/StackBadges.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <div class="relative min-h-screen w-full text-zinc-200">
    <!-- 背景网格 -->
    <div class="pointer-events-none absolute inset-0 grid-bg opacity-40" />

    <!-- 顶部背景渐变光晕 -->
    <div
      class="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
    />

    <main class="relative mx-auto flex w-full max-w-[1160px] flex-col px-6 pb-20 pt-12">
      <HeroSection />
      <FeaturesGrid />
      <DemoFlow />
      <StackBadges />
      <FooterSection />
    </main>
  </div>
</template>
