# 🎭 抖音表情下载器

一个现代化的抖音表情包下载工具，支持单张下载和批量打包导出。

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能特性

- 🔍 **实时搜索** - 快速查找想要的表情
- 📦 **批量下载** - 一键打包下载选中的表情
- 🌓 **主题切换** - 支持浅色/深色/跟随系统
- 📱 **响应式设计** - 完美适配桌面和移动端
- ⚡ **极速体验** - 基于 Vite 构建，加载飞快
- 🎯 **零后端依赖** - 纯前端实现，可部署到任意静态托管平台

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📦 部署

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/douyin-emoji-downloader)

### Cloudflare Pages

#### 方法一：通过 Dashboard 部署（推荐）

1. Fork 本仓库
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 进入 **Pages** → **创建项目**
4. 选择 **连接到 Git**，授权并选择你的仓库
5. 在构建设置中配置：

| 配置项 | 值 |
|--------|-----|
| **构建命令** | `npm run build` |
| **输出目录** | `dist` |
| **根目录** | `/` |

6. 点击 **保存并部署**

#### 方法二：使用 Wrangler CLI 部署

```bash
# 登录 Cloudflare
npx wrangler login

# 部署
npm run cf:deploy
```

本地预览 Cloudflare Pages 输出：

```bash
npm run cf:preview
```

#### ⚠️ 重要提示

- **构建设置必须在 Cloudflare Pages 控制台中配置**，`wrangler.toml` 仅支持 `pages_build_output_dir` 等有限字段
- 确保 **构建命令** 设置为 `npm run build`，否则项目将不会被正确构建
- 确保 **输出目录** 设置为 `dist`，这是 Vite 默认的构建输出目录
- 项目已配置 `wrangler.toml` 文件，包含 `pages_build_output_dir = "dist"` 设置
- 项目已包含 `_headers`、`_redirects`、PWA manifest 和 Service Worker，可直接作为 Cloudflare Pages 静态站部署

## 📱 PWA 安装

生产构建会自动输出 `manifest.webmanifest`、`sw.js` 和安装图标。部署到 HTTPS 后，在桌面浏览器或移动端浏览器中选择“安装应用”即可作为 PWA 使用。

### 其他平台

本项目为纯静态站点，可部署到任何支持静态托管的平台：
- GitHub Pages
- Netlify
- 阿里云 OSS
- 腾讯云 COS

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 | 前端框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| JSZip | ZIP 打包 |
| FileSaver | 文件下载 |

## 📁 项目结构

```
douyin-emoji-downloader/
├── src/
│   ├── components/      # Vue 组件
│   │   ├── EmojiCard.vue
│   │   ├── EmojiGrid.vue
│   │   ├── SearchBar.vue
│   │   ├── ThemeToggle.vue
│   │   └── ProgressDialog.vue
│   ├── composables/     # 组合式函数
│   │   ├── useEmoji.ts
│   │   └── useDownloader.ts
│   ├── styles/          # 样式文件
│   │   └── main.css
│   ├── types/           # TypeScript 类型
│   │   └── index.ts
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── data/                # 表情数据
│   └── emojis.json
├── public/              # 静态资源
├── index.html           # HTML 模板
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目配置
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码
npm run format

# 类型检查
npm run typecheck
```

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

## ⚠️ 免责声明

### 1. 项目性质
本项目仅供学习交流、技术研究使用，不得用于任何商业用途。本项目是一个开源项目，旨在提供技术学习和交流的平台。

### 2. 知识产权声明
- 本项目中涉及的表情图片、图标等素材版权归原作者及相关权利人所有
- 本项目不拥有任何表情素材的版权
- 用户使用本项目下载的任何内容，其版权归原权利人所有

### 3. 使用风险
- 用户使用本项目所产生的一切后果由用户自行承担
- 本项目开发者不对因使用本项目而导致的任何直接或间接损失负责
- 本项目不保证其功能、可靠性、准确性或完整性

### 4. 法律责任
- 用户应遵守当地法律法规，不得利用本项目从事违法活动
- 如因用户使用不当造成侵权或其他法律问题，由用户自行承担全部责任
- 如相关权利人认为本项目侵犯其权益，请及时联系开发者处理

### 5. 其他
- 本免责声明的解释权归项目开发者所有
- 本免责声明可能随时更新，恕不另行通知

---

如果这个项目对你有帮助，欢迎 ⭐ Star 支持！
