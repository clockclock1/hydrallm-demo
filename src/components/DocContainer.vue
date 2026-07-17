<script setup lang="ts">
/**
 * VitePress 风格自定义容器。
 *
 * 用法：
 *   <DocContainer type="tip" title="提示标题">...插槽内容...</DocContainer>
 *
 * 支持四种类型，分别对应不同的左边框与图标色彩：
 *   - tip     绿色，默认标题"提示"，💡 图标
 *   - info    蓝色，默认标题"信息"，ℹ 图标
 *   - warning 橙色，默认标题"注意"，⚠ 图标
 *   - danger  红色，默认标题"危险"，⛔ 图标
 */
type ContainerType = 'tip' | 'info' | 'warning' | 'danger'

const props = withDefaults(
  defineProps<{
    type?: ContainerType
    /** 默认按 type 自动填，显式传入会覆盖 */
    title?: string
  }>(),
  { type: 'tip' },
)

interface Variant {
  defaultTitle: string
  icon: string
  /** 左边框 + 图标 + 标题颜色 */
  accentClass: string
  /** 容器背景 */
  bgClass: string
}

const variants: Record<ContainerType, Variant> = {
  tip: {
    defaultTitle: '提示',
    icon: 'i-lucide-lightbulb',
    accentClass: 'text-green-400',
    bgClass: 'border-l-green-500/60 bg-green-500/[0.04]',
  },
  info: {
    defaultTitle: '信息',
    icon: 'i-lucide-info',
    accentClass: 'text-brand-300',
    bgClass: 'border-l-brand-500/60 bg-brand-500/[0.04]',
  },
  warning: {
    defaultTitle: '注意',
    icon: 'i-lucide-alert-triangle',
    accentClass: 'text-amber-400',
    bgClass: 'border-l-amber-500/60 bg-amber-500/[0.04]',
  },
  danger: {
    defaultTitle: '危险',
    icon: 'i-lucide-octagon-alert',
    accentClass: 'text-red-400',
    bgClass: 'border-l-red-500/60 bg-red-500/[0.04]',
  },
}

const variant = variants[props.type]
const resolvedTitle = props.title ?? variant.defaultTitle
</script>

<template>
  <div
    class="my-4 rounded-r-lg border border-white/8 border-l-4 p-4"
    :class="variant.bgClass"
  >
    <p class="mb-1.5 flex items-center gap-2 text-sm font-semibold" :class="variant.accentClass">
      <span :class="variant.icon" class="h-4 w-4 flex-shrink-0" />
      {{ resolvedTitle }}
    </p>
    <div class="text-xs leading-relaxed text-zinc-300">
      <slot />
    </div>
  </div>
</template>
