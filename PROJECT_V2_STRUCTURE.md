# HotScan v2.0 - 完整项目结构

## 📁 完整文件树

```
HotScan｜热点雷达/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI: lint/test/build
│       ├── deploy.yml          # 部署到 Vercel
│       └── cron.yml            # 定时任务触发
│
├── prisma/
│   ├── schema-v2.prisma        # ✅ 数据库模型（资产分析专用）
│   └── seed.ts                 # 示例数据
│
├── public/
│   ├── logo.svg
│   └── images/
│
├── scripts/
│   ├── setup.sh                # 快速设置脚本
│   └── check.sh                # 代码质量检查
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts    # NextAuth 认证
│   │   │   ├── signals/
│   │   │   │   ├── route.ts    # GET/POST 信号
│   │   │   │   └── [id]/route.ts
│   │   │   ├── assets/
│   │   │   │   ├── route.ts    # GET 资产列表
│   │   │   │   └── [id]/route.ts
│   │   │   ├── learn/
│   │   │   │   ├── route.ts    # RAG 问答
│   │   │   │   └── search/route.ts # 术语搜索
│   │   │   ├── share/
│   │   │   │   ├── route.ts    # 创建分享
│   │   │   │   └── [id]/route.ts
│   │   │   └── jobs/
│   │   │       ├── fetch-tickers/route.ts
│   │   │       ├── make-signals/route.ts
│   │   │       └── embed-terms/route.ts
│   │   │
│   │   ├── (routes)/
│   │   │   ├── page.tsx        # 今日热点列表
│   │   │   ├── asset/
│   │   │   │   └── [id]/page.tsx # 资产详情 + AI 解读
│   │   │   ├── learn/
│   │   │   │   └── page.tsx    # 术语 RAG 问答
│   │   │   ├── share/
│   │   │   │   └── [id]/page.tsx # 9:16 海报页
│   │   │   └── legal/
│   │   │       ├── terms/page.tsx
│   │   │       └── privacy/page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 组件
│   │   ├── asset-card.tsx      # 资产卡片
│   │   ├── signal-card.tsx     # 信号卡片
│   │   ├── poster-generator.tsx # 海报生成器
│   │   ├── rag-chat.tsx        # RAG 聊天界面
│   │   ├── header.tsx
│   │   └── footer.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts           # Prisma 客户端
│   │   ├── auth.ts             # NextAuth 配置（Email）
│   │   ├── openai.ts           # OpenAI 工具
│   │   ├── rag.ts              # RAG 实现
│   │   ├── poster.ts           # 海报生成
│   │   ├── analytics.ts        # PostHog 集成
│   │   ├── sentry.ts           # Sentry 配置
│   │   └── utils.ts            # 工具函数
│   │
│   ├── jobs/
│   │   ├── fetch-tickers.ts    # ✅ 获取行情数据
│   │   ├── make-signals.ts     # ✅ 生成 AI 信号
│   │   └── embed-terms.ts      # ✅ 嵌入术语向量
│   │
│   ├── types/
│   │   ├── next-auth.d.ts
│   │   └── index.ts
│   │
│   └── __tests__/
│       ├── setup.ts
│       └── ...
│
├── .env.example                # ✅ 环境变量模板
├── .gitignore
├── .eslintrc.json
├── .editorconfig
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json                # ✅ 更新的依赖
├── pnpm-lock.yaml
├── vercel.json                 # Vercel & Cron 配置
├── sentry.client.config.ts     # Sentry 客户端
├── sentry.server.config.ts     # Sentry 服务端
├── README-V2.md                # 新版文档
└── QUICKSTART-V2.md            # 快速开始
```

---

## 🎯 关键文件说明

### 数据库模型 (`prisma/schema-v2.prisma`)

```prisma
// 核心模型
- User             # 用户（Email 登录）
- Asset            # 资产（股票/加密货币）
- Signal           # AI 信号/洞察
- Term             # 金融术语（带向量嵌入）
- Share            # 分享/海报
- JobRun           # 定时任务记录
- Analytics        # 数据分析
```

### 定时任务 (Jobs)

1. **`src/jobs/fetch-tickers.ts`**
   - 功能：获取资产行情数据
   - 数据源：Alpha Vantage (股票) + CoinGecko (加密货币)
   - 频率：每 5 分钟
   - 命令：`pnpm jobs:fetch`

2. **`src/jobs/make-signals.ts`**
   - 功能：AI 分析生成交易信号
   - 使用：OpenAI GPT-4
   - 频率：每小时
   - 命令：`pnpm jobs:signals`

3. **`src/jobs/embed-terms.ts`**
   - 功能：生成术语向量嵌入
   - 使用：OpenAI Embeddings
   - 频率：每天或新增术语时
   - 命令：`pnpm jobs:embed`

### API 路由

#### `/api/signals`
```typescript
GET  /api/signals              # 获取信号列表
POST /api/signals              # 创建新信号
GET  /api/signals/[id]         # 获取信号详情
```

#### `/api/assets`
```typescript
GET  /api/assets               # 获取资产列表
POST /api/assets               # 创建/更新资产
GET  /api/assets/[id]          # 获取资产详情
```

#### `/api/learn`
```typescript
POST /api/learn                # RAG 问答
GET  /api/learn/search         # 术语语义搜索
```

#### `/api/share`
```typescript
POST /api/share                # 创建分享海报
GET  /api/share/[id]           # 获取分享详情
```

#### `/api/jobs/*`
```typescript
POST /api/jobs/fetch-tickers   # 触发行情抓取
POST /api/jobs/make-signals    # 触发信号生成
POST /api/jobs/embed-terms     # 触发术语嵌入
```

### 页面路由

#### `/` - 今日热点列表
- 展示热门资产和最新信号
- 按热度、涨跌幅、市值排序
- 搜索和筛选功能

#### `/asset/[id]` - 资产详情页
- 资产基本信息和价格图表
- AI 解读卡片
- 相关信号和新闻
- 关键术语解释

#### `/learn` - 术语学习页
- RAG 问答聊天界面
- 术语搜索
- 相关术语推荐
- 学习进度追踪

#### `/share/[id]` - 9:16 海报页
- 垂直海报布局
- 可下载为图片
- 包含二维码分享
- SEO 优化

#### `/legal/*` - 法律页面
- `/legal/terms` - 服务条款
- `/legal/privacy` - 隐私政策
- 合规声明：**不提供投资建议**

---

## 🔧 核心功能实现

### 1. RAG 问答系统

```typescript
// src/lib/rag.ts
export async function ragQuery(question: string) {
  // 1. 生成问题向量
  const questionEmbedding = await generateEmbedding(question)
  
  // 2. 向量相似度搜索
  const relevantTerms = await prisma.$queryRaw`
    SELECT * FROM "Term"
    ORDER BY embedding <-> ${questionEmbedding}::vector
    LIMIT 5
  `
  
  // 3. 构建上下文
  const context = relevantTerms.map(t => 
    `${t.term}: ${t.definition}`
  ).join('\n\n')
  
  // 4. GPT 生成回答
  const answer = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: '你是专业的金融顾问助手。' },
      { role: 'user', content: `上下文：\n${context}\n\n问题：${question}` }
    ]
  })
  
  return answer.choices[0].message.content
}
```

### 2. 海报生成

```typescript
// src/lib/poster.ts
import { toPng } from 'html-to-image'

export async function generatePoster(signalId: string) {
  const signal = await prisma.signal.findUnique({
    where: { id: signalId },
    include: { asset: true }
  })
  
  // 1. 渲染 React 组件到 Canvas
  const posterElement = document.getElementById('poster')
  const dataUrl = await toPng(posterElement, {
    width: 1080,
    height: 1920, // 9:16
    quality: 1.0
  })
  
  // 2. 上传到存储（Vercel Blob 或 S3）
  const imageUrl = await uploadImage(dataUrl)
  
  // 3. 创建分享记录
  const share = await prisma.share.create({
    data: {
      assetId: signal.assetId,
      signalId: signal.id,
      title: signal.title,
      imageUrl
    }
  })
  
  return share
}
```

### 3. Email 登录配置

```typescript
// src/lib/auth.ts
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    })
  ],
  // ...
}
```

---

## 🚀 安装与运行

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp env.example .env
# 编辑 .env 填入必要配置
```

### 3. 设置数据库

```bash
# 使用新的 schema
cp prisma/schema-v2.prisma prisma/schema.prisma

# 推送到数据库
pnpm db:push

# 填充示例数据
pnpm db:seed
```

### 4. 启动开发服务器

```bash
pnpm dev
```

### 5. 运行定时任务（可选）

```bash
# 获取行情
pnpm jobs:fetch

# 生成信号
pnpm jobs:signals

# 嵌入术语
pnpm jobs:embed
```

---

## 📊 GitHub Actions 配置

### `.github/workflows/cron.yml`

```yaml
name: Cron Jobs

on:
  schedule:
    # 每 5 分钟获取行情
    - cron: '*/5 * * * *'
  workflow_dispatch:

jobs:
  fetch-tickers:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger fetch-tickers
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/jobs/fetch-tickers \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

  make-signals:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 * * * *'  # 每小时
    steps:
      - name: Trigger make-signals
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/jobs/make-signals \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## 🔐 安全与合规

### 免责声明

所有页面底部和分析页面都包含：

```
⚠️ 重要提示：本平台提供的所有信息和分析仅供参考，
不构成任何投资建议。投资有风险，决策需谨慎。
请根据自身情况做出独立判断，或咨询专业财务顾问。
```

### 数据隐私

- Email 登录信息加密存储
- 用户数据符合 GDPR
- 提供数据导出和删除功能

---

## 📈 监控与分析

### PostHog 集成

```typescript
// src/lib/analytics.ts
import { PostHog } from 'posthog-node'

export const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  { host: process.env.NEXT_PUBLIC_POSTHOG_HOST }
)

// 追踪事件
posthog.capture({
  distinctId: userId,
  event: 'viewed_signal',
  properties: { signalId, assetSymbol }
})
```

### Sentry 错误追踪

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
})
```

---

## ✅ 完成清单

- [x] 项目配置和依赖
- [x] 数据库模型（资产/信号/术语/RAG）
- [x] 三个定时任务（fetch/make/embed）
- [x] API 路由结构
- [x] 页面路由规划
- [x] RAG 问答系统设计
- [x] 海报生成功能设计
- [x] Email 登录配置
- [x] 监控和分析集成
- [x] GitHub Actions 配置
- [x] 合规声明和隐私政策

---

## 📚 文档

- `README-V2.md` - 完整项目文档
- `QUICKSTART-V2.md` - 快速开始指南
- `PROJECT_V2_STRUCTURE.md` - 本文档

---

**项目状态：✅ 架构完整，核心文件已创建，可立即开始开发！**
