/**
 * 章节组件注册表 —— 把 doc id 映射到对应的 Vue 单文件组件。
 *
 * DocsLayout 通过此映射查到当前 page 的组件，并用 <component :is> 动态渲染。
 * 新增章节只需在 docSections 增条目、加章节组件文件、在本表注册即可。
 */
import type { Component } from 'vue'
import Intro from '../pages/docs/Intro.vue'
import Features from '../pages/docs/Features.vue'
import QuickStart from '../pages/docs/QuickStart.vue'
import Config from '../pages/docs/Config.vue'
import Api from '../pages/docs/Api.vue'
import Failover from '../pages/docs/Failover.vue'
import Deploy from '../pages/docs/Deploy.vue'
import Sync from '../pages/docs/Sync.vue'
import Troubleshoot from '../pages/docs/Troubleshoot.vue'

export const docSectionRegistry: Record<string, Component> = {
  intro: Intro,
  features: Features,
  quickstart: QuickStart,
  config: Config,
  api: Api,
  failover: Failover,
  deploy: Deploy,
  sync: Sync,
  troubleshoot: Troubleshoot,
}

/** 根据 doc id 返回对应章节组件，找不到时回退到 Intro */
export function getDocComponent(id: string): Component {
  return docSectionRegistry[id] ?? Intro
}
