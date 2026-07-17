<script setup lang="ts">
/**
 * VitePress 风格代码块组件。
 *
 * 渲染结构匹配 VitePress 的代码块与 code-group：
 *   <div class="language-bash ext-bash">       <- 单语言时直接渲染
 *     <span class="lang">BASH</span>
 *     <button class="copy">...</button>
 *     <pre><code>code</code></pre>
 *   </div>
 *
 * 多语言时用 `.vp-code-group` 包裹：
 *   <div class="vp-code-group">
 *     <div class="tabs">
 *       <button class="tab">pnpm</button>
 *       ...
 *     </div>
 *     <div class="language-pnpm">...</div>
 *   </div>
 *
 * 复制按钮沿用 VitePress 规范：40×40，bg-soft，hover 显示，淡入淡出
 *
 * 多语言时按 tabs 顺序在 slot 内用 `===` 占位分隔：
 *   <CodeBlock :tabs="['pnpm','npm']" lang="bash">
 *     pnpm install
 *     ===
 *     npm install
 *   </CodeBlock>
 */
import { ref, computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 单语言时的语言标识 */
    lang?: string
    /** 多语言开关：传入字符串数组即启用 tab 切换 */
    tabs?: string[]
  }>(),
  { lang: 'bash' },
)

const slots = useSlots()

const slotText = computed(() => {
  const nodes = slots.default?.() ?? []
  return nodes
    .map((n) => (typeof n.children === 'string' ? n.children : ''))
    .join('')
})

// 多语言分块（按 "===" 占位）
const blocks = computed<string[]>(() => {
  if (!props.tabs || props.tabs.length === 0) return [slotText.value]
  const parts = slotText.value
    .split(/^===\s*$/m)
    .map((s) => s.replace(/^\n/, '').replace(/\s+$/, ''))
  return props.tabs.map((_, i) => parts[i] ?? parts[parts.length - 1] ?? '')
})

const activeTab = ref(0)
function selectTab(i: number) {
  activeTab.value = i
}

const activeCode = computed(() => blocks.value[activeTab.value] ?? '')
const activeLang = computed(() =>
  props.tabs && props.tabs.length ? props.tabs[activeTab.value] : props.lang,
)

// 一键复制
const copied = ref(false)
async function copyCode() {
  try {
    await navigator.clipboard.writeText(activeCode.value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = activeCode.value
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch {
      /* ignore */
    }
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <!-- 多语言：code-group -->
  <div v-if="tabs && tabs.length" class="vp-code-group">
    <!-- 顶栏 tabs -->
    <div class="tabs flex items-center">
      <button
        v-for="(t, i) in tabs"
        :key="t"
        class="tab"
        :class="{ active: activeTab === i }"
        @click="selectTab(i)"
      >
        {{ t }}
      </button>
    </div>
    <!-- 代码主体 -->
    <div class="language-block" :class="`language-${activeLang}`">
      <span class="lang">{{ activeLang }}</span>
      <button class="copy" @click="copyCode" :title="copied ? '已复制' : '复制'">
        <span v-if="copied" class="i-lucide-check h-4 w-4 text-green-400" />
        <span v-else class="i-lucide-copy h-4 w-4" />
      </button>
      <pre><code>{{ activeCode }}</code></pre>
    </div>
  </div>

  <!-- 单语言 -->
  <div v-else class="language-block" :class="`language-${lang}`">
    <span class="lang">{{ lang }}</span>
    <button class="copy" @click="copyCode" :title="copied ? '已复制' : '复制'">
      <span v-if="copied" class="i-lucide-check h-4 w-4 text-green-400" />
      <span v-else class="i-lucide-copy h-4 w-4" />
    </button>
    <pre><code>{{ slotText }}</code></pre>
  </div>
</template>
