<script setup lang="ts">
/**
 * VitePress 风格代码块组件。
 *
 * 特性：
 *   - 顶栏可选多个语言标签（bash / powershell / pnpm 等），点击切换
 *   - 顶栏右侧"一键复制"按钮，复制成功后短暂显示 ✓
 *   - 可选 filename 在标题栏左侧显示，搭配语言标识
 *   - 自动 escape HTML，文案从 default slot 取（保留换行）
 *
 * 用法（单语言）：
 *   <CodeBlock lang="bash">git clone ...</CodeBlock>
 *
 * 用法（多语言）：
 *   <CodeBlock :tabs="['pnpm','npm','yarn']" lang="bash">
 *     pnpm install
 *     npm install
 *     yarn install
 *   </CodeBlock>
 *
 * 多语言时按 tabs 顺序在 slot 内用 === 切兰占位分隔，例如：
 *   <CodeBlock :tabs="['pnpm','npm']" lang="bash">
 *     pnpm install
 *     ===
 *     npm install
 *   </CodeBlock>
 */
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 单语言时使用，多语言时仅作为语言徽章文案 */
    lang?: string
    /** 多语言开关：传入字符串数组即启用 tab 切换 */
    tabs?: string[]
    /** 标题栏左侧显示的文件名（可空） */
    filename?: string
  }>(),
  { lang: 'bash' },
)

const rawSlot = computed(() => {
  // useDefaultSlots() 默认渲染为字符串；这里通过 render 取纯文本
  return null
})

// 在 setup 顶层无法直接拿到 slot 文本，借助 render 函数渲染为字符串
import { useSlots } from 'vue'
const slots = useSlots()
const slotText = computed(() => {
  const nodes = slots.default?.() ?? []
  // 对字符串 vnode / 文本 vnode 拼接
  return nodes
    .map((n) => (typeof n.children === 'string' ? n.children : ''))
    .join('')
})

// 多语言分块（按 "===" 占位）
const blocks = computed<string[]>(() => {
  if (!props.tabs || props.tabs.length === 0) return [slotText.value]
  const parts = slotText.value.split(/^===\s*$/m).map((s) => s.replace(/^\n/, '').replace(/\s+$/, ''))
  // 如果分隔不够，循环复用最后一段
  return props.tabs.map((_, i) => parts[i] ?? parts[parts.length - 1] ?? '')
})

const activeTab = ref(0)
function selectTab(i: number) {
  activeTab.value = i
}

const activeCode = computed(() => blocks.value[activeTab.value] ?? '')

// 一键复制
const copied = ref(false)
async function copyCode() {
  try {
    await navigator.clipboard.writeText(activeCode.value)
  } catch {
    // 降级方案：构造临时 textarea 触发 execCommand
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

const langBadgeMap: Record<string, string> = {
  bash: 'bg-green-500/15 text-green-400',
  sh: 'bg-green-500/15 text-green-400',
  shell: 'bg-green-500/15 text-green-400',
  powershell: 'bg-blue-500/15 text-blue-400',
  pwsh: 'bg-blue-500/15 text-blue-400',
  pnpm: 'bg-fuchsia-500/15 text-fuchsia-400',
  npm: 'bg-red-500/15 text-red-400',
  yarn: 'bg-sky-500/15 text-sky-400',
  json: 'bg-amber-500/15 text-amber-400',
  ts: 'bg-blue-500/15 text-blue-400',
  js: 'bg-yellow-500/15 text-yellow-400',
  toml: 'bg-orange-500/15 text-orange-400',
  yaml: 'bg-emerald-500/15 text-emerald-400',
  yml: 'bg-emerald-500/15 text-emerald-400',
}

const badgeClass = (lang: string) =>
  langBadgeMap[lang.toLowerCase()] ?? 'bg-zinc-500/15 text-zinc-300'
</script>

<template>
  <div class="my-4 overflow-hidden rounded-xl border border-white/8 bg-black/40">
    <!-- 顶栏：标签行 -->
    <div class="flex items-center justify-between border-b border-white/8 bg-white/[0.03] px-3 py-1.5">
      <!-- 左侧：tabs 或 filename -->
      <div class="flex items-center gap-1 overflow-x-auto">
        <template v-if="tabs && tabs.length">
          <button
            v-for="(t, i) in tabs"
            :key="t"
            @click="selectTab(i)"
            :class="[
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150',
              activeTab === i
                ? 'bg-white/10 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5',
            ]"
          >
            {{ t }}
          </button>
        </template>
        <span v-else-if="filename" class="font-mono text-xs text-zinc-500">{{ filename }}</span>
      </div>

      <!-- 右侧：语言徽章 + 复制按钮 -->
      <div class="flex items-center gap-2">
        <span
          v-if="lang"
          class="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
          :class="badgeClass(tabs && tabs.length ? tabs[activeTab] : lang)"
        >
          {{ tabs && tabs.length ? tabs[activeTab] : lang }}
        </span>
        <button
          @click="copyCode"
          class="group flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          :title="copied ? '已复制' : '复制到剪贴板'"
        >
          <span v-if="copied" class="i-lucide-check h-3.5 w-3.5 text-green-400" />
          <span v-else class="i-lucide-copy h-3.5 w-3.5" />
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
    </div>

    <!-- 代码主体 -->
    <pre class="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-300"><code>{{ activeCode }}</code></pre>
  </div>
</template>
