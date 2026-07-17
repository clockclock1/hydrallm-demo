<script setup lang="ts">
/**
 * VitePress 风格自定义容器。
 *
 * 渲染结构匹配 VitePress 的 `.custom-block.custom-block-<type>`：
 *   <div class="custom-block tip">       <- type 决定背景与语义色
 *     <p class="custom-block-title">提示</p>
 *     <slot/>
 *   </div>
 *
 * VitePress 规范共性：
 *   - 边框：1px solid transparent（透明，不用 left-border-4）
 *   - 圆角：8px
 *   - 内边距：16px 16px 8px
 *   - 字号：14px，line-height 24px
 *   - 标题字色 + 链接色 + inline code 色由对应语义色 -1 提供
 *   - 背景由对应语义色 soft (rgba .16) 提供
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
  /** 默认标题文案 */
  defaultTitle: string
}

const variants: Record<ContainerType, Variant> = {
  tip: { defaultTitle: '提示' },
  info: { defaultTitle: '信息' },
  warning: { defaultTitle: '注意' },
  danger: { defaultTitle: '危险' },
}

const variant = variants[props.type]
const resolvedTitle = props.title ?? variant.defaultTitle
</script>

<template>
  <div class="custom-block" :class="type">
    <p class="custom-block-title">{{ resolvedTitle }}</p>
    <slot />
  </div>
</template>
