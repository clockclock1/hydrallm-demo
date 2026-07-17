<script setup lang="ts">
/**
 * VitePress 风格页脚翻页器（.prev-next / .pager-link）。
 *
 * 跨页跳转用 location.hash = '#/docs/<id>'，由 App.vue hash 路由监听并切换页面。
 */
import type { DocNavLink } from '../data/sections'

defineProps<{
  prev?: DocNavLink
  next?: DocNavLink
}>()

function navigate(id: string) {
  location.hash = `#/docs/${id}`
}
</script>

<template>
  <nav class="prev-next">
    <div class="pager">
      <button v-if="prev" class="pager-link" @click="navigate(prev.id)">
        <span class="desc">上一页</span>
        <span class="title">{{ prev.title }}</span>
      </button>
    </div>
    <div class="pager">
      <button v-if="next" class="pager-link next" @click="navigate(next.id)">
        <span class="desc">下一页</span>
        <span class="title">{{ next.title }}</span>
      </button>
    </div>
  </nav>
</template>
