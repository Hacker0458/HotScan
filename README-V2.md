# HotScan v2.0｜热点雷达 - AI 资产分析平台

<div align="center">

**AI 驱动的金融资产热点解读与学习平台**

实时追踪市场热点 · AI 智能分析 · RAG 术语问答 · 一键生成分享海报

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## ✨ 核心功能

### 🔥 今日热点
- 实时资产行情追踪（股票 + 加密货币）
- AI 生成的交易信号和市场洞察
- 按热度、涨跌幅、成交量排序
- 个性化关注列表

### 📊 资产详情与 AI 解读
- 价格图表和关键指标
- AI 生成的深度分析卡片
- 情绪分析（看涨/看跌/中性）
- 关键要点提取
- 新闻来源追溯

### 🎓 术语学习 (RAG 问答)
- 基于 pgvector 的语义搜索
- GPT-4 驱动的智能问答
- 金融术语知识库
- 相关术语推荐
- 学习进度追踪

### 📱 9:16 分享海报
- 垂直海报布局优化
- 一键导出图片
- 内置二维码分享
- SEO 友好

---

## 🛠 技术栈

### 前端
- **Next.js 14** (App Router) - React 全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS
- **shadcn/ui** - 高质量组件库

### 后端
- **Next.js API Routes** - 服务端 API
- **Server Actions** - 服务端操作
- **Prisma** - 类型安全 ORM
- **PostgreSQL + pgvector** - 向量数据库

### AI & 数据
- **OpenAI GPT-4** - 智能分析
- **text-embedding-3-small** - 向量嵌入
- **Alpha Vantage** - 股票数据
- **CoinGecko** - 加密货币数据

### 认证
- **NextAuth.js** - Email Magic Link 登录
- **Prisma Adapter** - 数据库适配器

### 监控
- **PostHog** - 产品分析
- **Sentry** - 错误追踪
- **Vercel Analytics** - 性能监控

---

## 🚀 快速开始

### 前置要求

```bash
Node.js >= 18.0.0
pnpm >= 8.0.0
PostgreSQL with pgvector extension
```

### 1. 克隆并安装

```bash
git clone <repository>
cd "HotScan｜热点雷达"
pnpm install
```

### 2. 配置环境变量

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
# 数据库 (必需)
DATABASE_URL="postgresql://..."

# NextAuth (必需)
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Email (必需，用于登录)
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PASSWORD="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# OpenAI (必需)
OPENAI_API_KEY="sk-..."

# 可选
ALPHA_VANTAGE_API_KEY=""
COINGECKO_API_KEY=""
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_SENTRY_DSN=""
```

### 3. 设置数据库

```bash
# 推送 Schema 到数据库
npx prisma db push
# 或使用迁移（推荐生产环境）
npx prisma migrate dev --name init

# 生成 Prisma 客户端
npx prisma generate

# 填充示例数据
npx prisma db seed
# 或使用 pnpm 脚本
pnpm db:seed
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 5. 运行定时任务 (可选)

```bash
# 获取行情数据
pnpm jobs:fetch

# 生成 AI 信号
pnpm jobs:signals

# 嵌入术语向量
pnpm jobs:embed
```

---

## 📁 项目结构

```
src/
├── app/
│   ├── api/                    # API 路由
│   │   ├── signals/            # 信号 API
│   │   ├── assets/             # 资产 API
│   │   ├── learn/              # RAG 问答 API
│   │   ├── share/              # 分享 API
│   │   └── jobs/               # 定时任务触发
│   ├── page.tsx                # 首页 - 今日热点
│   ├── asset/[id]/page.tsx     # 资产详情
│   ├── learn/page.tsx          # 术语学习
│   ├── share/[id]/page.tsx     # 分享海报
│   └── legal/                  # 法律页面
│
├── components/
│   ├── ui/                     # shadcn/ui 组件
│   ├── asset-card.tsx          # 资产卡片
│   ├── signal-card.tsx         # 信号卡片
│   ├── rag-chat.tsx            # RAG 聊天
│   └── poster-generator.tsx    # 海报生成器
│
├── lib/
│   ├── prisma.ts               # 数据库客户端
│   ├── auth.ts                 # 认证配置
│   ├── rag.ts                  # RAG 实现
│   ├── openai.ts               # OpenAI 工具
│   └── utils.ts                # 工具函数
│
└── jobs/
    ├── fetch-tickers.ts        # 获取行情
    ├── make-signals.ts         # 生成信号
    └── embed-terms.ts          # 嵌入向量
```

---

## 🎯 核心功能实现

### RAG 问答系统

```typescript
// 1. 用户提问
const question = "什么是 P/E Ratio？"

// 2. 向量搜索相关术语
const relevantTerms = await searchRelevantTerms(question, 5)

// 3. GPT 生成回答
const answer = await ragQuery(question)
// 返回：专业回答 + 知识来源 + 相关术语
```

### AI 信号生成

```typescript
// 定时任务：每小时运行
export async function makeSignals() {
  // 1. 获取热门资产
  const assets = await getTopAssets()
  
  // 2. 抓取相关新闻
  const news = await fetchNews(asset.symbol)
  
  // 3. AI 分析
  const analysis = await analyzeWithAI(asset, news)
  
  // 4. 创建信号
  await createSignal(analysis)
}
```

### 海报生成

```typescript
// 1. 渲染组件到 Canvas
const posterElement = document.getElementById('poster')
const dataUrl = await toPng(posterElement, {
  width: 1080,
  height: 1920 // 9:16 比例
})

// 2. 上传图片
const imageUrl = await uploadImage(dataUrl)

// 3. 创建分享链接
const share = await createShare({ imageUrl })
```

---

## 📊 API 接口

### 信号 API

```http
GET  /api/signals?assetId=xxx&type=analysis&limit=20
POST /api/signals
GET  /api/signals/[id]
```

### 资产 API

```http
GET  /api/assets?type=stock&sort=volume&limit=20
GET  /api/assets/[id]
```

### 学习 API

```http
POST /api/learn
     Body: { "question": "什么是市值？" }
     
GET  /api/learn/search?q=市值&type=semantic
```

### 分享 API

```http
POST /api/share
     Body: { "assetId": "xxx", "signalId": "xxx" }
     
GET  /api/share/[id]
```

---

## ⚙️ 定时任务

### GitHub Actions Cron

```yaml
# .github/workflows/cron.yml
name: Cron Jobs

on:
  schedule:
    - cron: '*/5 * * * *'  # 每 5 分钟获取行情
    - cron: '0 * * * *'    # 每小时生成信号
    - cron: '0 2 * * *'    # 每天凌晨 2 点嵌入术语

jobs:
  fetch-tickers:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Job
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/jobs/fetch-tickers \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 手动触发

```bash
# 开发环境可直接运行
pnpm jobs:fetch
pnpm jobs:signals
pnpm jobs:embed

# 生产环境通过 API
curl -X POST https://your-domain.com/api/jobs/make-signals \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

## 🔐 安全与合规

### 免责声明

所有页面包含醒目的免责声明：

```
⚠️ 重要提示：
本平台提供的所有信息和分析仅供参考，不构成任何投资建议。
投资有风险，决策需谨慎。请根据自身情况做出独立判断，
或咨询专业财务顾问。
```

### 数据隐私

- Email Magic Link 安全登录
- 用户数据加密存储
- 符合 GDPR 要求
- 提供数据导出和删除

### 认证配置

```typescript
// Email Magic Link 登录
import EmailProvider from 'next-auth/providers/email'

export const authOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })
  ]
}
```

---

## 📈 监控与分析

### PostHog 事件追踪

```typescript
posthog.capture({
  distinctId: userId,
  event: 'viewed_signal',
  properties: {
    assetSymbol: 'AAPL',
    signalType: 'analysis'
  }
})
```

### Sentry 错误监控

```typescript
Sentry.captureException(error, {
  tags: { component: 'rag-query' },
  extra: { question }
})
```

---

## 🚢 部署

### Vercel 一键部署

1. 连接 GitHub 仓库
2. 配置环境变量
3. 点击部署

### 数据库

推荐使用：
- **Neon** - https://neon.tech (免费，支持 pgvector)
- **Supabase** - https://supabase.com (免费，支持 pgvector)

### Email 服务

推荐使用：
- **Resend** - https://resend.com (简单易用)
- **SendGrid** - https://sendgrid.com
- **AWS SES** - 大规模发送

---

## 🧪 测试

```bash
# 运行测试
pnpm test

# 覆盖率报告
pnpm test:coverage

# 代码检查
pnpm lint
pnpm type-check
```

---

## 📚 文档

- `README-V2.md` - 本文档
- `PROJECT_V2_STRUCTURE.md` - 完整项目结构
- `QUICKSTART-V2.md` - 快速开始指南
- `env.example` - 环境变量模板

---

## 🤝 贡献

欢迎贡献！请查看 `CONTRIBUTING.md`

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 📞 支持

- **Email**: support@hotscan.example.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/hotscan/issues)
- **文档**: [完整文档](https://docs.hotscan.example.com)

---

<div align="center">

**由 ❤️ 使用 Next.js 14 + AI 构建**

[开始使用](QUICKSTART-V2.md) · [查看演示](https://hotscan.vercel.app) · [API 文档](https://docs.hotscan.example.com)

</div>
