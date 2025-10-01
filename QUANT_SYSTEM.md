# 📈 量化分析系统文档

HotScan - 候选筛选 + 风险评分系统

---

## 🎯 系统概述

企业级量化分析系统，用于识别高潜力加密资产并评估风险。

### 核心功能

1. **候选筛选** - 筛选符合条件的资产（满足≥2个条件）
2. **风险评分** - 综合评估资产风险（0-100分）
3. **投资建议** - 生成智能推荐（strong_buy → danger）

---

## 📊 候选筛选算法

### 筛选条件（满足≥2个）

#### 条件1: 价格波动 ≥15%

```typescript
检查: 5-15分钟价格变化 ≥ 15%

priceChange5m = |current_price - price_5m_ago| / price_5m_ago * 100
priceChange15m = |current_price - price_15m_ago| / price_15m_ago * 100

qualified = max(priceChange5m, priceChange15m) ≥ 15%
```

**示例**:
```
价格从 $100 → $116 (5分钟)
变化 = |116 - 100| / 100 * 100 = 16%
结果: ✓ 通过
```

#### 条件2: 成交量异常 ≥3σ

```typescript
检查: 1小时成交量相对24h均值 ≥ 3σ (Z-Score)

Z-Score = (volume_1h - mean_24h) / stddev_24h

qualified = Z-Score ≥ 3
```

**示例**:
```
volume_1h = $800M
mean_24h = $500M
stddev_24h = $100M

Z-Score = (800 - 500) / 100 = 3.0
结果: ✓ 通过
```

#### 条件3: 流动性增长 ≥20%

```typescript
检查: 流动性1小时增长 ≥ 20%

growth = (liquidity_now - liquidity_1h_ago) / liquidity_1h_ago * 100

qualified = growth ≥ 20%
```

**示例**:
```
liquidity_now = $1.2M
liquidity_1h_ago = $1.0M

growth = (1.2 - 1.0) / 1.0 * 100 = 20%
结果: ✓ 通过
```

#### 条件4: 新钱包活动 Top 10%

```typescript
检查: 新钱包净买入位列前10%

percentile = rank / total * 100

qualified = percentile ≥ 90
```

**示例**:
```
排名: 95/100 个资产
百分位 = 95
结果: ✓ 通过（前10%）
```

### 综合筛选

```typescript
score = 满足的条件数量 (0-4)
qualified = score ≥ 2
```

**筛选结果**:
```typescript
{
  qualified: true,         // 是否合格
  score: 3,               // 满足3个条件
  conditions: {
    priceVolatility: true,    // ✓
    volumeAnomaly: true,      // ✓
    liquidityGrowth: true,    // ✓
    walletActivity: false,    // ✗
  },
  details: {
    priceChange: 18.5,
    volumeZScore: 3.2,
    liquidityGrowthPct: 25.0,
    walletPercentile: 75,
  }
}
```

---

## 🛡️ 风险评分算法

### 评分规则（0-100，越高越危险）

#### 规则1: 年轻合约 (+20分)

```typescript
if (contractAgeDays ≤ 7) {
  score += 20
  flags.push('年轻合约')
}
```

**原因**: 新合约缺乏历史验证，跑路风险高

#### 规则2: 持仓集中 (+25分)

```typescript
if (top5HoldingPct ≥ 60%) {
  score += 25
  flags.push('持仓集中')
}
```

**原因**: 大户控盘，容易操纵价格

#### 规则3: 跑路风险 (+20分)

```typescript
if (!hasLiquidity || !isLiquidityLocked || canRemoveLiquidity) {
  score += 20
  flags.push('跑路风险')
}
```

**原因**: 流动性未锁仓或可撤池，随时可能跑路

#### 规则4: 虚假拉盘 (+15分)

```typescript
if (socialMentionSpike && netInflowNegative) {
  score += 15
  flags.push('虚假拉盘')
}
```

**原因**: 社媒热度突刺但链上净流入为负，可能是虚假宣传

#### 规则5: 内部交易 (+20分)

```typescript
if (devAddressTrading) {
  score += 20
  flags.push('内部交易')
}
```

**原因**: Dev地址参与交易，存在内幕操纵

### 风险等级

```typescript
totalScore = sum(各项风险分数)

if (totalScore >= 75) riskLevel = 'critical'   // 极高风险
if (totalScore >= 50) riskLevel = 'high'       // 高风险
if (totalScore >= 25) riskLevel = 'medium'     // 中等风险
if (totalScore < 25)  riskLevel = 'low'        // 低风险
```

### 评分示例

**示例1: 极高风险（100分）**

```typescript
{
  contractAgeDays: 1,        // +20 ✓
  top5HoldingPct: 80,       // +25 ✓
  hasLiquidity: false,      // +20 ✓
  socialMentionSpike: true, // +15 ✓
  netInflowNegative: true,
  devAddressTrading: true,  // +20 ✓
}

totalScore: 100
riskLevel: 'critical'
flags: ['年轻合约', '持仓集中', '跑路风险', '虚假拉盘', '内部交易']
```

**示例2: 低风险（20分）**

```typescript
{
  contractAgeDays: 5,        // +20 ✓
  top5HoldingPct: 30,       // 0
  hasLiquidity: true,       // 0
  isLiquidityLocked: true,
  canRemoveLiquidity: false,
  socialMentionSpike: false, // 0
  devAddressTrading: false,  // 0
}

totalScore: 20
riskLevel: 'low'
flags: ['年轻合约']
```

---

## 💡 投资建议

### 推荐逻辑

```typescript
function getRecommendation(candidateQualified, riskScore) {
  // 1. 未通过筛选 → 避免
  if (!candidateQualified) return 'avoid'
  
  // 2. 根据风险评分
  if (riskScore >= 75) return 'danger'      // 极高风险
  if (riskScore >= 50) return 'avoid'       // 高风险
  if (riskScore >= 25) return 'hold'        // 中等风险
  if (riskScore >= 15) return 'buy'         // 低风险
  return 'strong_buy'                       // 极低风险
}
```

### 推荐分级

| 推荐 | 风险分数 | 候选资格 | 说明 |
|------|----------|----------|------|
| **strong_buy** | 0-14 | ✓ | 极低风险，强烈推荐 |
| **buy** | 15-24 | ✓ | 低风险，可以买入 |
| **hold** | 25-49 | ✓ | 中等风险，建议观望 |
| **avoid** | 50-74 或 未通过 | - | 高风险或不合格，建议避免 |
| **danger** | 75-100 | ✓ | 极高风险，危险 |

---

## 🧪 测试覆盖

### 候选筛选测试

```typescript
✓ 价格波动检测
  - 5分钟大幅波动
  - 15分钟大幅波动
  - 负数处理（绝对值）
  - 边界测试（15%, 14.9%）
  - 缺失数据处理

✓ 成交量异常检测
  - 3σ以上识别
  - 边界测试（3σ, 2.9σ）
  - 标准差为0处理

✓ 流动性增长检测
  - 20%以上识别
  - 边界测试（20%, 19.9%）
  - 除以0处理

✓ 钱包活动检测
  - Top 10%识别
  - 边界测试（90%, 89.9%）
  - 缺失百分位处理

✓ 综合筛选
  - 满足≥2个条件
  - 满足1个条件不合格
  - 满足4个条件

✓ 百分位计算
  - 正确排序
  - 空数组处理
  - 单个资产处理

✓ 随机测试（100次）
```

### 风险评分测试

```typescript
✓ 年轻合约评分
  - ≤7天识别
  - >7天无风险
  - 边界测试

✓ 持仓集中度评分
  - ≥60%识别
  - <60%无风险
  - 边界测试

✓ 跑路风险评分
  - 无流动性识别
  - 未锁仓识别
  - 可撤池识别
  - 安全状态无风险

✓ 虚假拉盘评分
  - 社媒+负流入识别
  - 单一条件不触发

✓ 内部交易评分
  - Dev交易识别

✓ 综合评分
  - 无风险（0分）
  - 全部风险（100分）
  - 各风险等级边界

✓ 风险等级分类
  - low (0-24)
  - medium (25-49)
  - high (50-74)
  - critical (75-100)

✓ 投资建议
  - 所有推荐级别

✓ 随机测试（100次）
```

---

## 🚀 使用方法

### 1. 纯函数调用

```typescript
import { filterCandidate } from '@/lib/quant/candidate-filter'
import { scoreRisk } from '@/lib/quant/risk-scorer'
import { analyzeSignal } from '@/lib/quant/signal-analyzer'

// 候选筛选
const candidateInput = {
  symbol: 'BTC',
  assetId: 'btc-123',
  priceChange5m: 18.5,
  volume1h: 800,
  volume24hMean: 500,
  volume24hStdDev: 100,
  // ...
}

const candidateResult = filterCandidate(candidateInput)
console.log(candidateResult.qualified) // true
console.log(candidateResult.score)     // 3

// 风险评分
const riskInput = {
  symbol: 'BTC',
  contractAgeDays: 30,
  top5HoldingPct: 25,
  hasLiquidity: true,
  // ...
}

const riskResult = scoreRisk(riskInput)
console.log(riskResult.totalScore)  // 0
console.log(riskResult.riskLevel)   // 'low'

// 综合分析
const analysis = analyzeSignal(candidateInput, riskInput, '1h')
console.log(analysis.recommendation) // 'strong_buy'
```

### 2. 运行作业

```bash
# 方式1: npm/pnpm
pnpm jobs:analyze

# 方式2: 直接运行
npx tsx src/jobs/analyze-signals.ts

# 方式3: Vercel Cron
# 配置 vercel.json
```

### 3. 测试

```bash
# 运行所有测试
npm test

# 运行量化测试
npm test src/__tests__/lib/quant/

# 查看覆盖率
npm run test:coverage
```

---

## 📊 作业流程

### analyze-signals 作业

```
1. 获取活跃资产
   ↓
2. 加载缓存指标
   ↓
3. 计算钱包百分位
   ↓
4. 分析每个资产
   ├─ 提取K线数据
   ├─ 计算技术指标
   ├─ 候选筛选
   ├─ 风险评分
   └─ 生成推荐
   ↓
5. 写入Signal表
   ↓
6. 记录JobRun
```

**输出示例**:
```
🚀 Starting signal analysis job...

📊 Step 1: Fetching active assets...
✅ Found 50 active assets

📊 Step 2: Loading cached metrics...
✅ Loaded 200 cached metrics

📊 Step 3: Calculating wallet percentiles...
✅ Calculated percentiles for 50 assets

📊 Step 4: Analyzing signals...
  ✅ BTC: strong_buy (risk: 0)
  ✅ ETH: buy (risk: 20)
  ✅ PEPE: danger (risk: 85)
  ...

📊 Step 5: Summary
  Total analyzed: 50
  Succeeded: 48
  Failed: 2
  Signals generated: 48

  Recommendations:
    Strong Buy: 12
    Buy: 18
    Hold: 10
    Avoid: 5
    Danger: 3

✨ Signal analysis completed in 3456ms
```

---

## 📐 数据库Schema

### Signal 表字段映射

```typescript
{
  // 基础
  assetId: string
  window: string              // '1h'
  
  // 价格
  priceChangePct: number      // candidateInput.priceChange5m
  currentPrice: number        // latestCandle.close
  
  // 成交量
  volZScore: number           // Z-Score计算结果
  volumeUSD: number           // volume1h
  
  // 流动性
  liqDeltaPct: number         // 流动性变化%
  totalLiquidityUSD: number   // 当前流动性
  
  // 持仓
  top5HoldPct: number         // riskInput.top5HoldingPct
  holderCount: number         // 持仓地址数
  
  // 钱包
  newWalletNetBuy: number     // 新钱包净买入
  newWalletCount: number      // 新钱包数量
  
  // 风险
  riskScore: number           // riskResult.totalScore
  contractAgeDays: number     // 合约年龄
  
  // 分析
  sentiment: string           // bullish/bearish/neutral
  aiSummary: string           // 综合摘要
  alertLevel: string          // low/medium/high/critical
  
  createdAt: DateTime
}
```

---

## 🎯 性能优化

### 纯函数设计

- ✅ 无副作用
- ✅ 可测试性强
- ✅ 易于并行化
- ✅ 可缓存结果

### 批量处理

```typescript
// ✅ 好：批量分析
const signals = analyzeBatch(inputs)

// ❌ 差：逐个分析
for (const input of inputs) {
  await analyzeSignal(input)
}
```

### 缓存优化

```typescript
// 预计算百分位（一次计算，多次使用）
const percentiles = calculateWalletPercentiles(allAssets)

// 使用缓存的指标数据
const cachedMetrics = await loadCachedMetrics()
```

---

## 📚 API 文档

### filterCandidate()

```typescript
function filterCandidate(input: CandidateInput): CandidateResult
```

**输入**: 候选筛选数据  
**输出**: 筛选结果（qualified, score, conditions, details）

### scoreRisk()

```typescript
function scoreRisk(input: RiskInput): RiskResult
```

**输入**: 风险评分数据  
**输出**: 风险结果（totalScore, riskLevel, breakdown, flags）

### analyzeSignal()

```typescript
function analyzeSignal(
  candidateInput: CandidateInput,
  riskInput: RiskInput,
  window?: string
): SignalAnalysis
```

**输入**: 候选和风险数据  
**输出**: 完整分析（candidate, risk, recommendation）

---

## ✅ 验证清单

- [x] 候选筛选4个条件实现
- [x] 风险评分5个规则实现
- [x] 纯函数设计（无副作用）
- [x] 完整的TypeScript类型
- [x] Vitest测试覆盖
  - [x] 候选筛选测试
  - [x] 风险评分测试
  - [x] 边界测试
  - [x] 随机测试（各100次）
- [x] 作业脚本（analyze-signals）
- [x] 写入Signal表
- [x] 日志和错误处理

---

**量化分析系统完成！生产就绪！** 🚀
