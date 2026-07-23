# Failover-Proxy · Cloudflare Pages 示例站

> 接入多个大模型不该是一件头疼的事。

本仓库是 Failover-Proxy 项目的 Cloudflare Pages 示例站，包含两个部分：

| 页面 | 路径 | 说明 |
|---|---|---|
| **着陆页** | `/` | Vue 3 项目介绍页（含 8 个管理页面导航卡片） |
| **交互演示** | `/ui/dashboard` | Failover-Proxy 管理界面（React UI + fetch 拦截器 Mock API），共 8 个管理页面 |

> 🧪 交互演示页通过 fetch 拦截器（内嵌在 `index.html`）拦截所有 `/api/*` 请求，返回模拟数据，无需后端即可体验完整功能。
>
> 上游 Failover-Proxy UI 使用**浏览器路由**（`history.pushState`），所有页面路由均带 `/ui/` 前缀（如 `/ui/dashboard`、`/ui/providers`），由 Cloudflare Pages 的 `_redirects` 通配规则统一 rewrite 到 `/ui/index.html`，由 React 客户端路由接管。

**上游项目**：[clockclock1/Failover-Proxy](https://github.com/clockclock1/Failover-Proxy)

---

## 🔄 自动同步机制

本仓库的 `ui/` 目录会自动与上游 Failover-Proxy 项目保持同步：

- GitHub Actions **每小时整点**（UTC）检查上游 Failover-Proxy 是否有新提交
- 如果 `ui/src/` 有更新，自动 commit 到 `main` 分支
- `main` 分支更新后，Cloudflare Pages 的 Git 集成自动触发构建部署

> 同步 workflow 在 `.github/workflows/sync-upstream.yml`，也可在仓库 Actions 页手动触发，或通过 `repository_dispatch` webhook 触发。

### 路由适配补丁（同步后自动应用）

上游 Failover-Proxy 的 `pagePaths` 默认使用根路径 `/dashboard`、`/providers` 等。本仓库部署在 Cloudflare Pages 的 `/ui/` 子目录下，根路径会回落到 Vue 着陆页。同步 workflow 在拉取上游 `ui/src/` 后会自动运行一个 `sed` 补丁，把 `pagePaths` 全部改写为 `/ui/dashboard`、`/ui/providers` 等（带 `/ui/` 前缀），再提交。这样：

- React UI 的 URL 永远是 `/ui/xxx` 形式，符合子目录部署语义
- `public/_redirects` 只需一条 `/ui/* → /ui/index.html 200` 通配规则
- 上游每次更新都会自动重新应用此补丁，无需人工干预

---

## 🚀 部署到 Cloudflare Pages（Git 集成）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages** → **Create a project** → **Connect to Git**
2. 选择此仓库
3. 配置构建：

   | 字段 | 值 |
   |---|---|
   | **Project name** | `failover-proxy-demo` |
   | **Build command** | `npm install && npm run build` |
   | **Build output directory** | `dist` |

4. 点击 **Save and Deploy**
5. 之后每次 `main` 分支更新，Cloudflare Pages 都会自动重新构建部署

> 无需配置 GitHub Actions Secrets、无需 wrangler、无需 API Token。

---

## 🛠️ 本地开发

```bash
# Vue 着陆页
npm install && npm run dev

# React UI（需要单独安装依赖）
cd ui && npm install && npm run dev

# 完整构建（Vue + React UI 一起）
npm run build
```

> **Node.js >= 18** 即可。

---

## 📁 项目结构

```
failover-proxy-demo/
├── .github/workflows/
│   └── sync-upstream.yml         # 每小时整点（UTC）同步上游 Failover-Proxy ui/src
├── src/                          # Vue 3 着陆页源码
│   ├── components/
│   │   ├── DocsLayout.vue        # 文档页三栏布局（侧边栏 + 内容 + 导航）
│   │   ├── DashboardPages.vue    # 8 个管理页面导航卡片（新增）
│   │   └── ...
│   ├── pages/docs/               # 文档站 9 个章节组件
│   └── data/sections.ts          # 站点文案 + 文档导航元数据
├── ui/                           # Failover-Proxy React UI（自动同步上游）
│   ├── src/
│   │   ├── App.tsx               # 应用入口 + 浏览器路由（history.pushState）
│   │   ├── components/            # 12 个 UI 组件
│   │   ├── pages/                # 8 个独立路由页面（DashboardPage 等）
│   │   │   └── index.tsx         # pagePaths 定义（带 /ui/ 前缀的 URL 路由）
│   │   ├── hooks/                # usePageNavigation（封装路由 + dispatch）
│   │   └── store.tsx             # 状态管理（含 hasUnsavedChanges）
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html                # 含 fetch 拦截器 Mock API + 演示横幅
│   ├── package.json
│   └── vite.config.ts            # base: '/ui/', singlefile 构建
├── public/
│   └── _redirects                # Cloudflare Pages SPA fallback：/ui/* → /ui/index.html (200)
├── index.html
├── vite.config.ts
├── uno.config.ts
├── wrangler.toml
└── package.json
```

---

## ⚡ 技术栈

| 类别 | 着陆页 | 交互演示 |
|---|---|---|
| 框架 | Vue 3 + TypeScript | React 19 + TypeScript |
| 构建 | Vite 6 | Vite 7 (singlefile) |
| 样式 | UnoCSS + Lucide Icons | Tailwind CSS v4 |
| 路由 | —（hash 路由） | 浏览器路由（history.pushState） |
| Mock API | — | fetch 拦截器（同源 /api/*） |

---

## 📝 许可证

Apache-2.0 · Copyright © clockclock1