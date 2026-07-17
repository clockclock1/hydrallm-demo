<script setup lang="ts">
/**
 * VitePress 风格页脚翻页器（.prev-next / .pager-link）。
 *
 * 渲染结构：
 *   <nav class="prev-next">
 *     <div class="pager">
 *       <a class="pager-link"> ← prev </a>
 *     </div>
 *     <div class="pager">
 *       <a class="pager-link next"> next → </a>
 *     </div>
 *   </nav>
 *
 * 单方向整块卡片，`display:block; border; radius 8; padding 11/16/13`
 * prev 左对齐，next 右对齐 翻转文字
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
  <nav class="prev-next">
    <div class="pager">
      <button v-if="prev" class="pager-link" @click="scrollTo(prev.id)">
        <span class="desc">上一页</span>
        <span class="title">{{ prev.title }}</span>
      </button>
    </div>
    <div class="pager">
      <button v-if="next" class="pager-link next" @click="scrollTo(next.id)">
        <span class="desc">下一页</span>
        <span class="title">{{ next.title }}</span>
      </button>
    </div>
  </nav>
</template>
