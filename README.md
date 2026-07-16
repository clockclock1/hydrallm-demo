# HydraLLM · Cloudflare Pages 示例站

> 接入多个大模型不该是一件头疼的事。

本仓库是 HydraLLM 项目的 Cloudflare Pages 示例站，包含两个部分：

| 页面 | 路径 | 说明 |
|---|---|---|
| **着陆页** | `/` | Vue 3 项目介绍页（特性、技术栈、故障转移流程） |
| **交互演示** | `/ui/` | 真正的 HydraLLM 管理界面（React UI + fetch 拦截器 Mock API） |

> 🧪 交互演示页通过 fetch 拦截器（内嵌在 `index.html`）拦截所有 `/api/*` 请求，返回模拟数据，无需后端即可体验完整功能。

**上游项目**：[clockclock1/HydraLLM](https://github.com/clockclock1/HydraLLM)

---

## 🔄 自动同步机制

本仓库的 `ui/` 目录会自动与上游 HydraLLM 项目保持同步：

- GitHub Actions **每 30 分钟**检查上游 HydraLLM 是否有新提交
- 如果 `ui/src/` 有更新，自动 commit 到 `main` 分支
- `main` 分支更新后，Cloudflare Pages 的 Git 集成自动触发构建部署

> 同步 workflow 在 `.github/workflows/sync-upstream.yml`，也可在仓库 Actions 页手动触发。

---

## 🚀 部署到 Cloudflare Pages（Git 集成）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages** → **Create a project** → **Connect to Git**
2. 选择此仓库
3. 配置构建：

   | 字段 | 值 |
   |---|---|
   | **Project name** | `hydrallm-demo` |
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
hydrallm-demo/
├── .github/workflows/
│   └── sync-upstream.yml         # 每 30min 同步上游 HydraLLM ui/src
├── src/                          # Vue 3 着陆页源码
│   ├── components/
│   └── data/sections.ts
├── ui/                           # HydraLLM React UI（自动同步上游）
│   ├── src/                      # 同步自上游 HydraLLM/ui/src
│   ├── public/favicon.svg
│   ├── index.html                # 含 fetch 拦截器 Mock API + 演示横幅
│   ├── package.json
│   └── vite.config.ts            # base: '/ui/'
├── public/favicon.svg
├── vite.config.ts
├── uno.config.ts
└── package.json
```

---

## ⚡ 技术栈

| 类别 | 着陆页 | 交互演示 |
|---|---|---|
| 框架 | Vue 3 + TypeScript | React 19 + TypeScript |
| 构建 | Vite 6 | Vite 7 (singlefile) |
| 样式 | UnoCSS + Lucide Icons | Tailwind CSS v4 |
| Mock API | — | fetch 拦截器（同源 /api/*） |

---

## 📝 许可证

Apache-2.0 · Copyright © clockclock1