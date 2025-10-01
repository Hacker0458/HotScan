# 🎉 数据库设计交付文档

HotScan - 加密货币/DeFi 分析平台

---

## ✅ 已完成的工作

### 1. Prisma Schema 设计 ✅

**文件**: `prisma/schema.prisma`

**包含实体**:
- ✅ **Asset** - 加密资产（symbol, name, chain）
- ✅ **Pair** - 交易对（assetId→Asset, dex, address, liquidityUSD）
- ✅ **Signal** - 交易信号（assetId→Asset, window, priceChangePct, volZScore, liqDeltaPct, top5HoldPct, newWalletNetBuy, riskScore, contractAgeDays）
- ✅ **Term** - 金融术语（term, definition, **embedding vector(1536)**）⭐
- ✅ **Share** - 分享海报（assetId→Asset, imageUrl, title）
- ✅ **Subscription** - 用户订阅（userId, tag）

**技术特性**:
- ✅ pgvector 扩展配置
- ✅ 所有外键关系（CASCADE 删除）
- ✅ 完整的索引设计
- ✅ NextAuth 认证模型

---

### 2. 索引设计 ✅

**单字段索引**:
```prisma
// Asset
@@index([symbol])     // 唯一
@@index([chain])
@@index([createdAt])

// Pair
@@index([assetId])
@@index([dex])
@@index([liquidityUSD(sort: Desc)])

// Signal
@@index([assetId])
@@index([window])
@@index([riskScore(sort: Desc)])
@@index([volZScore(sort: Desc)])
@@index([createdAt(sort: Desc)])

// Term
@@index([term])       // 唯一
@@index([category])
@@index([searchCount(sort: Desc)])

// Share
@@index([assetId])
@@index([viewCount(sort: Desc)])
@@index([createdAt(sort: Desc)])

// Subscription
@@index([userId])
@@index([tag])
@@index([enabled])
```

**复合索引**:
```prisma
// Pair - 唯一性保证
@@unique([assetId, dex, address])

// Signal - 关键性能优化 ⭐
@@index([createdAt(sort: Desc), riskScore(sort: Desc)])

// Subscription - 唯一订阅
@@unique([userId, tag])
```

**设计要点**:
- ⭐ **Signal 复合索引** `(createdAt DESC, riskScore DESC)` 用于高效查询最新且高风险的信号
- 所有时间字段都有降序索引，优化分页查询
- 外键字段都有索引，加速关联查询

---

### 3. pgvector 配置 ✅

**Schema 配置**:
```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]  // 启用 pgvector 扩展
}

model Term {
  embedding Unsupported("vector(1536)")?  // OpenAI 向量（1536维）
}
```

**向量搜索示例**:
```typescript
// 语义相似度搜索
const results = await prisma.$queryRaw`
  SELECT 
    id,
    term,
    definition,
    1 - (embedding <=> ${queryVector}::vector) as similarity
  FROM "Term"
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> ${queryVector}::vector
  LIMIT 5
`
```

---

### 4. 种子数据 (seed.ts) ✅

**文件**: `prisma/seed.ts`

**包含数据**:
- ✅ 5 个资产示例（BTC, ETH, PEPE, SOL, DOGE）
- ✅ 3 个交易对（Uniswap, Raydium）
- ✅ 5 个交易信号（不同时间窗口）
- ✅ 8 个金融术语（DeFi 相关）
- ✅ 2 个分享海报示例

**运行方式**:
```bash
npx prisma db seed
# 或
pnpm db:seed
```

**输出示例**:
```
🌱 开始填充数据库...
🗑️  清理现有数据...
📊 创建资产数据...
✅ 创建了 5 个资产
💱 创建交易对数据...
✅ 创建了 3 个交易对
📡 创建交易信号数据...
✅ 创建了 5 个交易信号
📚 创建术语数据...
✅ 创建了 8 个术语
📱 创建分享数据...
✅ 创建了 2 个分享

📊 数据统计：
   - 资产: 5
   - 交易对: 3
   - 信号: 5
   - 术语: 8
   - 分享: 2

✨ 数据填充完成！
```

---

### 5. 文档 ✅

#### DATABASE.md
**完整的数据库设计文档**:
- 核心实体说明
- 关系图
- 数据库初始化步骤
- 常用查询示例
- 性能优化建议
- 维护命令
- 安全建议

#### DATABASE_ENTITIES.md
**实体设计总结**:
- 实体清单表格
- 每个实体的详细字段说明
- 外键关系图
- 索引设计总结
- 数据库命令速查
- 示例查询代码
- 性能优化建议

#### MIGRATION_GUIDE.md
**迁移指南**:
- 快速开始（开发/生产）
- 迁移命令详解
- 常见场景处理
- pgvector 扩展设置
- 初始迁移 SQL 示例
- 验证迁移
- 故障排除
- 最佳实践

---

## 🚀 使用指南

### 快速开始（3步）

```bash
# 1. 推送 Schema 到数据库
npx prisma db push

# 2. 生成 Prisma 客户端
npx prisma generate

# 3. 填充示例数据
npx prisma db seed
```

### 完整流程（生产环境）

```bash
# 1. 确保数据库已创建
createdb hotscan

# 2. 配置环境变量
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/hotscan?schema=public"
EOF

# 3. 安装 pgvector（如果需要）
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 4. 创建迁移
npx prisma migrate dev --name init

# 5. 应用迁移
npx prisma migrate deploy

# 6. 生成客户端
npx prisma generate

# 7. 填充数据
npx prisma db seed

# 8. 打开 Studio 验证
npx prisma studio
```

---

## 📊 数据库命令速查

### package.json 脚本

```json
{
  "scripts": {
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 常用命令

```bash
# 开发环境
pnpm db:push          # 推送 schema
pnpm db:generate      # 生成客户端
pnpm db:seed          # 填充数据
pnpm db:studio        # 打开 Studio

# 生产环境
pnpm db:migrate       # 创建迁移
pnpm db:migrate:deploy # 应用迁移

# 维护
pnpm db:reset         # 重置数据库
```

---

## 🎯 关键特性

### 1. 复合索引优化 ⭐

**Signal 表的关键复合索引**:
```prisma
@@index([createdAt(sort: Desc), riskScore(sort: Desc)])
```

**使用场景**:
```typescript
// 查询最新的高风险信号
const signals = await prisma.signal.findMany({
  where: { riskScore: { gte: 60 } },
  orderBy: [
    { createdAt: 'desc' },
    { riskScore: 'desc' },
  ],
  take: 20,
})
```

**性能提升**:
- ✅ 无需全表扫描
- ✅ 直接使用索引排序
- ✅ 适合实时热点监控

### 2. pgvector 语义搜索 🤖

**向量存储**:
```prisma
model Term {
  embedding Unsupported("vector(1536)")?
}
```

**搜索实现**:
```typescript
import { getEmbedding } from '@/lib/openai'

async function semanticSearch(query: string) {
  const embedding = await getEmbedding(query)
  
  return await prisma.$queryRaw`
    SELECT 
      id, term, definition, category,
      1 - (embedding <=> ${embedding}::vector) as similarity
    FROM "Term"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT 5
  `
}
```

### 3. 级联删除

**所有外键都配置了 CASCADE**:
```prisma
// 删除 Asset 时，自动删除所有关联的 Pair、Signal、Share
model Pair {
  asset Asset @relation(fields: [assetId], references: [id], onDelete: Cascade)
}

model Signal {
  asset Asset @relation(fields: [assetId], references: [id], onDelete: Cascade)
}

model Share {
  asset Asset @relation(fields: [assetId], references: [id], onDelete: Cascade)
}
```

---

## 📈 示例查询

### 1. 最新高风险信号

```typescript
const topRiskSignals = await prisma.signal.findMany({
  where: {
    riskScore: { gte: 70 },
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时内
    },
  },
  orderBy: [
    { createdAt: 'desc' },
    { riskScore: 'desc' },
  ],
  include: {
    asset: true,
  },
  take: 10,
})
```

### 2. 流动性排行

```typescript
const topLiquidityPairs = await prisma.pair.findMany({
  where: { isActive: true },
  orderBy: { liquidityUSD: 'desc' },
  include: {
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
```

### 3. 用户订阅的信号

```typescript
const userAssets = await prisma.subscription.findMany({
  where: {
    userId: user.id,
    enabled: true,
  },
  select: { tag: true },
})

const signals = await prisma.signal.findMany({
  where: {
    asset: {
      symbol: {
        in: userAssets.map(s => s.tag),
      },
    },
  },
  orderBy: { createdAt: 'desc' },
  include: { asset: true },
  take: 50,
})
```

---

## 🔍 验证清单

### ✅ Schema 验证

```bash
# 1. 检查语法
npx prisma format

# 2. 验证配置
npx prisma validate

# 3. 生成客户端
npx prisma generate
```

### ✅ 数据库验证

```bash
# 1. 连接数据库
psql $DATABASE_URL

# 2. 列出所有表
\dt

# 3. 查看 Signal 表结构
\d "Signal"

# 4. 查看索引
\di | grep Signal

# 5. 检查 pgvector
SELECT * FROM pg_extension WHERE extname = 'vector';

# 6. 查看外键
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### ✅ 数据验证

```bash
# 运行 seed
npx prisma db seed

# 打开 Studio 检查
npx prisma studio

# 访问 http://localhost:5555
```

---

## 📦 交付文件清单

### 核心文件
- ✅ `prisma/schema.prisma` - Prisma Schema 定义
- ✅ `prisma/seed.ts` - 种子数据脚本

### 文档文件
- ✅ `DATABASE.md` - 完整数据库文档
- ✅ `DATABASE_ENTITIES.md` - 实体设计总结
- ✅ `prisma/migrations/MIGRATION_GUIDE.md` - 迁移指南
- ✅ `DELIVERY_DATABASE.md` - 本交付文档

### 配置文件
- ✅ `package.json` - 添加数据库相关脚本
- ✅ `README-V2.md` - 更新数据库设置步骤
- ✅ `QUICKSTART-V2.md` - 更新快速开始指南

---

## 🎯 下一步建议

### 1. 初始化数据库

```bash
# 快速开始
npx prisma db push
npx prisma generate
npx prisma db seed
```

### 2. 嵌入术语向量

```bash
# 运行术语嵌入任务
pnpm jobs:embed

# 这会为所有术语生成 OpenAI 向量
```

### 3. 开发 API 路由

**推荐顺序**:
1. `/api/assets` - 资产查询
2. `/api/signals` - 信号查询
3. `/api/learn` - RAG 问答
4. `/api/share` - 海报生成

### 4. 监控性能

```sql
-- 查看慢查询
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%Signal%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 查看索引使用
SELECT 
  schemaname, tablename, indexname,
  idx_scan as scans,
  idx_tup_read as rows_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 📚 相关资源

### 官方文档
- [Prisma 文档](https://www.prisma.io/docs)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [PostgreSQL 文档](https://www.postgresql.org/docs)

### 项目文档
- [DATABASE.md](./DATABASE.md) - 完整数据库设计
- [DATABASE_ENTITIES.md](./DATABASE_ENTITIES.md) - 实体总结
- [MIGRATION_GUIDE.md](./prisma/migrations/MIGRATION_GUIDE.md) - 迁移指南

---

## 🎉 总结

### 已完成
✅ 完整的 Prisma Schema（6个核心实体）
✅ 所有外键关系配置（CASCADE）
✅ 完整的索引设计（单字段 + 复合）
✅ **Signal 复合索引** `(createdAt DESC, riskScore DESC)` ⭐
✅ pgvector 配置和向量列
✅ 种子数据脚本（8个术语 + 5个资产 + 信号）
✅ 3份完整文档（设计、实体、迁移）
✅ package.json 脚本配置
✅ README 更新

### 关键亮点
⭐ **高性能复合索引** - 优化实时热点查询
🤖 **RAG 语义搜索** - pgvector + OpenAI 1536维向量
🔗 **完整外键关系** - 数据完整性保证
📊 **多维度信号** - 价格/成交量/流动性/持仓/钱包
🗄️ **生产就绪** - 迁移支持 + 种子数据

---

**数据库设计完成！可直接运行！** 🚀

```bash
# 立即开始
npx prisma db push && npx prisma generate && npx prisma db seed
```
