<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { docGroups, docSections, docMeta, getDocNeighbors, type DocSection } from '../data/sections'
import DocPager from './DocPager.vue'

const props = defineProps<{
  /** 当前页 doc id */
  docId: string
}>()

// 按分组把 docSections 分桶
const grouped = computed(() =>
  docGroups.map((g) => ({
    ...g,
    items: docSections.filter((s) => s.group === g.key),
  })),
)

// prev / next
const neighbors = computed(() => getDocNeighbors(props.docId))

function navigate(id: string) {
  if (id === props.docId) {
    // 同页点击：滚到顶
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  location.hash = `#/docs/${id}`
}

// 右侧 outline 收集本页内 h2/h3 锚点
interface OutlineItem {
  id: string
  text: string
  level: 2 | 3
}
const outline = ref<OutlineItem[]>([])
const activeOutlineId = ref<string>('')

function collectOutline() {
  // 抓取中间内容区内的 h2/h3
  const root = document.querySelector('.vp-doc-content') as HTMLElement | null
  if (!root) {
    outline.value = []
    return
  }
  const heads = Array.from(root.querySelectorAll<HTMLElement>('h2[id], h3[id]'))
  outline.value = heads.map((h) => {
    // 标题文本去掉末尾的锚点符号（#）
    const text = (h.textContent || '').replace(/#$/, '').trim()
    const level = (h.tagName.toLowerCase() === 'h3' ? 3 : 2) as 2 | 3
    return { id: h.id, text, level }
  })
  if (outline.value.length && !activeOutlineId.value) {
    activeOutlineId.value = outline.value[0].id
  }
}

let observer: IntersectionObserver | null = null
function setupObserver() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeOutlineId.value = entry.target.id
        }
      })
    },
    { rootMargin: '-20% 0px -70% 0px' },
  )
  outline.value.forEach((o) => {
    const el = document.getElementById(o.id)
    if (el) observer?.observe(el)
  })
}

function scrollOutlineTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 每次 docId 变化 → 滚回顶部、重新采集 outline
watch(
  () => props.docId,
  async (id) => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    activeOutlineId.value = ''
    await nextTick()
    collectOutline()
    setupObserver()
  },
  { immediate: false },
)

onMounted(async () => {
  await nextTick()
  collectOutline()
  setupObserver()
})

onUnmounted(() => {
  observer?.disconnect()
})

// 顶部 meta：编辑链接按当前页面解读
const editLink = computed(() => {
  const matched = docSections.find((s) => s.id === props.docId) as DocSection | undefined
  const name = matched
    ? matched.id.charAt(0).toUpperCase() + matched.id.slice(1)
    : 'DocsPage'
  return `${docMeta.editLink}${name}.vue`
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)_192px] gap-8">

    <!-- 左侧 sidebar（按分组渲染章节项） -->
    <aside class="hidden lg:block">
      <nav class="sticky top-6 flex flex-col gap-6">
        <div v-for="g in grouped" :key="g.key">
          <!-- 分组标题 -->
          <p class="mb-2 text-[14px] font-bold text-[var(--vp-c-text-1)]">{{ g.label }}</p>
          <!-- 分组下的页面项 -->
          <ul class="flex flex-col gap-0.5">
            <li v-for="s in g.items" :key="s.id">
              <button
                @click="navigate(s.id)"
                :class="[
                  'flex w-full items-center gap-2 py-1.5 text-left text-[14px] font-medium transition-colors duration-150',
                  docId === s.id
                    ? 'text-[var(--vp-c-brand-1)]'
                    : 'text-[var(--vp-c-text-2)] hover:text-[var(--vp-c-text-1)]',
                ]"
              >
                <span :class="s.icon" class="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                {{ s.label }}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <!-- 中间内容区 -->
    <article class="vp-doc min-w-0">
      <div class="vp-doc-content">
        <!-- 顶部 meta -->
        <div class="edit-info !flex !justify-between !items-center !pb-4 !mb-0">
          <a
            :href="editLink"
            target="_blank"
            rel="noopener"
            class="!text-[14px] !text-[var(--vp-c-text-2)] hover:!text-[var(--vp-c-brand-1)] !no-underline"
          >
            <span class="i-lucide-square-pen h-3.5 w-3.5 inline-block mr-1 align-middle" />
            在 GitHub 上编辑此页面
          </a>
          <p class="!text-[14px] !m-0 !text-[var(--vp-c-text-2)]">
            最后更新于：{{ docMeta.lastUpdated }}
          </p>
        </div>

        <!-- 章节内容（由 DocsPage 通过 default slot 注入） -->
        <slot />

        <!-- footer pager -->
        <footer class="vp-doc-footer">
          <div class="edit-info !flex !justify-between !items-center !pb-4 !border-b-0">
            <a
              :href="editLink"
              target="_blank"
              rel="noopener"
              class="!text-[14px] !text-[var(--vp-c-text-2)] hover:!text-[var(--vp-c-brand-1)] !no-underline"
            >
              <span class="i-lucide-square-pen h-3.5 w-3.5 inline-block mr-1 align-middle" />
              在 GitHub 上编辑此页面
            </a>
            <p class="!text-[14px] !m-0 !text-[var(--vp-c-text-2)]">
              最后更新于：{{ docMeta.lastUpdated }}
            </p>
          </div>
          <DocPager :prev="neighbors.prev" :next="neighbors.next" />
        </footer>
      </div>
    </article>

    <!-- 右侧 outline（本页 h2/h3） -->
    <aside class="hidden lg:block">
      <div class="vp-outline">
        <p class="outline-title">页面导航</p>
        <ul v-if="outline.length">
          <li v-for="o in outline" :key="o.id">
            <a
              class="outline-link"
              :class="{
                active: activeOutlineId === o.id,
                nested: o.level === 3,
              }"
              :title="o.text"
              @click="scrollOutlineTo(o.id)"
            >
              {{ o.text }}
            </a>
          </li>
        </ul>
        <p v-else class="!text-[14px] !text-[var(--vp-c-text-3)]">本页尚无小节</p>
      </div>
    </aside>
  </div>
</template>
