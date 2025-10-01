# 📝 AI 摘要生成器文档

HotScan - 客观、精准、合规的链上分析摘要

---

## 🎯 设计原则

### 1. **客观性优先**
- ✅ 只基于结构化指标描述
- ❌ 不给投资建议
- ❌ 不使用主观词汇

### 2. **信息密度**
- 中文摘要 ≤120字
- 英文摘要 ≤15词
- 包含所有关键指标

### 3. **合规要求**
- 自动过滤主观词汇
- 添加风险警告
- 客观描述市场行为

---

## 📊 中文摘要模板

```
「{名称}」{窗口}{涨跌幅}，成交量{相对等级}，流动性{变化描述}。
合约{天数}天，前5钱包{占比}。
新钱包净买入{金额/排名}。
风险分{分}/100，注意{1条关键风险点}。
{风险警告}
```

### 示例输出

#### 低风险示例
```json
{
  "cn": "「Bitcoin」1小时涨5.0%，成交量偏高（2σ+），流动性显著增加。合约180天，前5钱包35.5%。新钱包净买入$250.0K（120个新钱包）。风险分25/100，注意合约较新。",
  "en": "BTC, +5.0%, vol high, Risk: Medium"
}
```

#### 高风险示例
```json
{
  "cn": "「Pepe Coin」15分钟涨85.0%，成交量极高（5σ+），流动性大幅增加。合约7天，前5钱包78.5%。新钱包净买入$5.2M（2500个新钱包）。风险分95/100，注意多项高危因素。【极高风险】",
  "en": "PEPE, +85.0%, vol extreme, Risk: Critical"
}
```

#### 下跌示例
```json
{
  "cn": "「Ethereum」4小时跌8.3%，成交量正常偏高，流动性小幅减少。合约2500天，前5钱包42.0%。新钱包净卖出$180.0K（50个新钱包）。风险分15/100，注意整体风险可控。",
  "en": "ETH, -8.3%, vol above avg, Risk: Low"
}
```

---

## 🔤 英文摘要格式

```
{Symbol}, {+/-X.X%}, {vol level}, Risk: {Level}
```

### 成交量等级映射

| Z-Score | 中文 | 英文 |
|---------|------|------|
| ≥5 | 极高（5σ+） | vol extreme |
| ≥3 | 异常（3σ+） | vol surge |
| ≥2 | 偏高（2σ+） | vol high |
| ≥1 | 正常偏高 | vol above avg |
| ≥0 | 正常 | vol normal |
| <0 | 低迷 | vol low |

### 风险等级映射

| 分数 | 中文 | 英文 |
|------|------|------|
| 75-100 | 极高风险 | Critical |
| 50-74 | 高风险 | High |
| 25-49 | 中等风险 | Medium |
| 0-24 | 低风险 | Low |

---

## 🛡️ 主观词汇过滤

### 禁用词汇列表

```typescript
const subjectiveWords = [
  '抄底', '梭哈', '冲', '起飞', '登月', '暴富', '财富密码',
  '必涨', '必跌', '稳赚', '推荐', '建议', '买入', '卖出',
  '强烈推荐', '立即', '马上', '赶紧', '错过', '后悔',
  '牛逼', '牛B', '牛市', '熊市', '割肉', '套牢',
  '暴涨', '暴跌', '翻倍', '归零', '跑路',
]
```

### 自动替换规则

| 主观词 | 客观替换 |
|--------|----------|
| 抄底 | 低位 |
| 梭哈 | 大量买入 |
| 冲/起飞 | 快速上涨 |
| 财富密码 | 机会 |
| 必涨/必跌 | 可能上涨/下跌 |
| 推荐/建议 | 关注/提示 |
| 买入/卖出 | 净流入/净流出 |
| 牛市/熊市 | 上涨趋势/下跌趋势 |
| 暴涨/暴跌 | 大涨/大跌 |
| 跑路 | 流动性撤出 |

---

## 🎨 格式化规则

### 1. 时间窗口

```typescript
'5m'  → '5分钟'
'15m' → '15分钟'
'1h'  → '1小时'
'4h'  → '4小时'
'1d'  → '24小时'
```

### 2. 价格变化

```typescript
+15.5% → '涨15.5%'
-8.3%  → '跌8.3%'
0%     → '持平'
```

### 3. 流动性变化

| 变化幅度 | 描述 |
|----------|------|
| ≥50% | 大幅增加/减少 |
| ≥20% | 显著增加/减少 |
| ≥10% | 增加/减少 |
| ≥5% | 小幅增加/减少 |
| <5% | 基本稳定 |

### 4. 金额格式化

```typescript
≥1,000,000  → '$X.XM'
≥1,000      → '$X.XK'
<1,000      → '$X'
```

**示例**:
```
2,500,000 → '$2.5M'
50,000    → '$50.0K'
500       → '$500'
```

---

## 🚨 风险警告

### 自动添加警告

```typescript
if (riskScore >= 75) {
  summary += '【极高风险】'
}
if (riskScore >= 50) {
  summary += '【高风险】'
}
```

### 关键风险点映射

| 风险分 | 关键风险点 |
|--------|-----------|
| ≥75 | 多项高危因素 |
| 60-74 | 持仓高度集中 |
| 45-59 | 流动性风险 |
| 25-44 | 合约较新 |
| 20-24 | 存在一定风险 |
| <20 | 整体风险可控 |

---

## 🔧 API 使用

### makeAiSummary()

生成基础AI摘要

```typescript
import { makeAiSummary } from '@/lib/quant/summary-generator'

const summary = makeAiSummary(signal, asset)
console.log(summary.cn) // 中文摘要
console.log(summary.en) // 英文摘要
```

### makeSafeSummary()

生成安全AI摘要（自动清理主观词汇）

```typescript
import { makeSafeSummary } from '@/lib/quant/summary-generator'

const summary = makeSafeSummary(signal, asset)
// 自动过滤主观词汇，保证合规
```

### containsSubjectiveWords()

检测主观词汇

```typescript
import { containsSubjectiveWords } from '@/lib/quant/summary-generator'

const hasSubjective = containsSubjectiveWords('立即抄底')
console.log(hasSubjective) // true
```

### sanitizeSummary()

清理主观词汇

```typescript
import { sanitizeSummary } from '@/lib/quant/summary-generator'

const cleaned = sanitizeSummary('立即抄底，稳赚不赔')
console.log(cleaned) // '当前低位，存在机会'
```

---

## 🧪 测试覆盖

### 基础功能测试
- ✅ 生成中英文摘要
- ✅ 中文≤120字
- ✅ 英文≤15词
- ✅ 包含资产名称

### 价格变化测试
- ✅ 上涨描述
- ✅ 下跌描述
- ✅ 持平描述

### 成交量等级测试
- ✅ 极高（5σ+）
- ✅ 异常（3σ+）
- ✅ 正常
- ✅ 低迷

### 流动性变化测试
- ✅ 大幅增加/减少
- ✅ 显著增加/减少
- ✅ 基本稳定

### 钱包活动测试
- ✅ 金额格式化（M/K）
- ✅ 买入/卖出方向
- ✅ 钱包数量

### 风险评分测试
- ✅ 包含风险分数
- ✅ 低/中/高/极高风险
- ✅ 风险警告标签
- ✅ 关键风险点

### 主观词汇测试
- ✅ 检测主观词汇
- ✅ 清理主观词汇
- ✅ 保留客观描述

### 边界测试
- ✅ 极端价格变化
- ✅ 极端Z-Score
- ✅ 零值处理
- ✅ 负值处理

### 随机测试
- ✅ 50次随机测试

**总计: 80+ 测试用例**

---

## 📈 性能优化

### 1. 纯函数设计
```typescript
// ✅ 无副作用
// ✅ 可缓存
// ✅ 易测试
```

### 2. 字符串拼接优化
```typescript
// 使用数组 join
const parts = []
parts.push(part1)
parts.push(part2)
return parts.join('，')
```

### 3. 正则表达式缓存
```typescript
// 预编译正则表达式
const regex = new RegExp(word, 'g')
```

---

## 📊 集成到作业

### analyze-signals.ts

```typescript
import { makeSafeSummary } from '@/lib/quant/summary-generator'

// 生成AI摘要
const aiSummaryJson = makeSafeSummary(signal, asset)

// 写入数据库
await prisma.signal.create({
  data: {
    // ...其他字段
    aiSummary: JSON.stringify(aiSummaryJson), // 存储JSON
  },
})
```

### 前端展示

```typescript
// 解析JSON
const summary = JSON.parse(signal.aiSummary)

// 显示中文
<p className="text-sm">{summary.cn}</p>

// 显示英文
<p className="text-xs text-muted-foreground">{summary.en}</p>
```

---

## ✅ 合规检查清单

- [x] 不给投资建议
- [x] 只描述客观事实
- [x] 自动过滤主观词汇
- [x] 添加风险警告
- [x] 基于结构化数据
- [x] 可审计可追溯
- [x] 长度限制合理
- [x] 多语言支持

---

## 🎯 实际案例

### 案例1: 稳定币波动

**输入**:
```typescript
signal = {
  symbol: 'USDT',
  priceChangePct: 0.02,
  volZScore: 0.3,
  liqDeltaPct: 1.5,
  riskScore: 5,
  contractAgeDays: 3000,
  top5HoldPct: 25.0,
  newWalletNetBuy: 50000,
}
```

**输出**:
```json
{
  "cn": "「Tether USD」1小时涨0.0%，成交量正常，流动性基本稳定。合约3000天，前5钱包25.0%。新钱包净买入$50.0K。风险分5/100，注意整体风险可控。",
  "en": "USDT, +0.0%, vol normal, Risk: Low"
}
```

### 案例2: Meme币暴涨

**输入**:
```typescript
signal = {
  symbol: 'PEPE',
  priceChangePct: 150.0,
  volZScore: 8.5,
  liqDeltaPct: 80.0,
  riskScore: 95,
  contractAgeDays: 3,
  top5HoldPct: 85.0,
  newWalletNetBuy: 10000000,
}
```

**输出**:
```json
{
  "cn": "「Pepe Coin」15分钟涨150.0%，成交量极高（5σ+），流动性大幅增加。合约3天，前5钱包85.0%。新钱包净买入$10.0M。风险分95/100，注意多项高危因素。【极高风险】",
  "en": "PEPE, +150.0%, vol extreme, Risk: Critical"
}
```

### 案例3: 主流币震荡

**输入**:
```typescript
signal = {
  symbol: 'ETH',
  priceChangePct: -3.5,
  volZScore: 1.2,
  liqDeltaPct: -5.0,
  riskScore: 10,
  contractAgeDays: 2800,
  top5HoldPct: 38.0,
  newWalletNetBuy: -200000,
}
```

**输出**:
```json
{
  "cn": "「Ethereum」4小时跌3.5%，成交量正常偏高，流动性小幅减少。合约2800天，前5钱包38.0%。新钱包净卖出$200.0K。风险分10/100，注意整体风险可控。",
  "en": "ETH, -3.5%, vol above avg, Risk: Low"
}
```

---

**AI摘要生成器完成！客观、精准、合规！** 🚀
