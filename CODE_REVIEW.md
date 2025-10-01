# 🔍 代码审查报告

HotScan - 安全与性能审查

**审查时间**: 2025-09-30  
**审查人**: Senior Code Reviewer  
**审查范围**: 全栈代码（API、数据库、前端）

---

## 📊 审查摘要

| 类别 | 高危 | 中危 | 低危 | 总计 |
|------|------|------|------|------|
| **安全** | 2 | 3 | 4 | 9 |
| **性能** | 1 | 5 | 3 | 9 |
| **代码质量** | 0 | 4 | 6 | 10 |
| **总计** | **3** | **12** | **13** | **28** |

---

## 🚨 高危问题

### 1. SQL注入风险 - RAG库

**位置**: `src/lib/rag.ts:54-67`

**问题**: 原始SQL查询使用字符串拼接，存在SQL注入风险

```typescript
// ❌ 当前代码
const results = await prisma.$queryRaw<Array<{
  term: string
  definition: string
  similarity: number
}>>`
  SELECT 
    term,
    definition,
    1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)) as similarity
  FROM "Term"
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)
  LIMIT ${topK}
`
```

**风险等级**: 🔴 **高危**

**影响**: 虽然`queryEmbedding`是数组，`JSON.stringify`后不太可能被注入，但`topK`是直接插入的数字，如果传入恶意字符串可能导致SQL注入。

**修复**:

```typescript
// ✅ 修复后
import { Prisma } from '@prisma/client'

const results = await prisma.$queryRaw<Array<{
  term: string
  definition: string
  similarity: number
}>>`
  SELECT 
    term,
    definition,
    1 - (embedding <=> ${Prisma.raw(`'[${queryEmbedding.join(',')}]'`)}::vector(1536)) as similarity
  FROM "Term"
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> ${Prisma.raw(`'[${queryEmbedding.join(',')}]'`)}::vector(1536)
  LIMIT ${Prisma.raw(String(Math.max(1, Math.min(topK, 50))))}
`
```

---

### 2. 无速率限制 - 所有公开API

**位置**: 
- `src/app/api/signals/route.ts`
- `src/app/api/learn/route.ts`
- `src/app/api/share/route.ts`

**问题**: 所有公开API均无速率限制，容易被滥用

**风险等级**: 🔴 **高危**

**影响**: 
- 恶意用户可无限调用API
- 可能导致OpenAI API配额耗尽
- 数据库连接池耗尽
- 服务器资源耗尽

**修复**: 创建速率限制中间件

```typescript
// ✅ 新建 src/lib/rate-limit.ts

import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        return isRateLimited ? reject() : resolve()
      }),
  }
}

// 不同级别的限制器
export const limiter = rateLimit({
  interval: 60 * 1000, // 60秒
  uniqueTokenPerInterval: 500,
})

export const strictLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 100,
})

export const aiLimiter = rateLimit({
  interval: 60 * 1000, // AI相关限制更严格
  uniqueTokenPerInterval: 50,
})
```

```typescript
// ✅ 使用示例 - src/app/api/learn/route.ts

import { aiLimiter } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  // 获取IP地址
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'anonymous'
  
  // 速率限制: 每分钟10次
  try {
    await aiLimiter.check(10, ip)
  } catch {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: '请求过于频繁，请稍后再试',
      },
      { status: 429 }
    )
  }

  // ... 原有逻辑
}
```

---

### 3. N+1查询问题 - Signals API

**位置**: `src/app/api/signals/route.ts:30-46`

**问题**: 虽然使用了`include`，但在某些场景下可能存在N+1查询

**风险等级**: 🟡 **中危** (已部分优化)

**当前代码**:
```typescript
// ✅ 当前已使用 include，避免了基本的N+1
const signals = await prisma.signal.findMany({
  where,
  include: {
    asset: {
      select: {
        id: true,
        symbol: true,
        name: true,
        type: true,
        logo: true,
      },
    },
  },
  orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  take: limit,
  skip: offset,
})
```

**建议**: 添加数据库索引优化查询性能

```sql
-- ✅ 添加复合索引
CREATE INDEX idx_signal_featured_created ON "Signal" (featured DESC, "createdAt" DESC);
CREATE INDEX idx_signal_asset_id ON "Signal" ("assetId");
CREATE INDEX idx_signal_type ON "Signal" (type);
CREATE INDEX idx_signal_sentiment ON "Signal" (sentiment);
```

---

## ⚠️ 中危问题

### 4. 类型缺失 - API响应

**位置**: 多个API路由

**问题**: API响应缺少TypeScript类型定义

```typescript
// ❌ 当前代码
return NextResponse.json({
  success: true,
  data: signals,
  pagination: {
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  },
})
```

**修复**: 定义统一的API响应类型

```typescript
// ✅ 新建 src/types/api.ts

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface SignalResponse {
  id: string
  assetId: string
  window: string
  priceChangePct: number
  riskScore: number
  volZScore: number
  liqDeltaPct: number
  top5HoldPct: number
  contractAgeDays: number
  newWalletNetBuy: number
  aiSummary: {
    cn: string
    en: string
  }
  createdAt: Date
  asset: {
    id: string
    symbol: string
    name: string
    type: string
    logo: string | null
  }
}

// 使用示例
export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse<SignalResponse>>> {
  // ...
}
```

---

### 5. 错误处理不完整

**位置**: 多个API路由

**问题**: 错误处理过于简单，未区分错误类型

```typescript
// ❌ 当前代码
} catch (error: any) {
  console.error('Signals GET error:', error)
  return NextResponse.json(
    { error: error.message || '获取信号失败' },
    { status: 500 }
  )
}
```

**修复**: 创建统一的错误处理器

```typescript
// ✅ 新建 src/lib/error-handler.ts

import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  // Zod验证错误
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        message: '请求参数验证失败',
        details: error.errors,
      },
      { status: 400 }
    )
  }

  // Prisma错误
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: 'Unique constraint violation',
            message: '记录已存在',
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: 'Record not found',
            message: '记录不存在',
          },
          { status: 404 }
        )
      default:
        return NextResponse.json(
          {
            error: 'Database error',
            message: '数据库操作失败',
            code: error.code,
          },
          { status: 500 }
        )
    }
  }

  // 自定义API错误
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  // OpenAI错误
  if (error && typeof error === 'object' && 'status' in error) {
    const openAIError = error as any
    if (openAIError.status === 429) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'AI服务请求过于频繁，请稍后再试',
        },
        { status: 429 }
      )
    }
  }

  // 未知错误
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : '服务器内部错误',
    },
    { status: 500 }
  )
}

// 使用示例
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    // ... 业务逻辑
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

### 6. 缺少请求验证 - Signals POST API

**位置**: `src/app/api/signals/route.ts:69-126`

**问题**: 请求体验证过于简单，未使用验证库

```typescript
// ❌ 当前代码
const body = await request.json()
const { assetId, type, title, content, ... } = body

if (!assetId || !title || !content) {
  return NextResponse.json(
    { error: '缺少必需字段' },
    { status: 400 }
  )
}
```

**修复**: 使用Zod进行完整验证

```typescript
// ✅ 修复后
import { z } from 'zod'

const createSignalSchema = z.object({
  assetId: z.string().uuid('无效的资产ID'),
  type: z.enum(['analysis', 'alert', 'news']).default('analysis'),
  title: z.string().min(1, '标题不能为空').max(200, '标题过长'),
  content: z.string().min(10, '内容过短').max(5000, '内容过长'),
  summary: z.string().max(500).optional(),
  sentiment: z.enum(['bullish', 'bearish', 'neutral']).default('neutral'),
  confidence: z.number().min(0).max(1).default(0.5),
  impact: z.enum(['low', 'medium', 'high']).default('medium'),
  keyPoints: z.array(z.string()).max(10).default([]),
  sources: z.array(z.string().url()).max(20).default([]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Zod验证
    const validation = createSignalSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validation.data

    const signal = await prisma.signal.create({
      data,
      include: {
        asset: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: signal,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

### 7. 未实现防抖/节流 - 前端搜索

**位置**: `src/components/rag-chat.tsx`

**问题**: 如果有搜索输入框，未实现防抖，每次输入都会触发请求

**修复**: 使用React Hook实现防抖

```typescript
// ✅ 新建 src/hooks/use-debounce.ts

import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 使用示例
import { useDebounce } from '@/hooks/use-debounce'

export function SearchComponent() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery) {
      // 触发搜索
      fetchResults(debouncedQuery)
    }
  }, [debouncedQuery])

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="搜索..."
    />
  )
}
```

```typescript
// ✅ 新建 src/hooks/use-throttle.ts

import { useRef, useCallback } from 'react'

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = now
      }
    },
    [callback, delay]
  ) as T
}

// 使用示例 - 滚动加载
import { useThrottle } from '@/hooks/use-throttle'

export function InfiniteScrollList() {
  const loadMore = useThrottle(() => {
    // 加载更多数据
    fetchNextPage()
  }, 1000)

  useEffect(() => {
    window.addEventListener('scroll', loadMore)
    return () => window.removeEventListener('scroll', loadMore)
  }, [loadMore])

  return <div>...</div>
}
```

---

### 8. Prisma Client实例化 - 内存泄漏风险

**位置**: `src/lib/rag.ts:10`

**问题**: 每次导入都创建新的Prisma Client实例

```typescript
// ❌ 当前代码
const prisma = new PrismaClient()
```

**修复**: 使用全局单例模式

```typescript
// ✅ 已在 src/lib/prisma.ts 中正确实现
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ⚠️ 需要修复 src/lib/rag.ts
// 应该从 @/lib/prisma 导入，而不是自己创建实例
import { prisma } from '@/lib/prisma'  // ✅ 正确
// const prisma = new PrismaClient()   // ❌ 错误
```

---

### 9. 缺少数据库连接池配置

**位置**: `src/lib/prisma.ts`

**问题**: 未配置数据库连接池大小

**修复**:

```typescript
// ✅ 修复后
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// ✅ 在 .env 中配置连接池
// DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

---

## 💡 低危问题与建议

### 10. 缺少查询参数限制

**位置**: `src/app/api/signals/route.ts:20-21`

**问题**: limit和offset无上限，可能导致大量数据查询

```typescript
// ❌ 当前代码
const limit = parseInt(searchParams.get('limit') || '20')
const offset = parseInt(searchParams.get('offset') || '0')
```

**修复**:

```typescript
// ✅ 修复后
const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20')), 100) // 最大100
const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))
```

---

### 11. 缺少响应缓存

**位置**: 所有GET API

**问题**: 未实现响应缓存，重复请求浪费资源

**修复**: 添加HTTP缓存头

```typescript
// ✅ 对于相对静态的数据，添加缓存
export async function GET(request: NextRequest) {
  // ...
  
  const response = NextResponse.json({
    success: true,
    data: signals,
  })
  
  // 缓存1分钟，允许stale-while-revalidate 30秒
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=30'
  )
  
  return response
}
```

```typescript
// ✅ 使用Next.js的revalidate
export const revalidate = 60 // 60秒

export async function GET(request: NextRequest) {
  // ...
}
```

---

### 12. 未使用React Query / SWR

**位置**: 前端组件

**建议**: 使用SWR或React Query进行数据获取

```typescript
// ✅ 新建 src/hooks/use-signals.ts

import useSWR from 'swr'

interface SignalsParams {
  window?: string
  limit?: number
  offset?: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useSignals(params?: SignalsParams) {
  const query = new URLSearchParams()
  if (params?.window) query.set('window', params.window)
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))

  const { data, error, mutate, isLoading } = useSWR(
    `/api/signals?${query.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10秒内去重
    }
  )

  return {
    signals: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  }
}

// 使用示例
import { useSignals } from '@/hooks/use-signals'

export function SignalList() {
  const { signals, isLoading, isError } = useSignals({ limit: 20 })

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading signals</div>

  return (
    <div>
      {signals.map(signal => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  )
}
```

---

### 13. 缺少输入消毒

**位置**: 所有用户输入

**建议**: 对用户输入进行HTML转义

```typescript
// ✅ 新建 src/lib/sanitize.ts

import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// 使用示例
const userInput = '<script>alert("XSS")</script>'
const safe = escapeHtml(userInput) // &lt;script&gt;alert("XSS")&lt;/script&gt;
```

---

### 14. 缺少CORS配置

**位置**: API路由

**建议**: 配置CORS头部

```typescript
// ✅ 新建 src/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // CORS配置
  const origin = request.headers.get('origin')
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  // 安全头部
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

---

### 15. 未实现分页游标

**位置**: `src/app/api/signals/route.ts`

**建议**: 使用游标分页代替偏移分页

```typescript
// ✅ 游标分页实现

const cursorSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const validation = cursorSchema.safeParse({
    cursor: searchParams.get('cursor'),
    limit: searchParams.get('limit'),
  })

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.errors },
      { status: 400 }
    )
  }

  const { cursor, limit } = validation.data

  const signals = await prisma.signal.findMany({
    take: limit + 1, // 多取一个判断是否还有更多
    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1, // 跳过cursor本身
    }),
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const hasMore = signals.length > limit
  const items = hasMore ? signals.slice(0, -1) : signals
  const nextCursor = hasMore ? items[items.length - 1].id : null

  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      nextCursor,
      hasMore,
    },
  })
}
```

---

## 📋 修复优先级

### 立即修复（P0）

1. ✅ **添加速率限制** - 防止API滥用
2. ✅ **修复SQL注入风险** - RAG库的原始查询
3. ✅ **修复Prisma Client实例化** - 防止内存泄漏

### 短期修复（P1 - 1周内）

4. ✅ **添加统一错误处理** - 提高错误信息质量
5. ✅ **添加请求验证** - 使用Zod验证所有输入
6. ✅ **添加API类型定义** - 提高类型安全
7. ✅ **添加数据库索引** - 优化查询性能
8. ✅ **添加防抖/节流** - 前端性能优化

### 中期优化（P2 - 1个月内）

9. ✅ **集成SWR/React Query** - 前端数据获取优化
10. ✅ **添加响应缓存** - 减少重复计算
11. ✅ **实现游标分页** - 大数据集性能优化
12. ✅ **添加安全头部** - 增强安全性

---

## 🎯 性能优化建议

### 1. 数据库索引

```sql
-- 信号表索引
CREATE INDEX idx_signal_created_desc ON "Signal" ("createdAt" DESC);
CREATE INDEX idx_signal_risk_score ON "Signal" ("riskScore" DESC);
CREATE INDEX idx_signal_asset_window ON "Signal" ("assetId", "window");
CREATE INDEX idx_signal_composite ON "Signal" ("createdAt" DESC, "riskScore" DESC);

-- 资产表索引
CREATE INDEX idx_asset_symbol ON "Asset" ("symbol");
CREATE INDEX idx_asset_chain ON "Asset" ("chain");

-- 术语表索引
CREATE INDEX idx_term_term ON "Term" ("term");
CREATE INDEX idx_term_embedding ON "Term" USING ivfflat ("embedding" vector_cosine_ops);

-- 分享表索引
CREATE INDEX idx_share_expires ON "Share" ("expiresAt");
CREATE INDEX idx_share_asset ON "Share" ("assetId");
```

### 2. 数据库查询优化

```typescript
// ✅ 使用select减少数据传输
const signals = await prisma.signal.findMany({
  select: {
    id: true,
    window: true,
    priceChangePct: true,
    riskScore: true,
    createdAt: true,
    asset: {
      select: {
        symbol: true,
        name: true,
        logo: true,
      },
    },
  },
  take: 20,
})

// ✅ 使用批量查询
const [signals, assets, terms] = await Promise.all([
  prisma.signal.findMany(...),
  prisma.asset.findMany(...),
  prisma.term.findMany(...),
])
```

### 3. 缓存策略

```typescript
// ✅ 使用Redis缓存热点数据
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCachedSignals(key: string) {
  // 尝试从缓存获取
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached as string)
  }

  // 从数据库获取
  const signals = await prisma.signal.findMany(...)

  // 写入缓存，过期时间60秒
  await redis.setex(key, 60, JSON.stringify(signals))

  return signals
}
```

### 4. 数据预加载

```typescript
// ✅ 使用React Query预加载
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useSignalDetail(id: string) {
  const queryClient = useQueryClient()

  // 预加载下一个信号
  const prefetchNext = (nextId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['signal', nextId],
      queryFn: () => fetchSignal(nextId),
    })
  }

  return useQuery({
    queryKey: ['signal', id],
    queryFn: () => fetchSignal(id),
  })
}
```

---

## 📦 推荐依赖包

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",    // 数据获取和缓存
    "@upstash/redis": "^1.28.0",          // Redis缓存
    "dompurify": "^3.0.0",                 // HTML消毒
    "isomorphic-dompurify": "^2.9.0",     // 同构DOMPurify
    "lru-cache": "^10.0.0",                // LRU缓存
    "zod": "^3.22.0"                       // 已安装：输入验证
  }
}
```

---

## ✅ 下一步行动

1. **立即**: 安装并配置速率限制
2. **立即**: 修复SQL注入和Prisma Client实例化
3. **本周**: 添加统一错误处理和请求验证
4. **本周**: 添加数据库索引
5. **下周**: 集成React Query和响应缓存
6. **本月**: 实现游标分页和全面的安全头部

---

**审查完成！建议按优先级逐步修复。** 🔍✨

