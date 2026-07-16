# HydraLLM · Cloudflare Pages 示例站

> 接入多个大模型不该是一件头疼的事。

本仓库是 HydraLLM 项目的 Cloudflare Pages 示例站，包含两个部分：

| 页面 | 路径 | 说明 |
|---|---|---|
| **着陆页** | `/` | Vue 3 项目介绍页（特性、技术栈、故障转移流程） |
| **交互演示** | `/ui/` | 真正的 HydraLLM 管理界面（React UI + Service Worker Mock API） |

> 🧪 交互演示页通过 Service Worker 拦截所有 `/api/*` 请求并返回模拟数据，界面操作完全真实，无需后端服务即可体验完整的配置、测试、统计、故障转移等功能。

**上游项目**：[clockclock1/HydraLLM](https://github.com/clockclock1/HydraLLM)

---

## 🚀 快速部署到 Cloudflare Pages

### 前提条件

在 [Cloudflare Dashboard](https://dash.cloudflare.com/) 获取：

1. **Account ID**：在任意域名概览页右上角可看到
2. **API Token**：
   - 进入 **My Profile** → **API Tokens**
   - 点击 **Create Token** → 选择 **Edit Cloudflare Workers** 模板
   - Account Resources 设置为「Include」你的账户
   - 点击 **Create Token**

### 配置 GitHub Secrets

在 GitHub 仓库 `Settings → Secrets and variables → Actions` 中添加：

| Secret 名称 | 值 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 上面创建的 API Token |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare Account ID |

完成后，每次推送到 `main` 分支都会自动触发构建并部署。

### 方式 B：Cloudflare Dashboard 手动绑定

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages** → **Create a project** → **Connect to Git**
2. 选择此仓库
3. 配置构建：

   | 字段 | 值 |
   |---|---|
   | **Project name** | `hydrallm-demo` |
   | **Build command** | `npm install && npm run build && cd ui && npm install && npm run build && cp public/sw.js ../dist/ui/sw.js` |
   | **Build output directory** | `dist` |

4. 点击 **Save and Deploy** 即可

---

## 🌐 自定义域名

在 Cloudflare Pages 项目设置中：

1. 进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `hydrallm.example.com`）
4. 按提示在 DNS 解析中添加一条 `CNAME` 记录指向 `hydrallm-demo.pages.dev`

Cloudflare 会免费自动签发 SSL 证书。

---

## 🛠️ 本地开发

```bash
# 安装 Vue 着陆页依赖
npm install

# 启动 Vue 开发服务器
npm run dev

# 安装 React UI 依赖
cd ui && npm install

# React UI 开发
cd ui && npm run dev

# 生产构建（两个项目）
cd .. && npm run build:all
```

> **Node.js >= 18** 即可。

---

## 📁 项目结构

```
hydrallm-demo/
├── src/                          # Vue 3 着陆页源码
│   ├── main.ts
│   ├── App.vue
│   ├── style.css
│   ├── components/
│   │   ├── HeroSection.vue       # 首屏 + 演示入口
│   │   ├── FeaturesGrid.vue
│   │   ├── DemoFlow.vue
│   │   ├── StackBadges.vue
│   │   └── FooterSection.vue
│   └── data/sections.ts
├── ui/                           # HydraLLM React UI（完整管理界面）
│   ├── public/sw.js              # Service Worker Mock API
│   ├── src/                      # React UI 源码
│   │   ├── components/
│   │   ├── store.tsx
│   │   └── App.tsx
│   ├── index.html                # 含 SW 注册 + 演示横幅
│   ├── package.json
│   └── vite.config.ts
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署
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
| 装扮 | — | Service Worker Mock API |

---

## 📝 许可证

Apache-2.0 · Copyright © {{ new Date().getFullYear() }} clockclock1