# 🌱 种子数据文档

HotScan - 数据库初始化和演示数据

---

## 📋 概述

`prisma/seed.ts` 脚本用于初始化数据库并填充演示数据，包括：

- **12个示例资产**（BTC、ETH、SOL等主流币 + 新兴代币）
- **33条金融术语**（覆盖DeFi、交易、风险管理等）
- **20条近24小时信号**（随机生成，用于演示）
- **11个交易对**（Uniswap、PancakeSwap、Raydium）
- **1个示例分享**（海报演示）

---

## 🚀 运行种子脚本

### 方式一：使用 pnpm 脚本

```bash
pnpm db:seed
```

### 方式二：使用 Prisma CLI

```bash
npx prisma db seed
```

### 完整初始化流程

```bash
# 1. 推送 Schema 到数据库
npx prisma db push

# 2. 生成 Prisma Client
npx prisma generate

# 3. 填充种子数据
pnpm db:seed

# 4. (可选) 向量化术语
pnpm jobs:embed
```

---

## 📦 数据结构

### 1. 示例资产 (12个)

#### 主流币 (4个)

| ID | Symbol | Name | Chain | 说明 |
|----|--------|------|-------|------|
| btc | BTC | Bitcoin | BTC | 比特币 |
| eth | ETH | Ethereum | ETH | 以太坊 |
| sol | SOL | Solana | SOL | Solana |
| bnb | BNB | BNB | BSC | 币安币 |

#### DeFi 代币 (2个)

| ID | Symbol | Name | Chain | 说明 |
|----|--------|------|-------|------|
| uni | UNI | Uniswap | ETH | Uniswap治理代币 |
| aave | AAVE | Aave | ETH | Aave借贷协议 |

#### Meme 代币 (2个)

| ID | Symbol | Name | Chain | 说明 |
|----|--------|------|-------|------|
| pepe | PEPE | Pepe | ETH | Pepe Meme币 |
| shib | SHIB | Shiba Inu | ETH | 柴犬币 |

#### 新兴代币 (4个，占位)

| ID | Symbol | Name | Chain | 说明 |
|----|--------|------|-------|------|
| token-alpha | ALPHA | Alpha Protocol | ETH | 占位代币 |
| token-beta | BETA | Beta Finance | BSC | 占位代币 |
| token-gamma | GAMMA | Gamma Strategies | ETH | 占位代币 |
| token-delta | DELTA | Delta Protocol | SOL | 占位代币 |

### 2. 交易对 (11个)

```
BTC/ETH    - Uniswap     - $50M
ETH/USDT   - Uniswap     - $100M
SOL/USDC   - Raydium     - $30M
UNI/ETH    - Uniswap     - $20M
AAVE/ETH   - Uniswap     - $15M
PEPE/ETH   - Uniswap     - $5M
SHIB/ETH   - Uniswap     - $8M
ALPHA/ETH  - Uniswap     - $500K
BETA/BNB   - PancakeSwap - $300K
GAMMA/ETH  - Uniswap     - $800K
DELTA/SOL  - Raydium     - $200K
```

### 3. 金融术语 (33条)

#### 分类统计

| 分类 | 数量 | 示例术语 |
|------|------|----------|
| **DeFi 基础** | 10 | 流动性锁仓、持币集中度、AMM、滑点、做市 |
| **链上分析** | 5 | Gas费、智能合约、链上数据、新钱包、合约地址 |
| **交易相关** | 5 | DEX、CEX、交易对、市价单、限价单 |
| **风险管理** | 5 | 止损、止盈、仓位管理、分批建仓、多样化 |
| **高级概念** | 5 | 套利、闪电贷、质押、流动性挖矿、治理代币 |
| **市场指标** | 3 | 市值、成交量、换手率 |

#### 重点术语

**DeFi 核心**:
- 流动性锁仓
- AMM (自动做市商)
- 无常损失
- TVL (总锁仓价值)

**风险警示**:
- 拉高出货 (Pump and Dump)
- Rug Pull (撤池跑路)
- 持币集中度
- 鲸鱼地址

**交易工具**:
- DEX vs CEX
- 滑点
- Gas费
- 智能合约

### 4. 演示信号 (20条)

#### 信号特点

```typescript
每条信号包含:
  • 随机资产 (从12个资产中选择)
  • 随机窗口 (5m, 15m, 1h)
  • 价格变化 (-30% ~ +50%)
  • 成交量Z-score (1.5σ ~ 8.0σ)
  • 流动性变化 (-10% ~ +40%)
  • 持币集中度 (20% ~ 80%)
  • 新钱包净买入 ($10K ~ $500K)
  • 合约年龄 (1天 ~ 365天)
  • 风险分数 (0 ~ 100，自动计算)
  • AI摘要 (中英双语)
  • 创建时间 (过去24小时内)
```

#### 风险分数计算规则

```typescript
风险分数 = 0

if (合约年龄 <= 7天)     += 20
if (前5钱包 >= 60%)      += 25
if (流动性变化 < 0)      += 20
if (|价格变化| > 30% && 新钱包净买入 < $50K) += 15
if (合约年龄 <= 3天)     += 20

风险分数 = min(风险分数, 100)
```

#### AI摘要格式

**中文** (≤120字):
```
{窗口}窗口{涨跌幅}，成交量{Z-score}倍标准差，流动性{变化描述}。
合约{天数}天，前5钱包{占比}。新钱包净买入${金额}K。
风险分${分数}/100，{风险等级}。
```

**英文** (≤15词):
```
{窗口} {涨跌幅}, vol {Z-score}σ, risk {分数}/100
```

---

## 🎯 使用场景

### 1. 本地开发

```bash
# 快速启动
pnpm db:seed
pnpm dev

# 访问演示页面
open http://localhost:3000
```

### 2. 测试环境

```bash
# 使用测试数据库
DATABASE_URL="postgresql://..." pnpm db:seed

# 运行测试
pnpm test
```

### 3. 演示环境

```bash
# 部署到Vercel预览环境
vercel

# 在预览环境运行seed
vercel env add DATABASE_URL
vercel exec "pnpm db:seed"
```

---

## 🔄 数据更新

### 清理并重新填充

```bash
# 清理所有数据
npx prisma migrate reset --force

# 重新填充
pnpm db:seed
```

### 仅更新术语

```bash
# 删除现有术语
npx prisma studio
# 手动删除 Term 表数据

# 重新运行 seed
pnpm db:seed
```

### 仅更新信号

```bash
# 在 seed.ts 中修改信号数量
const signals = generateSignals(assetIds, 50) // 增加到50条

# 重新运行
pnpm db:seed
```

---

## 📊 数据查看

### 使用 Prisma Studio

```bash
npx prisma studio
```

浏览器自动打开 `http://localhost:5555`

### 使用 SQL 查询

```bash
# 进入数据库
psql $DATABASE_URL

# 查看资产
SELECT * FROM "Asset";

# 查看术语
SELECT term, LEFT(definition, 50) as def FROM "Term";

# 查看信号
SELECT 
  a.symbol,
  s.window,
  s."priceChangePct",
  s."riskScore",
  s."createdAt"
FROM "Signal" s
JOIN "Asset" a ON s."assetId" = a.id
ORDER BY s."createdAt" DESC
LIMIT 10;
```

---

## 🛠️ 自定义种子数据

### 添加新资产

```typescript
// prisma/seed.ts

const ASSETS = [
  // ... 现有资产
  {
    id: 'my-token',
    symbol: 'MYTKN',
    name: 'My Token',
    chain: 'ETH',
    imageUrl: 'https://...',
  },
]
```

### 添加新术语

```typescript
const TERMS = [
  // ... 现有术语
  {
    term: '新术语',
    definition: '详细定义...',
  },
]
```

### 修改信号数量

```typescript
// 在 main() 函数中
const signals = generateSignals(assetIds, 50) // 改为50条
```

### 修改信号时间范围

```typescript
function randomRecentDate(): Date {
  const now = Date.now()
  const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000 // 改为3天
  const randomTime = threeDaysAgo + Math.random() * (now - threeDaysAgo)
  return new Date(randomTime)
}
```

---

## ⚠️ 注意事项

### 1. 向量化

种子数据中的 `Term.embedding` 字段默认为空数组。需要运行向量化任务：

```bash
pnpm jobs:embed
```

### 2. 数据清理

`seed.ts` 会自动清理以下表的现有数据：
- Signal
- Share
- Subscription
- Term
- Pair
- RawMetric
- Asset

**警告**: 请勿在生产环境运行 seed 脚本！

### 3. 性能

种子脚本使用逐条插入方式，大量数据时可能较慢。可优化为批量插入：

```typescript
// 批量插入
await prisma.asset.createMany({
  data: ASSETS,
  skipDuplicates: true,
})
```

### 4. 依赖关系

插入顺序很重要，需遵循外键依赖：
```
Asset (无依赖)
  ↓
Pair (依赖 Asset)
  ↓
Signal (依赖 Asset)
  ↓
Share (依赖 Asset)
```

---

## 🧪 测试数据

### 快速验证

```bash
# 运行 seed
pnpm db:seed

# 验证数据
npx prisma studio

# 或使用 psql
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Asset\";"
```

### 测试场景

**场景1: 高风险信号**
- 合约年龄 ≤7天
- 持币集中度 ≥60%
- 流动性下降
- 风险分数 ≥70

**场景2: 低风险信号**
- 合约年龄 ≥365天
- 持币集中度 ≤30%
- 流动性增加
- 风险分数 ≤30

**场景3: 爆发信号**
- 价格变化 ≥30%
- 成交量 ≥5σ
- 新钱包净买入 ≥$200K

---

## 📚 相关文档

- [DATABASE.md](./DATABASE.md) - 数据库设计文档
- [RAG_SYSTEM.md](./RAG_SYSTEM.md) - RAG术语系统文档
- [QUANT_SYSTEM.md](./QUANT_SYSTEM.md) - 量化分析系统文档

---

**种子数据系统完成！一键初始化演示环境！** 🌱✨
