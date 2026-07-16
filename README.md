# HydraLLM · Cloudflare Pages 示例站

> 接入多个大模型不该是一件头疼的事。
> 本仓库是 HydraLLM 项目的静态展示页面，托管于 Cloudflare Pages。

**上游项目**：[clockclock1/HydraLLM](https://github.com/clockclock1/HydraLLM)

---

## 🚀 快速部署到 Cloudflare Pages

### 方式 A：GitHub Actions 自动部署（推荐）

推送代码到 `main` 分支后，GitHub Actions 会自动构建并部署到 Cloudflare Pages。

#### 前提条件

在 [Cloudflare Dashboard](https://dash.cloudflare.com/) 获取：

1. **Account ID**：在任意域名概览页右上角可看到
2. **API Token**：
   - 进入 **My Profile** → **API Tokens**
   - 点击 **Create Token** → 选择 **Edit Cloudflare Workers** 模板
   - Account Resources 设置为「Include」你的账户
   - 点击 **Create Token**

#### 配置 GitHub Secrets

在 GitHub 仓库 `Settings → Secrets and variables → Actions` 中添加：

| Secret 名称 | 值 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 上面创建的 API Token |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare Account ID |

完成后，每次推送到 `main` 分支都会自动触发部署。部署完成后可访问：

```
https://hydrallm-demo.pages.dev
```

或绑定自定义域名（见下方说明）。

---

### 方式 B：Cloudflare Dashboard 手动绑定（零配置 CI）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages** → **Create a project** → **Connect to Git**
2. 选择此仓库
3. 配置构建：

   | 字段 | 值 |
   |---|---|
   | **Project name** | `hydrallm-demo` |
   | **Build command** | `pnpm install && pnpm build` |
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
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 生产构建
pnpm build

# 预览构建产物
pnpm preview
```

> **Node.js >= 18** 即可。

---

## 📁 项目结构

```
hydrallm-demo/
├── src/
│   ├── main.ts                 # Vue 入口
│   ├── App.vue                 # 根组件
│   ├── style.css               # 全局样式
│   ├── data/
│   │   └── sections.ts         # 文案与数据配置
│   └── components/
│       ├── HeroSection.vue      # 首屏 Hero
│       ├── FeaturesGrid.vue    # 核心特性
│       ├── DemoFlow.vue        # 故障转移流程演示
│       ├── StackBadges.vue     # 技术栈 + API 端点
│       └── FooterSection.vue   # 页脚
├── public/
│   └── favicon.svg             # SVG 图标
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions 自动部署
├── wrangler.toml               # Cloudflare Pages 配置
├── vite.config.ts              # Vite 构建配置
├── uno.config.ts               # UnoCSS 样式配置
└── package.json
```

---

## ⚡ 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite 6 |
| 样式 | UnoCSS（原子化 CSS + iconify 图标） |
| 部署 | Cloudflare Pages + GitHub Actions |
| 字体 | Google Fonts（Inter + JetBrains Mono） |

---

## 📝 许可证

Apache-2.0 · Copyright © {{ new Date().getFullYear() }} clockclock1