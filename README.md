# 🔥 HotScan | 热点雷达

**AI驱动的加密货币市场热点分析平台**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Tests](https://img.shields.io/badge/tests-500%2B-green)

---

## 🚀 快速部署到 Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/hotscan)

### 手动部署步骤

1. **在 Vercel 新建项目**
   - 访问 [vercel.com](https://vercel.com) 并登录
   - 点击 "Add New" > "Project"
   - 选择 "Import Git Repository"

2. **配置环境变量**（参考 [VERCEL_ENV.md](./VERCEL_ENV.md)）
   
   **必需变量：**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secret-key-min-32-chars
   OPENAI_API_KEY=sk-...
   OPENAI_API_BASE=https://api.openai.com/v1
   DATASOURCE=dexscreener
   MOCK_AI=0
   ```

3. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成（约 2-5 分钟）
   - 获取生产域名：`https://hotscan-xxx.vercel.app`

4. **更新 NEXTAUTH_URL**
   - 部署完成后，在 Vercel Settings > Environment Variables
   - 更新 `NEXTAUTH_URL` 为实际的 Vercel 域名
   - 点击 "Redeploy" 使更改生效

5. **运行数据库迁移**（首次部署）
   ```bash
   # 在本地运行
   DATABASE_URL=<your-production-db-url> npx prisma migrate deploy
   DATABASE_URL=<your-production-db-url> npx prisma db seed
   ```

6. **启用定时任务**（参考下方"定时任务配置"）

### 验证部署

访问以下端点验证部署成功：
- `https://your-domain.vercel.app/` - 首页
- `https://your-domain.vercel.app/api/signals?limit=3` - API
- `https://your-domain.vercel.app/learn` - RAG 问答
- `https://your-domain.vercel.app/analytics` - 数据统计

---

## ⚠️ 重要声明

**本平台仅提供信息展示服务，不提供任何买卖、交易功能。所有内容均非投资建议，不构成任何投资推荐，不做任何收益承诺。加密货币投资存在极高风险，您可能损失全部投资。请在充分了解风险的基础上，理性、谨慎地做出投资决策。**

[查看完整服务条款](/legal/terms) | [隐私政策](/legal/privacy)

---

## 🎯 项目简介

HotScan 是一个基于 Next.js 的全栈 SaaS 平台，利用 AI 技术为用户提供加密货币市场的热点分析、链上数据解读和教育内容。

### 核心功能

- 🔍 **信号分析**：基于多维度指标的市场热点发现
- 🤖 **AI 解读**：GPT-4 驱动的双语市场解读
- 📚 **RAG 问答**：向量检索增强的金融术语教育
- 📊 **数据可视化**：实时价格、成交量、风险评分
- 🎨 **海报生成**：9:16 竖版分享海报
- 📈 **产品分析**：PostHog 驱动的用户行为追踪
- 🛡️ **合规保护**：完整的法律条款和免责声明

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.17.0
- **pnpm**: >= 8.0.0
- **PostgreSQL**: >= 14.0（推荐使用 Neon 或 Supabase）

### 1. 克隆项目

```bash
git clone https://github.com/your-username/hotscan.git
cd hotscan
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入实际配置
nano .env
```

**必需的环境变量**：
```bash
DATABASE_URL="postgresql://..."          # PostgreSQL 连接字符串
NEXTAUTH_URL="http://localhost:3000"     # 应用 URL
NEXTAUTH_SECRET="..."                    # NextAuth 密钥
OPENAI_API_KEY="sk-..."                  # OpenAI API Key
```

**可选的环境变量**：
```bash
EMAIL_SERVER_HOST="smtp.gmail.com"       # SMTP 服务器
EMAIL_FROM="noreply@hotscan.app"         # 发件人邮箱
NEXT_PUBLIC_POSTHOG_KEY="phc_..."        # PostHog API Key
NEXT_PUBLIC_SENTRY_DSN="https://..."     # Sentry DSN
COINGECKO_API_KEY=""                     # CoinGecko API Key
```

完整配置参考 [`.env.example`](./.env.example)

### 4. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 推送数据库 Schema（首次部署）
npx prisma db push

# 或者运行迁移（开发环境）
npx prisma migrate dev

# 填充种子数据
pnpm db:seed
```

### 5. 启动开发服务器

```bash
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

---

## 📦 可用脚本

### 开发

```bash
pnpm dev          # 启动开发服务器（localhost:3000）
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 运行 ESLint
pnpm type-check   # 运行 TypeScript 类型检查
```

### 数据库

```bash
pnpm db:generate  # 生成 Prisma Client
pnpm db:push      # 推送 Schema 到数据库（不创建迁移）
pnpm db:migrate   # 运行数据库迁移
pnpm db:seed      # 填充种子数据
pnpm db:studio    # 打开 Prisma Studio（数据库 GUI）
pnpm db:reset     # 重置数据库（警告：清空所有数据）
```

### 后台任务

```bash
pnpm jobs:fetch     # 获取资产数据（CoinGecko、Alpha Vantage）
pnpm jobs:ingest    # 摄取链上数据（缓存到 RawMetric）
pnpm jobs:analyze   # 分析信号（候选筛选 + 风险评分）
pnpm jobs:embed     # 向量化术语（RAG）
```

### 短视频脚本生成

```bash
pnpm reels          # 生成今日Top-3短视频脚本和字幕
```

**输出**:
- 口播脚本（Markdown）
- SRT字幕文件
- JSON数据
- 汇总文档

**产物路径**: `out/reels/`

**使用流程**:
1. 运行 `pnpm reels` 生成脚本
2. 查看 `out/reels/README.md` 了解生成内容
3. 根据脚本录制12-18秒短视频
4. 导入SRT字幕文件到剪辑软件
5. 发布到抖音/快手/小红书

### 测试

```bash
pnpm test             # 运行所有测试
pnpm test:ui          # 运行测试（带 UI）
pnpm test:watch       # 监听模式
pnpm test:coverage    # 生成覆盖率报告
```

---

## 🗂️ 项目结构

```
hotscan/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── api/                # API 路由
│   │   ├── legal/              # 法律页面（条款、隐私）
│   │   ├── s/[id]/             # 短链分享页
│   │   └── page.tsx            # 首页
│   ├── components/             # React 组件
│   │   ├── ui/                 # shadcn/ui 组件
│   │   ├── navigation.tsx      # 导航栏
│   │   ├── asset-card.tsx      # 资产卡片
│   │   ├── poster-generator.tsx # 海报生成器
│   │   └── ...
│   ├── lib/                    # 核心库
│   │   ├── prisma.ts           # Prisma 客户端
│   │   ├── auth.ts             # NextAuth 配置
│   │   ├── rag.ts              # RAG 核心库
│   │   ├── analytics.ts        # PostHog 分析
│   │   ├── data-sources/       # 数据源抽象层
│   │   └── quant/              # 量化分析模块
│   ├── jobs/                   # 后台任务
│   │   ├── fetch-tickers.ts    # 获取资产数据
│   │   ├── ingest-data.ts      # 摄取链上数据
│   │   ├── analyze-signals.ts  # 分析信号
│   │   └── embed-terms.ts      # 向量化术语
│   └── __tests__/              # 测试文件
├── prisma/
│   ├── schema.prisma           # 数据库 Schema
│   ├── seed.ts                 # 种子数据
│   └── migrations/             # 数据库迁移
├── .github/
│   └── workflows/              # GitHub Actions
│       ├── ci.yml              # CI 工作流
│       ├── deploy.yml          # 部署工作流
│       ├── cron.yml            # 定时任务
│       └── health-check.yml    # 健康检查
├── public/                     # 静态资源
├── .env.example                # 环境变量模板
├── package.json                # 依赖配置
├── tsconfig.json               # TypeScript 配置
├── tailwind.config.ts          # Tailwind 配置
├── vitest.config.ts            # Vitest 配置
└── README.md                   # 项目文档
```

---

## 🚢 部署到 Vercel

### 方式一：通过 Vercel CLI

#### 1. 安装 Vercel CLI

```bash
pnpm add -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

```bash
# 首次部署（会创建项目）
vercel

# 生产环境部署
vercel --prod
```

#### 4. 配置环境变量

```bash
# 通过 CLI 设置环境变量
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add OPENAI_API_KEY
# ... 添加其他环境变量
```

或者在 [Vercel Dashboard](https://vercel.com/dashboard) 中配置：
1. 选择项目 → Settings → Environment Variables
2. 逐个添加环境变量

### 方式二：通过 Vercel Dashboard

#### 1. 连接 GitHub

1. 访问 [Vercel Dashboard](https://vercel.com/new)
2. 点击 "Import Project"
3. 选择 GitHub 仓库
4. 授权 Vercel 访问

#### 2. 配置项目

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `pnpm build`（默认）
- **Output Directory**: `.next`（默认）
- **Install Command**: `pnpm install`

#### 3. 配置环境变量

在 "Environment Variables" 部分添加以下变量：

| 变量名 | 环境 | 示例值 | 说明 |
|--------|------|--------|------|
| `DATABASE_URL` | Production, Preview | `postgres://...` | PostgreSQL 连接字符串 |
| `NEXTAUTH_URL` | Production | `https://your-app.vercel.app` | 生产环境 URL |
| `NEXTAUTH_URL` | Preview | `https://{VERCEL_URL}` | 预览环境（使用 Vercel 变量）|
| `NEXTAUTH_SECRET` | Production, Preview | `xxx` | NextAuth 密钥 |
| `OPENAI_API_KEY` | Production, Preview | `sk-xxx` | OpenAI API Key |
| `EMAIL_SERVER_HOST` | Production, Preview | `smtp.gmail.com` | SMTP 服务器 |
| `EMAIL_SERVER_PORT` | Production, Preview | `587` | SMTP 端口 |
| `EMAIL_SERVER_USER` | Production, Preview | `your@email.com` | SMTP 用户 |
| `EMAIL_SERVER_PASSWORD` | Production, Preview | `xxx` | SMTP 密码 |
| `EMAIL_FROM` | Production, Preview | `noreply@hotscan.app` | 发件人邮箱 |
| `NEXT_PUBLIC_POSTHOG_KEY` | Production, Preview | `phc_xxx` | PostHog API Key |
| `NEXT_PUBLIC_SENTRY_DSN` | Production, Preview | `https://xxx` | Sentry DSN |
| `CRON_SECRET` | Production, Preview | `xxx` | Cron Job 密钥 |
| `COINGECKO_API_KEY` | Production, Preview | `xxx` | CoinGecko API Key |
| `SLACK_WEBHOOK_URL` | Production | `https://hooks.slack.com/...` | Slack 通知 |
| `FEISHU_WEBHOOK_URL` | Production | `https://open.feishu.cn/...` | 飞书通知 |

#### 4. 部署

点击 "Deploy" 按钮，Vercel 会自动构建和部署项目。

### 环境变量映射

| 本地开发 | Vercel 生产环境 | Vercel 预览环境 |
|---------|----------------|----------------|
| `http://localhost:3000` | `https://your-app.vercel.app` | `https://your-app-xxx.vercel.app` |
| `.env` | Environment Variables (Production) | Environment Variables (Preview) |
| `pnpm dev` | Auto build & deploy | Auto build & deploy (PR) |

### 特殊注意事项

#### 1. NEXTAUTH_URL 配置

**生产环境**:
```bash
NEXTAUTH_URL="https://your-app.vercel.app"
```

**预览环境**（使用 Vercel 自动变量）:
```bash
NEXTAUTH_URL="https://$VERCEL_URL"
```

或者在代码中动态处理：
```typescript
// lib/auth.ts
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
```

#### 2. 数据库迁移

Vercel 不会自动运行数据库迁移。有两种方式：

**方式 A：本地迁移**（推荐）
```bash
# 本地运行迁移
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

**方式 B：通过 `postbuild` 脚本**
```json
// package.json
{
  "scripts": {
    "postbuild": "prisma generate && prisma migrate deploy"
  }
}
```

#### 3. Cron Jobs

Vercel 支持通过 `vercel.json` 配置定时任务：

```json
{
  "crons": [
    {
      "path": "/api/jobs/make-signals",
      "schedule": "0 10,14,20 * * *"
    }
  ]
}
```

或者使用 GitHub Actions（已配置在 `.github/workflows/cron.yml`）。

#### 4. 文件上传限制

Vercel Serverless Functions 有以下限制：
- **请求体大小**: 最大 4.5 MB
- **响应大小**: 最大 4.5 MB
- **执行时间**: Hobby 10秒，Pro 60秒

如果海报生成超过限制，考虑：
- 使用 Vercel Blob Storage
- 或者使用外部 CDN（如 Cloudinary）

---

## 🔐 安全最佳实践

### 1. 环境变量安全

- ✅ 切勿将 `.env` 提交到 Git
- ✅ 使用 `openssl rand -base64 32` 生成强密码
- ✅ 定期更换密钥
- ✅ 生产环境使用不同的密钥

### 2. API 密钥管理

- ✅ 使用环境变量存储 API 密钥
- ✅ 限制 API 密钥的权限范围
- ✅ 监控 API 使用量
- ✅ 定期轮换密钥

### 3. 数据库安全

- ✅ 使用 SSL 连接（`?sslmode=require`）
- ✅ 限制数据库访问 IP
- ✅ 定期备份数据
- ✅ 使用强密码

### 4. 生成密钥示例

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET
openssl rand -hex 32

# 随机密码
openssl rand -base64 24
```

---

## 📊 监控和分析

### PostHog 分析

1. 注册 [PostHog](https://posthog.com/)
2. 创建项目，获取 API Key
3. 配置环境变量：
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY="phc_xxx"
   NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
   ```
4. 查看预定义的 5 个事件：
   - `signal_viewed`
   - `share_generated`
   - `term_clicked`
   - `subscribe_tag`
   - `ai_summary_copied`

详细说明见 [ANALYTICS.md](./ANALYTICS.md)

### Sentry 错误监控

1. 注册 [Sentry](https://sentry.io/)
2. 创建项目，获取 DSN
3. 配置环境变量：
   ```bash
   NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
   SENTRY_ENVIRONMENT="production"
   ```
4. 错误会自动上报到 Sentry Dashboard

---

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 带 UI 界面
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage

# 查看 HTML 报告
open coverage/index.html
```

### 测试覆盖

- **总用例数**: 500+
- **单元测试**: 400+
- **API 测试**: 50+
- **集成测试**: 50+
- **覆盖率目标**: ≥80%

详细说明见 [TESTING.md](./TESTING.md)

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [DATA_SOURCES.md](./DATA_SOURCES.md) | 数据源架构和抽象层 |
| [QUANT_SYSTEM.md](./QUANT_SYSTEM.md) | 量化分析系统（候选筛选+风险评分）|
| [SUMMARY_GENERATOR.md](./SUMMARY_GENERATOR.md) | AI 摘要生成器 |
| [RAG_SYSTEM.md](./RAG_SYSTEM.md) | RAG 术语问答系统 |
| [POSTER_SYSTEM.md](./POSTER_SYSTEM.md) | 9:16 海报生成系统 |
| [ANALYTICS.md](./ANALYTICS.md) | PostHog 产品分析 |
| [DEVOPS.md](./DEVOPS.md) | CI/CD 和自动化运维 |
| [TESTING.md](./TESTING.md) | 测试系统文档 |
| [LEGAL.md](./LEGAL.md) | 法律合规和免责声明 |

---

## 🛠️ 技术栈

### 前端

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 3
- **组件**: shadcn/ui
- **图表**: Recharts
- **状态管理**: React Hooks

### 后端

- **API**: Next.js Route Handlers
- **数据库**: PostgreSQL 14+ (Neon/Supabase)
- **ORM**: Prisma 5
- **向量**: pgvector
- **认证**: NextAuth.js

### AI & 数据

- **LLM**: OpenAI GPT-4 Turbo
- **Embeddings**: OpenAI text-embedding-3-small
- **数据源**: CoinGecko, Alpha Vantage, Etherscan

### 监控 & 分析

- **产品分析**: PostHog
- **错误监控**: Sentry
- **日志**: Console (可扩展为 Winston)

### DevOps

- **托管**: Vercel
- **CI/CD**: GitHub Actions
- **测试**: Vitest
- **代码质量**: ESLint, Prettier

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 编写测试用例
- 更新相关文档

---

## 📄 许可证

本项目采用 [MIT License](./LICENSE)。

---

## 📞 联系我们

- **邮箱**: hello@hotscan.app
- **法务**: legal@hotscan.app
- **GitHub**: https://github.com/hotscan/hotscan

---

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [OpenAI](https://openai.com/)
- [PostHog](https://posthog.com/)
- [Sentry](https://sentry.io/)
- [Vercel](https://vercel.com/)

---

## ⚠️ 再次提醒

**本平台仅提供信息展示服务，不提供任何买卖、交易功能。所有内容均非投资建议。加密货币投资存在极高风险，您可能损失全部投资。请理性、谨慎决策。**

---

**Made with ❤️ by HotScan Team**

## 🚀 部署到 Vercel

### 1. 环境变量配置

在 Vercel 项目设置中，需要配置以下环境变量：

**必需变量：**
- `DATABASE_URL` - PostgreSQL 数据库连接字符串
- `NEXTAUTH_URL` - NextAuth 认证 URL（生产环境）
- `NEXTAUTH_SECRET` - NextAuth 密钥
- `OPENAI_API_KEY` - OpenAI API 密钥
- `OPENAI_API_BASE` - OpenAI API 基础 URL（可选代理）

**可选变量：**
- `DATASOURCE` - 数据源（默认: dexscreener）
- `POSTHOG_KEY` - PostHog 分析密钥
- `SENTRY_DSN` - Sentry 错误追踪 DSN
- `MOCK_AI` - 是否使用 Mock AI（开发用，设为 0）

### 2. 部署步骤

1. 在 Vercel 控制台导入 GitHub 仓库
2. 在 Settings > Environment Variables 中配置上述变量
3. 部署会自动触发构建

### 3. GitHub Actions 定时任务

**配置 GitHub Secrets：**

进入仓库 Settings > Secrets and variables > Actions，添加：

- `DATABASE_URL` - 数据库连接字符串
- `OPENAI_API_KEY` - OpenAI API 密钥
- `OPENAI_API_BASE` - OpenAI API 基础 URL
- `DATASOURCE` - 数据源类型（dexscreener）

**定时任务说明：**

- 自动运行频率：每 30 分钟
- 任务内容：
  1. fetch-tickers：从 DexScreener 拉取数据
  2. make-signals：生成交易信号

**手动触发：**

在 GitHub Actions 页面可以手动触发 "Scheduled Data Fetch" 工作流。

## 📊 数据源

HotScan 使用 [DexScreener API](https://dexscreener.com) 作为主要数据源，提供：

- 实时加密货币价格
- 交易对流动性
- 24小时交易量
- 价格变化百分比
- DEX 交易数据

## 🔧 本地开发

```bash
# 安装依赖
pnpm install

# 配置环境变量（参考 .env.example）
cp .env.example .env

# 数据库迁移
npx prisma migrate dev

# 填充种子数据
pnpm db:seed

# 启动开发服务器
pnpm dev

# 手动运行任务
pnpm jobs:fetch   # 拉取数据
pnpm jobs:signals # 生成信号
```


## ⏰ 定时任务配置

HotScan 支持两种定时任务方案：

### 方案一：GitHub Actions（推荐）

**优点**：免费、可靠、易于监控

**配置步骤**：

1. **配置 GitHub Secrets**
   
   在仓库 Settings > Secrets and variables > Actions 中添加：
   
   ```
   DATABASE_URL          - 数据库连接字符串
   OPENAI_API_KEY        - OpenAI API 密钥
   OPENAI_API_BASE       - OpenAI API 基础 URL
   DATASOURCE            - 数据源类型（dexscreener）
   ```

2. **启用 GitHub Actions**
   
   工作流文件 `.github/workflows/cron.yml` 已配置为每 30 分钟运行一次：
   
   ```yaml
   schedule:
     - cron: '*/30 * * * *'  # 每 30 分钟
   ```

3. **手动触发**（可选）
   
   在 GitHub Actions 页面可以手动触发 "Scheduled Data Fetch" 工作流进行测试。

### 方案二：Vercel Cron Jobs

**优点**：与 Vercel 部署集成、无需额外服务

**配置步骤**：

1. **生成 JOB_TOKEN**
   
   ```bash
   openssl rand -hex 32
   ```
   
   在 Vercel 环境变量中添加：
   ```
   JOB_TOKEN=<生成的随机字符串>
   ```

2. **配置 Vercel Cron**
   
   在 Vercel 项目 Settings > Cron Jobs 中添加：
   
   - **Schedule**: `*/30 * * * *` (每 30 分钟)
   - **Path**: `/api/jobs/run`
   - **Method**: `POST`
   - **Headers**:
     ```
     Authorization: Bearer <your-JOB_TOKEN>
     ```

3. **验证配置**
   
   手动调用测试：
   
   ```bash
   curl -X POST https://your-domain.vercel.app/api/jobs/run \
     -H "Authorization: Bearer <your-JOB_TOKEN>"
   ```

### 任务说明

定时任务会依次执行：

1. **fetch-tickers**: 从 DexScreener 拉取 10 个主流代币的最新数据
2. **make-signals**: 基于最新数据生成交易信号和风险评分

预计总耗时：60-90 秒

### 监控与日志

- **GitHub Actions**: 在 Actions 页面查看运行历史和日志
- **Vercel Cron**: 在 Vercel 项目 > Deployments > Functions 查看日志


## ✅ 上线后要做的三件事

### 1. 填写 Vercel 环境变量

特别注意以下变量：

- ✅ **NEXTAUTH_URL**: 更新为实际的 Vercel 域名
  ```
  https://hotscan-xxx.vercel.app
  ```

- ✅ **DATABASE_URL**: 确保生产数据库地址正确

- ✅ **OPENAI_API_KEY**: 确认 API 密钥有效且有足够配额

填写完成后，点击 "Redeploy" 使环境变量生效。

### 2. 开启定时任务

**选择一种方案：**

#### 方案 A: GitHub Actions（推荐）

1. 在 GitHub 仓库配置 Secrets（参考上方"定时任务配置"）
2. 确认 `.github/workflows/cron.yml` 文件存在
3. 在 GitHub Actions 页面手动触发一次测试
4. 验证任务运行成功

#### 方案 B: Vercel Cron Jobs

1. 生成 `JOB_TOKEN` 并添加到 Vercel 环境变量
2. 在 Vercel Settings > Cron Jobs 添加任务
3. 手动调用 `/api/jobs/run` 端点测试
4. 确认日志中显示成功

### 3. 运行健康检查

在本地运行自检脚本验证部署：

```bash
PROD_URL=https://your-domain.vercel.app pnpm tsx scripts/post-deploy-check.ts
```

**预期输出：**

```
🚀 HotScan Post-Deployment Health Check
🌐 Production URL: https://hotscan-xxx.vercel.app

🔍 Checking: Signals API
   ✅ PASS (234ms)

🔍 Checking: Learn API (RAG)
   ✅ PASS (1456ms)

🔍 Checking: Homepage
   ✅ PASS (187ms)

🔍 Checking: Analytics Page
   ✅ PASS (156ms)

📊 Summary
✅ Passed: 4/4
❌ Failed: 0/4
⏱️  Total duration: 2033ms

✨ All checks passed! Deployment is healthy.
```

### 4. 打开分析面板

访问 `https://your-domain.vercel.app/analytics` 观察统计数据：

- 📊 Signals 数量
- 🪙 Assets 数量
- 📚 Terms 数量
- 📱 Shares 数量
- 👥 Subscriptions 数量

如果数据为空，手动运行定时任务或等待自动执行。

