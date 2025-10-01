# 📖 OpenAPI 使用指南

HotScan API 规范文档使用说明

---

## 📊 文件统计

```
文件大小: 1028 行
API 端点: 6 个
响应示例: 20+ 个
错误类型: 5 种
```

---

## 🎯 快速预览

### 在线查看（推荐）

**Swagger Editor**:
```
https://editor.swagger.io/?url=https://raw.githubusercontent.com/your-repo/hotscan/main/openapi.yaml
```

**Redocly**:
```bash
npx @redocly/cli preview-docs openapi.yaml
# 访问 http://localhost:8080
```

**Swagger UI**:
```bash
npx swagger-ui-watcher openapi.yaml
# 自动打开浏览器
```

---

## 📋 API 端点总览

| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/api/signals` | 获取交易信号列表 | 🔓 公开 |
| GET | `/api/assets/{id}` | 获取资产详情 | 🔓 公开 |
| GET | `/api/learn` | RAG 术语问答 | 🔓 公开 |
| POST | `/api/share` | 生成分享海报 | 🔓 公开 |
| POST | `/api/jobs/fetch-tickers` | 触发数据抓取 | 🔒 需要认证 |
| POST | `/api/jobs/make-signals` | 触发信号生成 | 🔒 需要认证 |

---

## 🔑 关键特性

### 1. GET /api/signals

**特点**:
- ⭐ 使用复合索引 `(createdAt DESC, riskScore DESC)`
- 📊 返回完整的信号数据 + 关联资产
- 🎯 支持多维度过滤（时间窗口、风险分数、情绪等）

**查询参数**:
```yaml
window: 5m | 15m | 1h | 4h | 1d
limit: 1-100 (默认 20)
minRiskScore: 0-100
assetSymbol: BTC, ETH, etc.
sentiment: bullish | bearish | neutral
```

**响应结构**:
```typescript
{
  success: boolean
  data: Array<{
    id: string
    assetId: string
    window: string
    priceChangePct: number
    volZScore: number
    riskScore: number
    sentiment: string
    aiSummary: string
    asset: {
      id: string
      symbol: string
      name: string
      chain: string
    }
  }>
  meta: {
    total: number
    limit: number
    window: string
  }
}
```

---

### 2. GET /api/assets/{id}

**特点**:
- 📈 完整的资产信息
- 💱 关联的交易对（DEX）
- 📊 最新的交易信号
- 📉 统计数据

**查询参数**:
```yaml
includeSignals: boolean (默认 true)
includePairs: boolean (默认 true)
signalLimit: 1-50 (默认 5)
```

**响应包含**:
- 基础信息（symbol, name, chain, logo）
- 交易对列表（dex, liquidityUSD）
- 最新信号（按时间降序）
- 统计数据（totalSignals, avgRiskScore, last24hChange）

---

### 3. GET /api/learn

**特点**:
- 🤖 RAG（检索增强生成）
- 🔍 语义搜索（pgvector）
- 📚 知识来源追溯
- 🔗 相关术语推荐

**工作流程**:
```
用户问题
  ↓
OpenAI Embeddings (生成向量)
  ↓
pgvector 语义搜索 (找到相关术语)
  ↓
GPT-4 生成回答 (基于检索到的知识)
  ↓
返回回答 + 来源 + 相关术语
```

**响应结构**:
```typescript
{
  success: boolean
  data: {
    answer: string           // AI 生成的回答
    sources: Array<{         // 知识来源
      term: string
      definition: string
      category: string
      similarity: number     // 相似度 0-1
    }>
    relatedTerms: string[]   // 相关术语
    confidence: number       // 置信度 0-1
  }
}
```

---

### 4. POST /api/share

**特点**:
- 📱 生成 9:16 海报
- 🎨 多种模板（signal, analysis, alert）
- ☁️ 自动上传 CDN
- ⏰ 过期时间（7天）

**请求体**:
```typescript
{
  assetId: string           // 必需
  title: string             // 必需
  description?: string
  metrics?: {
    price?: number
    change24h?: number
    riskScore?: number
    sentiment?: string
  }
  template?: 'signal' | 'analysis' | 'alert'
}
```

**响应**:
```typescript
{
  success: boolean
  data: {
    shareId: string         // 分享 ID
    imageUrl: string        // 海报 URL
    shareUrl: string        // 分享页面 URL
    expiresAt: string       // 过期时间
  }
}
```

---

### 5. POST /api/jobs/fetch-tickers 🔒

**特点**:
- 🔐 需要 `X-Cron-Secret` 认证
- 📊 抓取多个数据源（Alpha Vantage, CoinGecko）
- ⚡ 支持强制刷新
- 📈 可配置抓取数量

**触发方式**:
- Vercel Cron（定时）
- GitHub Actions（定时）
- 手动触发（开发/测试）

---

### 6. POST /api/jobs/make-signals 🔒

**特点**:
- 🔐 需要 `X-Cron-Secret` 认证
- 🤖 AI 驱动的信号生成
- 📊 多维度分析（价格、成交量、流动性、持仓）
- ⏰ 可配置时间窗口

**分析维度**:
- 价格变化 (priceChangePct)
- 成交量异常 (volZScore)
- 流动性变化 (liqDeltaPct)
- 持仓集中度 (top5HoldPct)
- 新钱包活动 (newWalletNetBuy)
- AI 情绪分析 (sentiment)

---

## ❌ 错误处理

### 统一错误格式

```typescript
{
  success: false
  error: {
    code: string           // 错误代码
    message: string        // 人类可读的消息
    details?: object       // 详细信息
    timestamp: string      // ISO 8601 时间戳
  }
}
```

### 错误码列表

| HTTP | 错误码 | 说明 |
|------|--------|------|
| 400 | `VALIDATION_ERROR` | 参数验证失败 |
| 400 | `MISSING_PARAMETER` | 缺少必需参数 |
| 401 | `UNAUTHORIZED` | 缺少认证信息 |
| 401 | `INVALID_CREDENTIALS` | 认证凭证无效 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 429 | `RATE_LIMIT_EXCEEDED` | 超过频率限制 |
| 500 | `INTERNAL_SERVER_ERROR` | 服务器错误 |
| 500 | `DATABASE_ERROR` | 数据库错误 |

---

## 🧪 测试

### 使用 cURL

```bash
# 1. 获取信号
curl "https://hotscan.vercel.app/api/signals?window=1h&limit=5"

# 2. 获取资产
curl "https://hotscan.vercel.app/api/assets/clx456def"

# 3. RAG 问答
curl -G "https://hotscan.vercel.app/api/learn" \
  --data-urlencode "q=什么是无常损失？"

# 4. 生成海报
curl -X POST https://hotscan.vercel.app/api/share \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "clx456def",
    "title": "BTC 突破",
    "metrics": {"price": 67234.50}
  }'

# 5. 触发任务（需要认证）
curl -X POST https://hotscan.vercel.app/api/jobs/make-signals \
  -H "X-Cron-Secret: your_secret_here"
```

### 使用 HTTPie

```bash
# 安装 HTTPie
brew install httpie

# 获取信号
http GET "https://hotscan.vercel.app/api/signals" window==1h limit==5

# 生成海报
http POST https://hotscan.vercel.app/api/share \
  assetId=clx456def \
  title="BTC 突破"

# 触发任务
http POST https://hotscan.vercel.app/api/jobs/make-signals \
  X-Cron-Secret:$CRON_SECRET
```

### 使用 Postman

1. 导入 `openapi.yaml`
2. Postman 会自动生成集合
3. 配置环境变量（`base_url`, `cron_secret`）
4. 开始测试

---

## 📦 集成示例

### Next.js App Router

```typescript
// app/api/signals/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const window = searchParams.get('window') || '1h'
  const limit = parseInt(searchParams.get('limit') || '20')

  const signals = await prisma.signal.findMany({
    where: { window },
    orderBy: [
      { createdAt: 'desc' },
      { riskScore: 'desc' },
    ],
    include: { asset: true },
    take: limit,
  })

  return Response.json({
    success: true,
    data: signals,
    meta: { total: signals.length, limit, window },
  })
}
```

### React Hook

```typescript
// hooks/useSignals.ts
import useSWR from 'swr'

export function useSignals(window = '1h', limit = 20) {
  const { data, error, isLoading } = useSWR(
    `/api/signals?window=${window}&limit=${limit}`,
    fetcher
  )

  return {
    signals: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
  }
}
```

---

## 🔒 安全最佳实践

### 1. API 密钥保护

```bash
# .env (不要提交到 Git)
CRON_SECRET="use_a_long_random_string_here"

# .env.example (可以提交)
CRON_SECRET="your_cron_secret_here"
```

### 2. 频率限制

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
})

export async function middleware(request: Request) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '请求频率超过限制',
        },
      },
      { status: 429 }
    )
  }
}
```

### 3. 输入验证

```typescript
import { z } from 'zod'

const SignalsQuerySchema = z.object({
  window: z.enum(['5m', '15m', '1h', '4h', '1d']).optional(),
  limit: z.number().min(1).max(100).default(20),
  minRiskScore: z.number().min(0).max(100).optional(),
})

export async function GET(request: Request) {
  const params = SignalsQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams)
  )
  // ... 安全地使用 params
}
```

---

## 📚 相关文档

- [OpenAPI 规范](./openapi.yaml) - 完整的 API 规范
- [API 文档](./API_DOCUMENTATION.md) - 详细的 API 文档
- [数据库设计](./DATABASE.md) - 数据库结构
- [项目 README](./README-V2.md) - 项目总览

---

## 🛠 开发工具

### VS Code 扩展

- **OpenAPI (Swagger) Editor** - 语法高亮和验证
- **REST Client** - 直接在 VS Code 中测试 API
- **Thunder Client** - API 测试工具

### CLI 工具

```bash
# 验证 OpenAPI 规范
npx @redocly/cli lint openapi.yaml

# 生成客户端代码
npx openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./generated

# 生成 Postman 集合
npx openapi-to-postmanv2 \
  -s openapi.yaml \
  -o postman_collection.json
```

---

## ✅ 验证清单

- [x] 6 个 API 端点定义完整
- [x] 所有端点包含请求/响应示例
- [x] 错误响应格式统一（400/401/404/429/500）
- [x] 认证机制（X-Cron-Secret）
- [x] 频率限制说明
- [x] JSON Schema 定义
- [x] 复合索引查询说明
- [x] RAG 工作流程说明
- [x] 海报生成流程说明
- [x] 任务触发机制说明

---

**OpenAPI 规范完成！立即开始使用！** 🚀

```bash
# 预览文档
npx @redocly/cli preview-docs openapi.yaml

# 或使用在线编辑器
open https://editor.swagger.io/
```
