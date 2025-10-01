# 📡 数据源架构文档

HotScan - 企业级数据源抽象层

---

## 🎯 设计目标

1. **接口抽象** - 统一的数据源接口，支持热插拔
2. **高可用性** - 自动故障转移和重试机制
3. **性能优化** - 智能缓存和批量查询
4. **可观测性** - 完整的日志和错误追踪

---

## 📊 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                     DataSourceManager                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • 多数据源管理和优先级                                │  │
│  │  • 自动故障转移                                        │  │
│  │  • 统一的错误处理和日志                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │  Mock    │        │ CoinGecko│        │  Custom  │
   │  Source  │        │  Source  │        │  Source  │
   └──────────┘        └──────────┘        └──────────┘
         ▼                    ▼                    ▼
   ┌──────────────────────────────────────────────────┐
   │              IDataSource Interface                │
   │  • fetchRecentCandles()                          │
   │  • fetchLiquidityAndHolders()                    │
   │  • fetchNewWalletNetBuy()                        │
   │  • fetchPrices()                                 │
   └──────────────────────────────────────────────────┘
                          ▼
   ┌──────────────────────────────────────────────────┐
   │              CacheManager                         │
   │  • RawMetric 表缓存                              │
   │  • 自动过期清理                                   │
   │  • 缓存统计                                       │
   └──────────────────────────────────────────────────┘
                          ▼
   ┌──────────────────────────────────────────────────┐
   │              RetryHandler                         │
   │  • 指数退避算法                                   │
   │  • 抖动（Jitter）                                │
   │  • 可配置的重试策略                              │
   └──────────────────────────────────────────────────┘
```

---

## 📁 文件结构

```
src/lib/data-sources/
├── types.ts                    # 接口定义和类型
├── mock-source.ts              # Mock 数据源实现
├── retry-handler.ts            # 重试处理器
├── data-source-manager.ts      # 数据源管理器
└── cache-manager.ts            # 缓存管理器

src/jobs/
└── ingest-data.ts             # 数据摄取任务

prisma/schema.prisma
└── RawMetric                   # 原始指标缓存表
```

---

## 🔌 IDataSource 接口

### 核心方法

#### 1. fetchRecentCandles()

**用途**: 获取K线数据

```typescript
fetchRecentCandles(
  symbols: string[],              // 资产符号 ['BTC', 'ETH']
  window: '5m' | '15m' | '1h' | '4h' | '1d',
  limit?: number                  // 默认 100
): Promise<Record<string, Candle[]>>
```

**返回数据**:
```typescript
{
  BTC: [
    {
      timestamp: Date,
      open: number,
      high: number,
      low: number,
      close: number,
      volume: number,
      volumeUSD: number
    },
    // ... more candles
  ],
  ETH: [...],
}
```

#### 2. fetchLiquidityAndHolders()

**用途**: 获取流动性和持仓数据

```typescript
fetchLiquidityAndHolders(
  pairs: Array<{
    address: string,
    dex: string,
    symbol: string,
    chain: string
  }>
): Promise<{
  liquidity: Record<string, LiquidityData>
  holders: Record<string, HolderData>
}>
```

**返回数据**:
```typescript
{
  liquidity: {
    '0x123...': {
      pairAddress: string,
      dex: string,
      liquidityUSD: number,
      volume24h: number,
      priceUSD: number,
      // ...
    }
  },
  holders: {
    'BTC': {
      symbol: string,
      totalHolders: number,
      top5HoldingPct: number,
      holderDistribution: [...],
      // ...
    }
  }
}
```

#### 3. fetchNewWalletNetBuy()

**用途**: 获取新钱包净买入数据

```typescript
fetchNewWalletNetBuy(
  symbol: string,
  timeRange?: number              // 默认 24 小时
): Promise<WalletActivityData>
```

**返回数据**:
```typescript
{
  symbol: string,
  newWalletCount: number,
  newWalletNetBuyUSD: number,
  totalBuyVolumeUSD: number,
  totalSellVolumeUSD: number,
  largeTransactions: [
    {
      hash: string,
      type: 'buy' | 'sell',
      amountUSD: number,
      timestamp: Date
    }
  ],
  updatedAt: Date
}
```

---

## 🔄 重试机制

### 指数退避算法

```typescript
delay = min(
  initialDelay * (backoffMultiplier ^ attempt),
  maxDelay
)

// 添加抖动（50% - 100%）
jitter = delay * (0.5 + random * 0.5)
```

### 默认配置

```typescript
{
  maxAttempts: 3,
  initialDelayMs: 1000,        // 1秒
  maxDelayMs: 30000,           // 30秒
  backoffMultiplier: 2,
  retryableErrors: [
    'RATE_LIMIT_EXCEEDED',
    'TIMEOUT',
    'NETWORK_ERROR',
    'SERVICE_UNAVAILABLE'
  ]
}
```

### 重试示例

```
Attempt 1: Immediate
Attempt 2: 1s + jitter (500ms - 1000ms)
Attempt 3: 2s + jitter (1s - 2s)
Attempt 4: 4s + jitter (2s - 4s)
...
```

---

## 💾 缓存策略

### RawMetric 表

```prisma
model RawMetric {
  id         String   @id @default(cuid())
  assetId    String?
  pairId     String?
  metricType String   // candle, liquidity, holder, wallet
  window     String?  // 5m, 15m, 1h, 4h, 1d
  data       Json     // 原始数据
  source     String   // 数据源名称
  fetchedAt  DateTime @default(now())
  expiresAt  DateTime?
  
  @@index([assetId, metricType])
  @@index([metricType, window])
}
```

### 过期时间

| 数据类型 | 过期时间 |
|----------|----------|
| 5m K线 | 5分钟 |
| 15m K线 | 15分钟 |
| 1h K线 | 1小时 |
| 4h K线 | 4小时 |
| 1d K线 | 24小时 |
| 流动性 | 5分钟 |
| 持仓 | 1小时 |
| 钱包活动 | 5分钟 |

---

## 🚀 使用示例

### 1. 注册数据源

```typescript
import { dataSourceManager } from '@/lib/data-sources/data-source-manager'
import { MockDataSource } from '@/lib/data-sources/mock-source'

// 注册 Mock 数据源
const mockSource = new MockDataSource()
dataSourceManager.register(mockSource, {
  enabled: true,
  priority: 100,
  retryConfig: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  },
})

// 列出所有数据源
console.log(dataSourceManager.listSources())
```

### 2. 获取数据（带自动故障转移）

```typescript
// 获取 K 线数据
const candles = await dataSourceManager.fetchRecentCandles(
  ['BTC', 'ETH'],
  '1h',
  100
)

// 获取流动性和持仓
const { liquidity, holders } = await dataSourceManager.fetchLiquidityAndHolders([
  {
    address: '0x123...',
    dex: 'uniswap-v3',
    symbol: 'ETH',
    chain: 'ethereum',
  },
])

// 获取钱包活动
const walletData = await dataSourceManager.fetchNewWalletNetBuy('BTC', 24)
```

### 3. 使用缓存

```typescript
import { cacheManager } from '@/lib/data-sources/cache-manager'

// 缓存数据
await cacheManager.cacheCandles(assetId, 'BTC', '1h', candles, 'mock')

// 获取缓存
const cached = await cacheManager.getCachedCandles(assetId, '1h')

// 清理过期缓存
const cleaned = await cacheManager.cleanExpiredCache()

// 获取统计
const stats = await cacheManager.getCacheStats()
```

---

## 🔧 定时任务

### 运行数据摄取

```bash
# 手动运行
pnpm jobs:ingest

# Vercel Cron (vercel.json)
{
  "crons": [
    {
      "path": "/api/jobs/ingest",
      "schedule": "*/5 * * * *"
    }
  ]
}

# GitHub Actions (.github/workflows/cron.yml)
- cron: "*/5 * * * *"
```

### 任务流程

```
1. 注册数据源
   ↓
2. 获取活跃资产列表
   ↓
3. 获取交易对
   ↓
4. 获取 K 线数据（5m, 1h, 4h）
   ├─ 批量获取
   ├─ 错误重试
   └─ 缓存到 RawMetric
   ↓
5. 获取流动性和持仓
   ├─ 更新 Pair 表
   └─ 缓存到 RawMetric
   ↓
6. 获取钱包活动
   └─ 缓存到 RawMetric
   ↓
7. 清理过期缓存
   ↓
8. 记录任务运行
   └─ JobRun 表
```

---

## 🔌 实现新数据源

### 步骤 1: 实现接口

```typescript
import type { IDataSource } from './types'

export class MyCustomSource implements IDataSource {
  readonly name = 'My Custom Source'
  readonly type = 'real' as const

  async isAvailable(): Promise<boolean> {
    // 检查 API 是否可用
    return true
  }

  async fetchRecentCandles(symbols, window, limit) {
    // 实现 K 线数据获取
  }

  async fetchLiquidityAndHolders(pairs) {
    // 实现流动性和持仓数据获取
  }

  async fetchNewWalletNetBuy(symbol, timeRange) {
    // 实现钱包活动数据获取
  }

  async fetchPrices(symbols) {
    // 实现价格获取
  }
}
```

### 步骤 2: 注册数据源

```typescript
import { MyCustomSource } from './my-custom-source'

const customSource = new MyCustomSource()
dataSourceManager.register(customSource, {
  enabled: true,
  priority: 200, // 高优先级
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
  },
  timeout: 30000,
})
```

### 步骤 3: 测试

```typescript
// 测试数据源
const isAvailable = await customSource.isAvailable()
console.log('Available:', isAvailable)

// 测试获取数据
const candles = await customSource.fetchRecentCandles(['BTC'], '1h', 10)
console.log('Candles:', candles)
```

---

## 📊 监控和日志

### 日志级别

```typescript
console.log('[DataSourceManager] ...')      // 信息
console.warn('[DataSourceManager] ...')     // 警告
console.error('[DataSourceManager] ...')    // 错误
```

### 关键日志

```
[MockDataSource] Fetching candles for BTC, ETH (1h)
[RetryHandler] fetchRecentCandles - Attempt 1/3
[RetryHandler] fetchRecentCandles succeeded (1234ms)
[CacheManager] Cached 100 candles for BTC (1h)
[DataSourceManager] Executing fetchRecentCandles with Mock Data Source
```

### 错误追踪

```typescript
try {
  await dataSourceManager.fetchRecentCandles(['BTC'], '1h')
} catch (error) {
  if (error instanceof DataSourceError) {
    console.error('Code:', error.code)
    console.error('Source:', error.source)
    console.error('Details:', error.details)
  }
}
```

---

## 🎯 最佳实践

### 1. 使用批量查询

```typescript
// ✅ 好：批量查询
const candles = await dataSourceManager.fetchRecentCandles(
  ['BTC', 'ETH', 'SOL'],
  '1h'
)

// ❌ 差：逐个查询
for (const symbol of ['BTC', 'ETH', 'SOL']) {
  await dataSourceManager.fetchRecentCandles([symbol], '1h')
}
```

### 2. 合理设置优先级

```typescript
// 优先级越高越优先使用
dataSourceManager.register(paidSource, { priority: 200 })    // 付费源
dataSourceManager.register(freeSource, { priority: 100 })    // 免费源
dataSourceManager.register(mockSource, { priority: 0 })      // Mock 源
```

### 3. 配置合适的重试策略

```typescript
// 对于速率限制严格的 API
{
  maxAttempts: 2,
  initialDelayMs: 2000,
  maxDelayMs: 60000,
  backoffMultiplier: 3
}

// 对于不稳定的 API
{
  maxAttempts: 5,
  initialDelayMs: 500,
  maxDelayMs: 30000,
  backoffMultiplier: 2
}
```

### 4. 监控缓存命中率

```typescript
const stats = await cacheManager.getCacheStats()
console.log('Cache hit rate:', stats.total / totalRequests)
```

---

## 🔗 相关文档

- [数据库设计](./DATABASE.md)
- [API 文档](./API_DOCUMENTATION.md)
- [OpenAPI 规范](./openapi.yaml)

---

**数据源架构完成！企业级、生产就绪！** 🚀
