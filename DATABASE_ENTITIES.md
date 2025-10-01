# 🗄️ 数据库实体设计总结

HotScan - 加密货币/DeFi 分析平台

---

## 📋 实体清单

| 实体 | 用途 | 关键字段 | 外键 | pgvector |
|------|------|----------|------|----------|
| **Asset** | 加密资产 | symbol, name, chain | - | ❌ |
| **Pair** | 交易对 | dex, address, liquidityUSD | assetId→Asset | ❌ |
| **Signal** | 交易信号 | window, priceChangePct, riskScore | assetId→Asset | ❌ |
| **Term** | 金融术语 | term, definition | - | ✅ vector(1536) |
| **Share** | 分享海报 | title, imageUrl | assetId→Asset | ❌ |
| **Subscription** | 用户订阅 | tag, channels | userId→User | ❌ |

---

## 📊 实体详细设计

### 1️⃣ Asset（加密资产）

**字段**:
```prisma
id              String    @id @default(cuid())
symbol          String    @unique               // "BTC", "ETH"
name            String                          // "Bitcoin"
chain           String                          // "ethereum", "solana"
logo            String?
decimals        Int       @default(18)
isActive        Boolean   @default(true)
createdAt       DateTime  @default(now())
updatedAt       DateTime  @updatedAt
```

**索引**:
- ✅ `symbol` (唯一)
- ✅ `chain`
- ✅ `createdAt`

**关系**:
- `pairs[]` → Pair (一对多)
- `signals[]` → Signal (一对多)
- `shares[]` → Share (一对多)

---

### 2️⃣ Pair（交易对）

**字段**:
```prisma
id              String    @id @default(cuid())
assetId         String    [FK → Asset]
dex             String                          // "uniswap-v3"
address         String                          // 合约地址
liquidityUSD    Float                           // 流动性（美元）
baseToken       String?                         // "USDT"
fee             Float?
isActive        Boolean   @default(true)
createdAt       DateTime  @default(now())
updatedAt       DateTime  @updatedAt
```

**外键**:
- ✅ `assetId` → `Asset.id` (CASCADE)

**索引**:
- ✅ `(assetId, dex, address)` (唯一复合)
- ✅ `assetId`
- ✅ `dex`
- ✅ `liquidityUSD DESC`
- ✅ `createdAt`

---

### 3️⃣ Signal（交易信号）⭐

**字段**:
```prisma
id                String    @id @default(cuid())
assetId           String    [FK → Asset]
window            String                        // "5m", "1h", "1d"

// 价格指标
priceChangePct    Float                         // 涨跌幅 %
currentPrice      Float?

// 成交量指标
volZScore         Float                         // 成交量 Z-Score
volumeUSD         Float?

// 流动性指标
liqDeltaPct       Float                         // 流动性变化 %
totalLiquidityUSD Float?

// 持仓分析
top5HoldPct       Float                         // 前5大持仓 %
holderCount       Int?

// 钱包活动
newWalletNetBuy   Float                         // 新钱包净买入
newWalletCount    Int?

// 风险评估
riskScore         Float                         // 0-100
contractAgeDays   Int

// AI 分析
sentiment         String?                       // bullish/bearish
aiSummary         String?   @db.Text
alertLevel        String?                       // low/medium/high

createdAt         DateTime  @default(now())
```

**外键**:
- ✅ `assetId` → `Asset.id` (CASCADE)

**索引（关键！）**:
- ✅ `assetId`
- ✅ `window`
- ✅ `riskScore DESC`
- ✅ `volZScore DESC`
- ⭐ **`(createdAt DESC, riskScore DESC)`** - 复合索引
- ✅ `createdAt DESC`

**设计亮点**:
- 复合索引优化：最新 + 高风险信号查询
- 多维度指标：价格、成交量、流动性、持仓、钱包
- AI 增强：情绪分析 + 智能摘要

---

### 4️⃣ Term（金融术语 - RAG）🤖

**字段**:
```prisma
id            String    @id @default(cuid())
term          String    @unique                 // "Liquidity Pool"
definition    String    @db.Text
category      String                            // defi/trading/blockchain
example       String?   @db.Text
embedding     Unsupported("vector(1536)")?      // 🔥 pgvector!
searchCount   Int       @default(0)
createdAt     DateTime  @default(now())
updatedAt     DateTime  @updatedAt
```

**索引**:
- ✅ `term` (唯一)
- ✅ `category`
- ✅ `searchCount DESC`

**pgvector 配置**:
```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}
```

**向量搜索**:
```sql
SELECT *, 1 - (embedding <=> $1::vector) as similarity
FROM "Term"
WHERE embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

---

### 5️⃣ Share（分享海报）

**字段**:
```prisma
id            String    @id @default(cuid())
assetId       String    [FK → Asset]
title         String
description   String?   @db.Text
imageUrl      String?
viewCount     Int       @default(0)
shareType     String    @default("signal")    // signal/analysis/alert
createdAt     DateTime  @default(now())
```

**外键**:
- ✅ `assetId` → `Asset.id` (CASCADE)

**索引**:
- ✅ `assetId`
- ✅ `viewCount DESC`
- ✅ `createdAt DESC`

---

### 6️⃣ Subscription（用户订阅）

**字段**:
```prisma
id          String    @id @default(cuid())
userId      String    [FK → User]
tag         String                            // "BTC", "high-volume"
enabled     Boolean   @default(true)
channels    String[]                          // ["email", "push"]
createdAt   DateTime  @default(now())
updatedAt   DateTime  @updatedAt
```

**外键**:
- ✅ `userId` → `User.id` (CASCADE)

**索引**:
- ✅ `(userId, tag)` (唯一复合)
- ✅ `userId`
- ✅ `tag`
- ✅ `enabled`

---

## 🔑 外键关系图

```
User
  └─→ subscriptions[] (Subscription)

Asset
  ├─→ pairs[] (Pair)
  ├─→ signals[] (Signal)
  └─→ shares[] (Share)

Pair
  └─→ asset (Asset.id)

Signal
  └─→ asset (Asset.id)

Share
  └─→ asset (Asset.id)

Subscription
  └─→ user (User.id)

Term
  (独立实体，通过向量相似度搜索关联)
```

---

## 📈 索引设计总结

### 单字段索引

| 表 | 索引字段 | 排序 | 用途 |
|----|----------|------|------|
| Asset | symbol | - | 唯一约束 + 快速查找 |
| Asset | chain | - | 按链筛选 |
| Asset | createdAt | - | 时间排序 |
| Pair | assetId | - | 关联查询 |
| Pair | dex | - | 按 DEX 筛选 |
| Pair | liquidityUSD | DESC | 流动性排行 |
| Signal | assetId | - | 关联查询 |
| Signal | window | - | 按时间窗口筛选 |
| Signal | riskScore | DESC | 风险排序 |
| Signal | volZScore | DESC | 异常成交量 |
| Term | term | - | 唯一约束 |
| Term | category | - | 分类筛选 |
| Share | assetId | - | 关联查询 |

### 复合索引

| 表 | 索引字段 | 排序 | 用途 |
|----|----------|------|------|
| Pair | (assetId, dex, address) | - | 唯一性保证 |
| **Signal** | **(createdAt, riskScore)** | **DESC, DESC** | **最新高风险信号** ⭐ |
| Subscription | (userId, tag) | - | 唯一订阅 |

---

## 🚀 数据库命令速查

### 基础命令

```bash
# 推送 Schema（开发环境）
npx prisma db push

# 生成客户端
npx prisma generate

# 填充数据
npx prisma db seed
# 或
pnpm db:seed

# 打开 Studio
npx prisma studio
# 或
pnpm db:studio
```

### 迁移命令（生产环境）

```bash
# 创建迁移
npx prisma migrate dev --name init

# 应用迁移
npx prisma migrate deploy

# 查看状态
npx prisma migrate status

# 重置数据库
npx prisma migrate reset
# 或
pnpm db:reset
```

### 验证命令

```bash
# 连接数据库
psql $DATABASE_URL

# 列出所有表
\dt

# 查看表结构
\d "Signal"

# 查看索引
\di

# 检查 pgvector
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## 📊 示例查询

### 1. 查询最新高风险信号（使用复合索引）

```typescript
const signals = await prisma.signal.findMany({
  where: {
    riskScore: { gte: 60 },
  },
  orderBy: [
    { createdAt: 'desc' },
    { riskScore: 'desc' },
  ],
  include: {
    asset: true,
  },
  take: 20,
})
```

```sql
-- SQL 等价
SELECT s.*, a.*
FROM "Signal" s
JOIN "Asset" a ON s."assetId" = a.id
WHERE s."riskScore" >= 60
ORDER BY s."createdAt" DESC, s."riskScore" DESC
LIMIT 20;

-- 会使用索引: Signal_createdAt_riskScore_idx ✅
```

### 2. 查询流动性最高的交易对

```typescript
const topPairs = await prisma.pair.findMany({
  where: {
    isActive: true,
  },
  orderBy: {
    liquidityUSD: 'desc',
  },
  include: {
    asset: true,
  },
  take: 10,
})
```

### 3. 术语向量搜索

```typescript
import { prisma } from '@/lib/prisma'

async function searchTerms(query: string) {
  // 1. 获取查询向量
  const embedding = await getEmbedding(query)
  
  // 2. 向量相似度搜索（Raw SQL）
  const results = await prisma.$queryRaw`
    SELECT 
      id,
      term,
      definition,
      category,
      1 - (embedding <=> ${embedding}::vector) as similarity
    FROM "Term"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT 5
  `
  
  return results
}
```

### 4. 用户订阅的资产信号

```typescript
const userSignals = await prisma.subscription.findMany({
  where: {
    userId: currentUser.id,
    enabled: true,
  },
  include: {
    // 需要通过 tag 匹配 Asset.symbol
  },
})

// 然后查询对应的信号
const signals = await prisma.signal.findMany({
  where: {
    asset: {
      symbol: {
        in: userSignals.map(sub => sub.tag),
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  include: {
    asset: true,
  },
})
```

---

## 🎯 性能优化建议

### 1. 查询优化

```typescript
// ✅ 好：使用复合索引
await prisma.signal.findMany({
  orderBy: [
    { createdAt: 'desc' },
    { riskScore: 'desc' },
  ],
})

// ❌ 差：顺序不对，不会使用复合索引
await prisma.signal.findMany({
  orderBy: [
    { riskScore: 'desc' },
    { createdAt: 'desc' },  // 顺序反了！
  ],
})
```

### 2. 分页查询

```typescript
// ✅ 使用 cursor-based 分页
await prisma.signal.findMany({
  take: 20,
  skip: 1,
  cursor: {
    id: lastSignalId,
  },
  orderBy: {
    createdAt: 'desc',
  },
})
```

### 3. 选择性字段

```typescript
// ✅ 只选择需要的字段
await prisma.signal.findMany({
  select: {
    id: true,
    assetId: true,
    riskScore: true,
    createdAt: true,
    asset: {
      select: {
        symbol: true,
        name: true,
      },
    },
  },
})
```

---

## 🔒 数据完整性

### 外键约束（已配置）

- ✅ `Pair.assetId` → `Asset.id` (CASCADE)
- ✅ `Signal.assetId` → `Asset.id` (CASCADE)
- ✅ `Share.assetId` → `Asset.id` (CASCADE)
- ✅ `Subscription.userId` → `User.id` (CASCADE)

### 唯一约束（已配置）

- ✅ `Asset.symbol` - 防止重复代币
- ✅ `Pair(assetId, dex, address)` - 防止重复交易对
- ✅ `Term.term` - 防止重复术语
- ✅ `Subscription(userId, tag)` - 防止重复订阅

---

## 📚 相关文档

- [DATABASE.md](./DATABASE.md) - 完整数据库文档
- [MIGRATION_GUIDE.md](./prisma/migrations/MIGRATION_GUIDE.md) - 迁移指南
- [prisma/schema.prisma](./prisma/schema.prisma) - Schema 源文件
- [prisma/seed.ts](./prisma/seed.ts) - 种子数据

---

**数据库设计完成！生产就绪！** 🚀
