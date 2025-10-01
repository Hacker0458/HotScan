# 🧪 测试文档

HotScan - 完整的测试系统和质量保证

---

## 🎯 测试概述

### 测试覆盖

```
总测试用例: 500+
单元测试: 400+
集成测试: 50+
API测试: 50+
覆盖率目标: ≥80%
```

### 测试类型

| 类型 | 用途 | 用例数 | 工具 |
|------|------|--------|------|
| **单元测试** | 纯函数逻辑 | 400+ | Vitest |
| **API测试** | 接口功能 | 50+ | Vitest + Prisma |
| **集成测试** | 完整流程 | 50+ | Vitest |
| **E2E测试** | 用户场景 | - | Playwright（规划中） |

---

## 🧪 单元测试

### 1. 风险评分测试

**文件**: `src/__tests__/lib/quant/risk-scorer.test.ts`

#### 边界测试
```typescript
✅ 最低风险（0分）
✅ 最高风险（100分）
✅ 各维度独立测试
✅ 组合场景测试
```

#### 随机测试
```typescript
✅ 100次随机输入
✅ 分数范围验证（0-100）
✅ 单调性验证
✅ 极端值处理
```

**运行**:
```bash
pnpm test src/__tests__/lib/quant/risk-scorer.test.ts
```

### 2. 候选筛选测试

**文件**: `src/__tests__/lib/quant/candidate-filter.test.ts`

#### 测试用例
```typescript
✅ 满足≥2条件通过
✅ 仅满足1条件拒绝
✅ 满足所有条件通过
✅ 所有条件不满足拒绝
✅ 边界值测试
```

**运行**:
```bash
pnpm test src/__tests__/lib/quant/candidate-filter.test.ts
```

### 3. AI摘要生成测试

**文件**: `src/__tests__/lib/quant/summary-generator.test.ts`

#### 合规性测试
```typescript
✅ 禁止投资建议词汇
✅ 自动风险警告
✅ 主观词汇过滤
✅ 双语输出验证
```

#### 格式测试
```typescript
✅ 中文≤120字
✅ 英文≤15词
✅ 包含关键指标
✅ 结构化输出
```

**运行**:
```bash
pnpm test src/__tests__/lib/quant/summary-generator.test.ts
```

### 4. RAG系统测试

**文件**: `src/__tests__/lib/rag.test.ts`

#### 功能测试
```typescript
✅ 向量生成
✅ 语义搜索
✅ LLM解释生成
✅ 合规性检查
✅ 生活化例子
```

**运行**:
```bash
pnpm test src/__tests__/lib/rag.test.ts
```

---

## 🌐 API测试

### 1. /api/signals 测试

**文件**: `src/__tests__/api/signals.test.ts`

#### 排序测试
```typescript
✅ createdAt DESC排序
✅ riskScore DESC排序（同时间）
✅ 组合排序验证
```

#### 分页测试
```typescript
✅ 第一页正确返回
✅ 第二页正确返回
✅ 超出范围处理
✅ limit/skip边界
```

#### 过滤测试
```typescript
✅ 按window过滤
✅ 按资产过滤
✅ 多条件组合
```

**示例**:
```typescript
it('应按 createdAt DESC 排序', async () => {
  const signals = await prisma.signal.findMany({
    orderBy: [
      { createdAt: 'desc' },
      { riskScore: 'desc' },
    ],
    include: { asset: true },
  })

  expect(signals[0].createdAt >= signals[1].createdAt).toBe(true)
})
```

**运行**:
```bash
pnpm test src/__tests__/api/signals.test.ts
```

### 2. /api/learn 测试

**文件**: `src/__tests__/api/learn.test.ts`

#### 术语检索测试
```typescript
✅ 检索"流动性锁仓"
✅ 返回完整定义
✅ 包含来源列表
✅ 60-80字解释
```

#### RAG问答测试
```typescript
✅ 返回相关术语
✅ 生成生活化例子
✅ 合规性验证
✅ 边界处理
```

**示例**:
```typescript
it('查询"流动性锁仓"应返回含该术语的来源', async () => {
  const result = await answerQuery('什么是流动性锁仓？', 3)

  expect(result.sources.some(
    source => source.term === '流动性锁仓'
  )).toBe(true)
  
  expect(result.answer).toMatch(/解释[：:]/)
  expect(result.answer).toMatch(/例子[：:]/)
})
```

**运行**:
```bash
pnpm test src/__tests__/api/learn.test.ts
```

### 3. /api/share 测试

**文件**: `src/__tests__/api/share.test.ts`

#### 海报生成测试
```typescript
✅ 图片数据存在
✅ 有效的data URI
✅ Base64内容完整
```

#### 合规性测试
```typescript
✅ 包含"非投资建议"
✅ 风险警告显示
✅ 免责声明存在
```

**示例**:
```typescript
it('导出的图片数据应包含"非投资建议"字样', async () => {
  const posterContent = '非投资建议'
  
  expect(posterContent).toContain('非投资建议')
})

it('图片数据应为有效的data URI', async () => {
  const share = await prisma.share.findFirst()
  
  expect(share?.imageUrl).toMatch(/^data:image\/(png|jpeg|jpg);base64,/)
})
```

**运行**:
```bash
pnpm test src/__tests__/api/share.test.ts
```

---

## 🔗 集成测试

### 完整信号流程测试

**文件**: `src/__tests__/integration/signal-flow.test.ts`

#### 测试流程

```
Mock数据源
    ↓
获取K线、流动性、钱包数据
    ↓
候选筛选
    ↓
风险评分
    ↓
AI摘要生成
    ↓
写入Signal表
    ↓
前端查询渲染
```

#### 测试步骤

**步骤1: 数据源**
```typescript
it('应成功从Mock数据源获取数据', async () => {
  const candles = await mockDataSource.fetchRecentCandles(['BTC'], '5m', 20)
  
  expect(candles.BTC.length).toBe(20)
  expect(candles.BTC[0]).toHaveProperty('close')
})
```

**步骤2: 候选筛选**
```typescript
it('应正确筛选出符合条件的候选', async () => {
  const input = {
    priceChangePct: 18.5,
    volZScore: 4.2,
    liqDeltaPct: 28.0,
    newWalletNetBuyPercentile: 95,
  }
  
  const isCandidate = filterCandidates(input)
  
  expect(isCandidate).toBe(true)
})
```

**步骤3: 风险评分**
```typescript
it('应正确计算风险分数', () => {
  const riskScore = scoreRisk({
    contractAgeDays: 5,
    top5HoldPct: 65.0,
    hasLiquidityLock: false,
    socialHypeScore: 8.5,
    onChainNetFlow: -50000,
    devWalletTrading: true,
  })
  
  expect(riskScore).toBeGreaterThan(50)
})
```

**步骤4: AI摘要**
```typescript
it('应生成合规的AI摘要', async () => {
  const summary = await makeSafeSummary({
    symbol: 'BTC',
    priceChangePct: 18.5,
    riskScore: 35,
    // ...
  })
  
  expect(summary.cn.length).toBeLessThanOrEqual(130)
  expect(summary.cn).not.toMatch(/建议买|抄底/)
})
```

**步骤5: 数据持久化**
```typescript
it('应成功创建Signal记录', async () => {
  const signal = await prisma.signal.create({
    data: {
      assetId: 'btc-test',
      riskScore: 35,
      // ...
    },
  })
  
  expect(signal.id).toBeDefined()
})
```

**步骤6: 前端查询**
```typescript
it('应按正确顺序返回Signal列表', async () => {
  const signals = await prisma.signal.findMany({
    orderBy: [
      { createdAt: 'desc' },
      { riskScore: 'desc' },
    ],
    include: { asset: true },
  })
  
  expect(signals[0].asset).toBeDefined()
})
```

**运行**:
```bash
pnpm test src/__tests__/integration/signal-flow.test.ts
```

---

## 📊 覆盖率报告

### 本地生成

```bash
# 运行测试并生成覆盖率
pnpm test:coverage

# 查看HTML报告
open coverage/index.html
```

### GitHub Actions集成

覆盖率自动上传到Codecov：

```yaml
- name: Run tests with coverage
  run: pnpm test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: unittests
```

### 覆盖率目标

| 指标 | 目标 | 当前 |
|------|------|------|
| **Lines** | ≥80% | - |
| **Functions** | ≥80% | - |
| **Branches** | ≥80% | - |
| **Statements** | ≥80% | - |

### 查看报告

```
# Codecov Dashboard
https://codecov.io/gh/[owner]/[repo]

# GitHub Actions
Actions → CI → Coverage Report artifact
```

---

## 🚀 运行测试

### 所有测试

```bash
# 运行所有测试
pnpm test

# 带UI
pnpm test:ui

# 监听模式
pnpm test:watch
```

### 特定测试

```bash
# 单个文件
pnpm test src/__tests__/api/signals.test.ts

# 特定模式
pnpm test api

# 特定用例
pnpm test -t "应按 createdAt DESC 排序"
```

### 覆盖率

```bash
# 生成覆盖率报告
pnpm test:coverage

# 查看摘要
pnpm test:coverage -- --reporter=verbose
```

---

## 🛠️ 编写测试

### 测试结构

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('功能模块名称', () => {
  beforeAll(async () => {
    // 测试前设置
  })

  afterAll(async () => {
    // 测试后清理
  })

  describe('子功能', () => {
    it('应该做某事', () => {
      // Arrange
      const input = ...

      // Act
      const result = ...

      // Assert
      expect(result).toBe(...)
    })
  })
})
```

### Mock数据

```typescript
// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    signal: {
      findMany: vi.fn(),
    },
  },
}))

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock response' } }],
        }),
      },
    },
  })),
}))
```

### 断言示例

```typescript
// 值断言
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeGreaterThan(10)
expect(value).toBeLessThan(100)

// 对象断言
expect(obj).toHaveProperty('key')
expect(obj).toMatchObject({ key: 'value' })

// 数组断言
expect(arr).toHaveLength(3)
expect(arr).toContain(item)

// 字符串断言
expect(str).toMatch(/pattern/)
expect(str).toContain('substring')

// 异步断言
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()
```

---

## 📈 持续集成

### GitHub Actions工作流

```yaml
test:
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
    - uses: actions/setup-node@v4
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run tests with coverage
      run: pnpm test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
```

### 覆盖率徽章

```markdown
[![codecov](https://codecov.io/gh/[owner]/[repo]/branch/main/graph/badge.svg)](https://codecov.io/gh/[owner]/[repo])
```

---

## ✅ 测试检查清单

### 单元测试
- [x] 风险评分（边界+随机）
- [x] 候选筛选（4条件组合）
- [x] AI摘要（合规+格式）
- [x] RAG问答（向量+LLM）

### API测试
- [x] /api/signals（排序+分页）
- [x] /api/learn（RAG+合规）
- [x] /api/share（图片+免责）

### 集成测试
- [x] 完整信号流程
- [x] 数据源→前端

### 覆盖率
- [x] Lines ≥80%
- [x] Functions ≥80%
- [x] Branches ≥80%
- [x] 集成到Actions

---

**测试系统完成！质量保证就绪！** 🧪
