# 🗄️ 数据库设计文档

HotScan - 加密货币/DeFi 分析平台数据库架构

---

## 📊 核心实体

### 1. Asset（加密资产）

**用途**: 存储加密货币/代币的基础信息

**字段**:
```prisma
- id: String (CUID)
- symbol: String (唯一) - 代币符号，如 "BTC", "ETH"
- name: String - 完整名称，如 "Bitcoin"
- chain: String - 区块链，如 "ethereum", "solana"
- logo: String? - Logo URL
- decimals: Int - 精度位数（默认 18）
- isActive: Boolean - 是否活跃
- createdAt: DateTime
- updatedAt: DateTime
```

**索引**:
- `symbol` (唯一索引)
- `chain`
- `createdAt`

**关系**:
- `pairs[]` - 一对多交易对
- `signals[]` - 一对多交易信号
- `shares[]` - 一对多分享

---

### 2. Pair（交易对）

**用途**: 存储 DEX 上的交易对信息和流动性数据

**字段**:
```prisma
- id: String
- assetId: String (外键 → Asset)
- dex: String - DEX 名称，如 "uniswap-v3", "pancakeswap"
- address: String - 合约地址
- liquidityUSD: Float - 流动性（美元）
- baseToken: String? - 基础代币，如 "USDT"
- fee: Float? - 手续费百分比
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

**索引**:
- `(assetId, dex, address)` (唯一复合索引)
- `assetId`
- `dex`
- `liquidityUSD DESC` - 按流动性降序
- `createdAt`

---

### 3. Signal（交易信号）

**用途**: 存储技术分析指标和交易信号

**字段**:
```prisma
// 基础信息
- id: String
- assetId: String (外键 → Asset)
- window: String - 时间窗口 "5m", "15m", "1h", "4h", "1d"

// 价格指标
- priceChangePct: Float - 价格变化百分比
- currentPrice: Float? - 当前价格

// 成交量指标
- volZScore: Float - 成交量 Z-Score（异常检测）
- volumeUSD: Float? - 实际成交量（美元）

// 流动性指标
- liqDeltaPct: Float - 流动性变化百分比
- totalLiquidityUSD: Float? - 总流动性

// 持仓分析
- top5HoldPct: Float - 前5大持仓占比
- holderCount: Int? - 持仓地址数

// 钱包活动
- newWalletNetBuy: Float - 新钱包净买入（美元）
- newWalletCount: Int? - 新钱包数量

// 风险评估
- riskScore: Float - 风险评分 (0-100)
- contractAgeDays: Int - 合约年龄（天）

// AI 分析
- sentiment: String? - "bullish", "bearish", "neutral"
- aiSummary: String? - AI 摘要
- alertLevel: String? - "low", "medium", "high", "critical"

- createdAt: DateTime
```

**关键索引**:
- `assetId`
- `window`
- `riskScore DESC`
- `volZScore DESC`
- **`(createdAt DESC, riskScore DESC)`** - 复合索引（重要！）
- `createdAt DESC`

**设计要点**:
- 复合索引 `(createdAt DESC, riskScore DESC)` 用于高效查询最新且高风险的信号
- Z-Score 用于检测异常成交量
- 多维度风险评估

---

### 4. Term（金融术语 - RAG 知识库）

**用途**: 存储金融术语和定义，支持向量语义搜索

**字段**:
```prisma
- id: String
- term: String (唯一) - 术语名称
- definition: String (Text) - 定义
- category: String - "defi", "trading", "blockchain", "general"
- example: String? (Text) - 使用示例
- embedding: vector(1536) - OpenAI 向量嵌入（pgvector）
- searchCount: Int - 搜索次数
- createdAt: DateTime
- updatedAt: DateTime
```

**索引**:
- `term` (唯一)
- `category`
- `searchCount DESC`

**向量搜索**:
```sql
-- 语义相似度搜索
SELECT * FROM "Term"
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '[query_vector]'::vector
LIMIT 5;
```

---

### 5. Share（分享海报）

**用途**: 存储生成的分享海报和统计

**字段**:
```prisma
- id: String
- assetId: String (外键 → Asset)
- title: String - 海报标题
- description: String? - 描述
- imageUrl: String? - 海报图片 URL
- viewCount: Int - 浏览次数
- shareType: String - "signal", "analysis", "alert"
- createdAt: DateTime
```

**索引**:
- `assetId`
- `viewCount DESC`
- `createdAt DESC`

---

### 6. Subscription（用户订阅）

**用途**: 用户订阅标签和通知配置

**字段**:
```prisma
- id: String
- userId: String (外键 → User)
- tag: String - 订阅标签，如 "BTC", "high-volume", "whale-alerts"
- enabled: Boolean - 是否启用
- channels: String[] - 通知渠道 ["email", "push", "telegram"]
- createdAt: DateTime
- updatedAt: DateTime
```

**索引**:
- `(userId, tag)` (唯一复合索引)
- `userId`
- `tag`
- `enabled`

---

## 🔗 关系图

```
User
  ├─→ accounts[]
  ├─→ sessions[]
  └─→ subscriptions[]

Asset
  ├─→ pairs[]
  ├─→ signals[]
  └─→ shares[]

Pair
  └─→ asset (assetId)

Signal
  └─→ asset (assetId)

Share
  └─→ asset (assetId)

Subscription
  └─→ user (userId)

Term
  (独立实体，通过向量搜索关联)
```

---

## 🚀 数据库初始化

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
# .env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### 3. 推送 Schema

```bash
# 方式 1: 开发环境（推荐）
npx prisma db push

# 方式 2: 生成迁移文件
npx prisma migrate dev --name init
```

### 4. 生成 Prisma 客户端

```bash
npx prisma generate
```

### 5. 填充示例数据

```bash
npx prisma db seed
# 或
pnpm db:seed
```

---

## 📊 数据库管理

### 打开 Prisma Studio

```bash
npx prisma studio
# 或
pnpm db:studio
```

访问 http://localhost:5555

### 查看数据库

```bash
# 连接到数据库
psql $DATABASE_URL

# 查看表
\dt

# 查看 Term 表结构
\d "Term"

# 检查 pgvector 扩展
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## 🔍 常用查询

### 查询最新高风险信号

```sql
SELECT s.*, a.symbol, a.name
FROM "Signal" s
JOIN "Asset" a ON s."assetId" = a.id
ORDER BY s."createdAt" DESC, s."riskScore" DESC
LIMIT 10;
```

### 查询流动性最高的交易对

```sql
SELECT p.*, a.symbol
FROM "Pair" p
JOIN "Asset" a ON p."assetId" = a.id
ORDER BY p."liquidityUSD" DESC
LIMIT 10;
```

### 术语语义搜索

```sql
-- 假设 $1 是查询向量
SELECT 
  id, 
  term, 
  definition,
  1 - (embedding <=> $1::vector) as similarity
FROM "Term"
WHERE embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

---

## 📈 索引优化

### 关键复合索引

```prisma
// Signal 表的复合索引（已配置）
@@index([createdAt(sort: Desc), riskScore(sort: Desc)])
```

**使用场景**:
```typescript
// 这个查询会使用复合索引
const signals = await prisma.signal.findMany({
  orderBy: [
    { createdAt: 'desc' },
    { riskScore: 'desc' },
  ],
  take: 20,
})
```

### 性能监控

```sql
-- 查看慢查询
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%Signal%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 查看索引使用情况
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 🛠 维护命令

### 重置数据库

```bash
# 删除并重新创建
npx prisma migrate reset

# 或手动
npx prisma db push --force-reset
npx prisma db seed
```

### 更新 Schema

```bash
# 1. 修改 prisma/schema.prisma
# 2. 生成迁移
npx prisma migrate dev --name your_migration_name

# 3. 应用到生产
npx prisma migrate deploy
```

### 备份和恢复

```bash
# 备份
pg_dump $DATABASE_URL > backup.sql

# 恢复
psql $DATABASE_URL < backup.sql
```

---

## 🔒 安全建议

### 1. 数据库连接

```bash
# 生产环境使用 SSL
DATABASE_URL="postgresql://...?sslmode=require"
```

### 2. 敏感字段

```prisma
// 使用 @db.Text 存储大文本
definition String @db.Text

// 使用适当的类型
embedding Unsupported("vector(1536)")
```

### 3. 索引策略

- 只对经常查询的字段建索引
- 监控索引使用情况
- 定期清理未使用的索引

---

## 📚 相关文档

- [Prisma 文档](https://www.prisma.io/docs)
- [pgvector 文档](https://github.com/pgvector/pgvector)
- [PostgreSQL 索引](https://www.postgresql.org/docs/current/indexes.html)

---

**数据库设计完成，生产就绪！** 🎉
