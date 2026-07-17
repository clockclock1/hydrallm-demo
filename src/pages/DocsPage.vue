<script setup lang="ts">
import DocsLayout from '../components/DocsLayout.vue'
import { getDocComponent } from '../components/DocSectionRegistry'

defineProps<{
  /** 由 App.vue 根据 #/docs/<id> hash 传入当前章节 id */
  docId: string
}>()
</script>

<template>
  <DocsLayout :doc-id="docId">
    <component :is="getDocComponent(docId)" />
  </DocsLayout>
</template>