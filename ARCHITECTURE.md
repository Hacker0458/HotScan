# 架构设计文档

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户界面层                            │
│  Next.js App Router + React + Tailwind + shadcn/ui         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API 层                               │
│  Next.js API Routes + Server Actions                        │
└─────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
        ┌────────────┐ ┌───────────┐ ┌──────────┐
        │   Auth     │ │  Business │ │   AI     │
        │  NextAuth  │ │   Logic   │ │ OpenAI   │
        └────────────┘ └───────────┘ └──────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据访问层                              │
│               Prisma ORM + pgvector                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                              │
│              PostgreSQL (Neon/Supabase)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心模块设计

### 1. 认证模块 (Auth)

**责任**: 用户认证和授权

**技术栈**:
- NextAuth.js
- OAuth 2.0 (Google, GitHub)
- JWT Session

**关键文件**:
- `src/lib/auth.ts` - 认证配置
- `src/app/api/auth/[...nextauth]/route.ts` - 认证端点

**流程**:
```
用户 → OAuth Provider → NextAuth → JWT Token → Session
```

---

### 2. 新闻聚合模块 (News Aggregation)

**责任**: 从多个源抓取和聚合新闻

**文件**: `src/lib/news-fetcher.ts`

**设计模式**: Strategy Pattern（策略模式）

**支持的新闻源**:
- NewsAPI
- RSS Feeds
- 社交媒体 API
- 自定义爬虫

**数据流**:
```
外部源 → Fetcher → 数据标准化 → 趋势评分 → 存储
```

**关键函数**:
```typescript
fetchTrendingNews(category?: string): Promise<NewsArticle[]>
calculateTrendScore(article: NewsArticle): number
```

---

### 3. AI 分析模块 (AI Analysis)

**责任**: 使用 AI 分析新闻内容

**文件**: `src/lib/openai.ts`

**功能**:
1. **情感分析** (`analyzeSentiment`)
   - 输入: 文本内容
   - 输出: positive | negative | neutral

2. **关键词提取** (`extractKeywords`)
   - 使用 GPT 提取核心关键词
   - 最多返回指定数量的关键词

3. **内容摘要** (`generateSummary`)
   - 生成简洁的摘要（≤200字）

4. **向量嵌入** (`generateEmbedding`)
   - 使用 text-embedding-3-small
   - 维度: 1536
   - 用于语义搜索

**使用示例**:
```typescript
const sentiment = await analyzeSentiment(article.content)
const keywords = await extractKeywords(article.title, 10)
const embedding = await generateEmbedding(article.title)
```

---

### 4. 数据库模块 (Database)

**ORM**: Prisma

**数据库**: PostgreSQL + pgvector

**核心模型**:

#### TrendingTopic（热点话题）
```prisma
model TrendingTopic {
  id          String   @id @default(cuid())
  title       String
  category    String
  trendScore  Float
  sentiment   String?
  keywords    String[]
  embedding   vector(1536)?  // pgvector
  // ...relations
}
```

#### Article（文章）
```prisma
model Article {
  id          String   @id @default(cuid())
  topicId     String
  title       String
  content     String?
  sentiment   String?
  keyPoints   String[]
  // ...relations
}
```

**索引策略**:
- `category` - 分类查询
- `trendScore` - 热度排序
- `createdAt` - 时间排序
- `embedding` - 向量相似度搜索

---

### 5. 定时任务模块 (Cron Jobs)

**文件**: `src/app/api/cron/fetch-news/route.ts`

**调度**: Vercel Cron

**任务**:
1. 每小时抓取新闻
2. AI 分析处理
3. 数据存储
4. 状态记录

**流程**:
```
Vercel Cron → API Endpoint → News Fetcher → AI Analysis → Database
```

**监控**:
- CronJob 表记录执行状态
- 错误日志记录
- 执行时间记录

---

## 性能优化

### 1. 数据库优化

- **索引**: 关键字段添加索引
- **分页**: 使用 `take` 和 `skip`
- **选择性加载**: 使用 `select` 和 `include`

### 2. 缓存策略

- **Next.js 缓存**: 使用 `revalidate`
- **API 响应缓存**: 适当使用 `cache: 'force-cache'`

### 3. 代码分割

- **动态导入**: 使用 `next/dynamic`
- **路由级别分割**: App Router 自动处理

### 4. 图片优化

- **Next.js Image**: 自动优化
- **懒加载**: 默认启用
- **响应式**: 多尺寸支持

---

## 安全设计

### 1. 认证安全

- OAuth 2.0 标准
- JWT Token 加密
- CSRF 保护
- Session 管理

### 2. API 安全

- **认证检查**: `getServerSession`
- **速率限制**: 防止滥用
- **输入验证**: Zod schema
- **错误处理**: 不泄露敏感信息

### 3. 数据库安全

- **参数化查询**: Prisma 自动处理
- **权限控制**: Row Level Security (RLS)
- **加密传输**: SSL/TLS

### 4. 环境变量

- 使用 `.env` 文件
- 不提交敏感信息
- 生产环境使用密钥管理服务

---

## 扩展性设计

### 1. 模块化架构

每个功能模块独立，易于扩展和替换。

### 2. 接口抽象

```typescript
interface NewsSource {
  fetch(category?: string): Promise<NewsArticle[]>
}

class NewsAPISource implements NewsSource {
  async fetch(category?: string) {
    // 实现
  }
}
```

### 3. 插件系统

可以轻松添加新的新闻源、AI 模型等。

### 4. 微服务就绪

模块之间松耦合，可以拆分为独立服务。

---

## 测试策略

### 1. 单元测试

- **工具**: Vitest
- **覆盖**: 核心业务逻辑
- **Mock**: 外部依赖

### 2. 集成测试

- **API 测试**: 测试端点
- **数据库测试**: 使用测试数据库

### 3. E2E 测试

- **工具**: Playwright (可选)
- **场景**: 关键用户流程

---

## 部署架构

### Vercel 部署

```
GitHub → Vercel CI/CD → Vercel Edge Network
```

**优势**:
- 自动部署
- 全球 CDN
- Serverless Functions
- 零配置

### 数据库部署

**推荐**: Neon 或 Supabase

**连接池**:
```typescript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 监控和日志

### 1. 应用监控

- Vercel Analytics
- Speed Insights
- Web Vitals

### 2. 错误追踪

- Try-catch 包装
- 错误日志记录
- 状态码标准化

### 3. 性能监控

- API 响应时间
- 数据库查询性能
- Cron 任务执行时间

---

## 未来规划

### 短期（1-3个月）

- [ ] 添加更多新闻源
- [ ] 实现用户偏好推荐
- [ ] 添加通知系统
- [ ] 优化移动端体验

### 中期（3-6个月）

- [ ] 实现实时更新（WebSocket）
- [ ] 添加社区功能（评论、点赞）
- [ ] 多语言支持
- [ ] 高级数据分析

### 长期（6-12个月）

- [ ] 机器学习推荐系统
- [ ] 自定义新闻源
- [ ] API 开放平台
- [ ] 移动应用

---

## 关键技术决策

### 为什么选择 Next.js App Router？

- ✅ 服务端渲染 (SSR)
- ✅ 静态生成 (SSG)
- ✅ API Routes
- ✅ 优秀的开发体验

### 为什么选择 Prisma？

- ✅ 类型安全
- ✅ 优秀的 DX
- ✅ 自动迁移
- ✅ 丰富的查询 API

### 为什么选择 pgvector？

- ✅ 原生 PostgreSQL 扩展
- ✅ 高性能向量搜索
- ✅ 与关系数据库集成
- ✅ 成本效益高

---

## 贡献指南

如需对架构提出建议或改进，请：

1. 创建 Issue 讨论
2. 提交 RFC (Request for Comments)
3. 在 Pull Request 中详细说明变更理由

---

**文档维护**: 请保持此文档与实际代码同步更新。
