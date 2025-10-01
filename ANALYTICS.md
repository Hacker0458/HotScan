# 📊 PostHog 分析系统文档

HotScan - 完整的用户行为分析和产品指标追踪

---

## 🎯 系统概述

基于PostHog的企业级分析系统，追踪用户行为、产品使用和业务指标。

### 核心功能

1. **事件追踪** - 5个关键业务事件
2. **用户行为** - 页面浏览、阅读时长、点击路径
3. **性能监控** - API响应时间、页面加载
4. **业务指标** - 留存、分享率、DAU、阅读时长
5. **自定义看板** - 实时监控关键指标

---

## 📊 关键事件定义

### 1. signal_viewed（查看信号）

**触发时机**: 用户查看资产信号详情

**事件属性**:
```typescript
{
  symbol: 'BTC',           // 资产符号
  assetId: 'asset-123',    // 资产ID
  assetName: 'Bitcoin',    // 资产名称
  riskScore: 25,           // 风险分数 (0-100)
  window: '1h',            // 时间窗口
  source: 'home_list',     // 来源页面
}
```

**使用场景**:
- 首页信号列表点击
- 详情页直接访问
- 搜索结果点击

**代码示例**:
```typescript
import { trackSignalViewed } from '@/lib/analytics'

trackSignalViewed({
  symbol: 'BTC',
  assetId: 'asset-123',
  assetName: 'Bitcoin',
  riskScore: 25,
  window: '1h',
  source: 'home_list',
})
```

### 2. share_generated（生成分享）

**触发时机**: 用户生成海报并创建分享链接

**事件属性**:
```typescript
{
  symbol: 'BTC',           // 资产符号
  assetId: 'asset-123',    // 资产ID
  shareId: 'abc12xyz',     // 短链ID
  source: 'asset_detail',  // 生成来源
}
```

**使用场景**:
- 资产详情页生成海报
- 海报预览页分享

**代码示例**:
```typescript
import { trackShareGenerated } from '@/lib/analytics'

trackShareGenerated({
  symbol: 'BTC',
  assetId: 'asset-123',
  shareId: 'abc12xyz',
  source: 'asset_detail',
})
```

### 3. term_clicked（点击术语）

**触发时机**: 用户点击术语查看定义

**事件属性**:
```typescript
{
  term: 'DeFi',            // 术语名称
  source: 'learn_page',    // 点击来源
}
```

**使用场景**:
- 术语库页面点击
- RAG问答中的术语链接
- 相关术语推荐

**代码示例**:
```typescript
import { trackTermClicked } from '@/lib/analytics'

trackTermClicked({
  term: 'DeFi',
  source: 'learn_page',
})
```

### 4. subscribe_tag（订阅标签）

**触发时机**: 用户订阅资产或标签

**事件属性**:
```typescript
{
  tag: 'BTC_Alerts',       // 订阅标签
  source: 'asset_detail',  // 订阅来源
}
```

**使用场景**:
- 资产详情页订阅
- 订阅管理页面

**代码示例**:
```typescript
import { trackSubscribeTag } from '@/lib/analytics'

trackSubscribeTag({
  tag: 'BTC_Alerts',
  source: 'asset_detail',
})
```

### 5. ai_summary_copied（复制AI摘要）

**触发时机**: 用户复制AI生成的摘要

**事件属性**:
```typescript
{
  symbol: 'BTC',           // 资产符号
  assetId: 'asset-123',    // 资产ID
  source: 'asset_detail',  // 复制来源
}
```

**使用场景**:
- 信号详情页复制摘要
- 分享预览复制

**代码示例**:
```typescript
import { trackAiSummaryCopied } from '@/lib/analytics'

trackAiSummaryCopied({
  symbol: 'BTC',
  assetId: 'asset-123',
  source: 'asset_detail',
})
```

---

## 📈 关键指标定义

### 1. 留存率（Retention Rate）

**定义**: 用户在首次访问后继续返回的比例

**计算公式**:
```
Day 1留存 = (Day 1回访用户数 / 新用户数) × 100%
Day 7留存 = (Day 7回访用户数 / 新用户数) × 100%
Day 30留存 = (Day 30回访用户数 / 新用户数) × 100%
```

**PostHog配置**:
```
Insights → Retention
Event: $pageview
Return Event: $pageview
Time Intervals: Day 1, 7, 14, 30
```

**目标值**:
- Day 1留存: ≥40%
- Day 7留存: ≥20%
- Day 30留存: ≥10%

### 2. 分享率（Share Rate）

**定义**: 查看信号的用户中生成分享的比例

**计算公式**:
```
分享率 = (share_generated事件数 / signal_viewed事件数) × 100%
```

**PostHog配置**:
```
Insights → Funnel
Step 1: signal_viewed
Step 2: share_generated
Conversion Window: 1 hour
```

**目标值**:
- 整体分享率: ≥5%
- 高风险资产分享率: ≥10%

### 3. 点击率/DAU（Engagement Rate）

**定义**: 日活跃用户中执行关键操作的比例

**计算公式**:
```
点击率 = (执行关键操作的用户数 / DAU) × 100%

关键操作:
  - signal_viewed
  - term_clicked
  - learn_query_submitted
```

**PostHog配置**:
```
Insights → Trends
Events: signal_viewed, term_clicked, learn_query_submitted
Formula: unique_users(events) / unique_users($pageview)
```

**目标值**:
- 信号查看率: ≥60%
- 术语点击率: ≥30%
- 学习查询率: ≥15%

### 4. 阅读时长（Reading Time）

**定义**: 用户在内容页面的平均停留时间

**计算公式**:
```
平均阅读时长 = Σ(页面停留时间) / 用户数
```

**PostHog配置**:
```
Insights → Trends
Event: $pageleave
Property: $duration (seconds)
Aggregation: Average
Filters:
  - Page URL contains: /asset/
  - Duration > 3 seconds
```

**目标值**:
- 信号详情: ≥30秒
- 术语定义: ≥20秒
- 学习问答: ≥45秒

---

## 📊 PostHog 看板模板

### 看板1: 核心业务指标

**指标卡片**:

1. **DAU（日活跃用户）**
```
Type: Trend
Event: $pageview
Aggregation: Unique users
Interval: Day
```

2. **信号查看次数**
```
Type: Trend
Event: signal_viewed
Aggregation: Total count
Interval: Day
```

3. **分享生成次数**
```
Type: Trend
Event: share_generated
Aggregation: Total count
Interval: Day
```

4. **术语点击次数**
```
Type: Trend
Event: term_clicked
Aggregation: Total count
Interval: Day
```

### 看板2: 用户留存分析

**指标卡片**:

1. **用户留存表**
```
Type: Retention
First Event: $pageview
Return Event: $pageview
Time Intervals: 1, 3, 7, 14, 30 days
```

2. **功能留存**
```
Type: Retention
First Event: signal_viewed
Return Event: signal_viewed
Time Intervals: 1, 3, 7 days
```

3. **新用户趋势**
```
Type: Trend
Event: $pageview
Filter: User is new
Aggregation: Unique users
Interval: Day
```

### 看板3: 转化漏斗

**漏斗配置**:

**信号查看 → 分享转化**
```
Step 1: signal_viewed
Step 2: poster_downloaded OR share_generated
Conversion Window: 30 minutes
```

**学习路径转化**
```
Step 1: $pageview (path: /learn)
Step 2: learn_query_submitted
Step 3: term_clicked
Conversion Window: 1 hour
```

**订阅转化**
```
Step 1: signal_viewed
Step 2: asset_detail_viewed
Step 3: subscribe_tag
Conversion Window: 1 day
```

### 看板4: 内容分析

**指标卡片**:

1. **热门资产Top 10**
```
Type: Trend
Event: signal_viewed
Breakdown: symbol property
Aggregation: Total count
Sort: Descending
Limit: 10
```

2. **热门术语Top 10**
```
Type: Trend
Event: term_clicked
Breakdown: term property
Aggregation: Total count
Sort: Descending
Limit: 10
```

3. **平均阅读时长**
```
Type: Trend
Event: $pageleave
Property: $duration
Aggregation: Average
Filter: $duration > 3
```

### 看板5: 分享效果

**指标卡片**:

1. **分享生成趋势**
```
Type: Trend
Event: share_generated
Aggregation: Total count
Interval: Day
```

2. **短链访问次数**
```
Type: Trend
Event: short_link_visited
Aggregation: Total count
Interval: Day
```

3. **分享转化率**
```
Type: Formula
Numerator: count(short_link_visited)
Denominator: count(share_generated)
Result: Conversion %
```

---

## 🔧 实现指南

### 1. 前端集成

#### 初始化（Layout）

```typescript
// app/layout.tsx
import { AnalyticsProvider } from '@/components/analytics-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  )
}
```

#### 事件追踪（组件）

```typescript
// 信号卡片点击
import { trackSignalViewed } from '@/lib/analytics'

function SignalCard({ signal }) {
  const handleClick = () => {
    trackSignalViewed({
      symbol: signal.asset.symbol,
      assetId: signal.assetId,
      assetName: signal.asset.name,
      riskScore: signal.riskScore,
      window: signal.window,
      source: 'home_list',
    })
    
    router.push(`/asset/${signal.assetId}`)
  }
  
  return <Card onClick={handleClick}>...</Card>
}
```

#### 阅读时长追踪

```typescript
// 资产详情页
import { useReadingTime } from '@/hooks/use-reading-time'

function AssetDetail({ asset }) {
  useReadingTime('asset', asset.id, {
    minDuration: 3, // 最少3秒
    enabled: true,
  })
  
  return <div>...</div>
}
```

### 2. API集成

#### 服务端事件追踪

```typescript
// app/api/share/route.ts
import { trackServerEvent } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  const userId = await getUserId(request)
  const { assetId, shareId } = await request.json()
  
  // 追踪服务端事件
  trackServerEvent(userId, 'share_generated', {
    assetId,
    shareId,
    source: 'api',
  })
  
  // ... 业务逻辑
}
```

### 3. 环境变量

```bash
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 📊 PostHog 仪表盘使用

### 步骤1: 登录PostHog

```
1. 访问 https://app.posthog.com
2. 登录账户
3. 选择项目: HotScan
```

### 步骤2: 创建看板

```
1. 点击 "Dashboards" → "New Dashboard"
2. 命名: "HotScan - 核心指标"
3. 点击 "Add Insight"
```

### 步骤3: 添加指标

#### DAU指标

```
1. Type: Trend
2. Event: $pageview
3. Aggregation: Unique users
4. Interval: Day
5. Date Range: Last 30 days
6. Save: "日活跃用户"
```

#### 信号查看趋势

```
1. Type: Trend
2. Event: signal_viewed
3. Aggregation: Total count
4. Breakdown by: symbol
5. Top 5 symbols
6. Save: "热门信号 Top 5"
```

#### 留存表

```
1. Type: Retention
2. First Event: $pageview
3. Return Event: $pageview
4. Time Intervals: 1, 3, 7, 14, 30 days
5. Save: "用户留存"
```

#### 分享转化漏斗

```
1. Type: Funnel
2. Step 1: signal_viewed
3. Step 2: share_generated
4. Conversion Window: 30 minutes
5. Save: "信号 → 分享转化"
```

### 步骤4: 设置告警

```
1. 选择指标卡片
2. 点击 "..." → "Set Alert"
3. 配置条件:
   - DAU下降 > 20%
   - 分享率 < 3%
   - 错误率 > 5%
4. 通知方式: Email, Slack
```

### 步骤5: 导出报告

```
1. 点击 "..." → "Export"
2. 格式: PDF, CSV, Image
3. 定时报告: Weekly on Monday
```

---

## 📈 数据分析流程

### 每日监控

```
1. 查看 DAU 趋势
2. 检查核心事件数量
   - signal_viewed
   - share_generated
   - term_clicked
3. 查看留存曲线
4. 分析异常指标
```

### 每周分析

```
1. 对比上周数据
2. 分析转化漏斗
3. 查看用户路径
4. 识别增长机会
```

### 月度回顾

```
1. 月度留存报告
2. 功能使用排名
3. 用户群组分析
4. ROI计算
```

---

## 🎯 关键指标目标

| 指标 | 当前值 | 目标值 | 优秀值 |
|------|--------|--------|--------|
| **DAU** | - | 1,000 | 10,000 |
| **Day 7留存** | - | 20% | 40% |
| **信号查看率** | - | 60% | 80% |
| **分享率** | - | 5% | 15% |
| **平均阅读时长** | - | 30s | 60s |
| **术语点击率** | - | 30% | 50% |
| **订阅转化率** | - | 2% | 5% |

---

## ✅ 验证清单

- [x] PostHog初始化（前端+后端）
- [x] 5个关键事件埋点
- [x] 事件属性定义
- [x] 阅读时长追踪
- [x] 页面浏览自动追踪
- [x] 用户识别集成
- [x] 看板模板定义
- [x] 关键指标定义
- [x] 使用指南文档
- [x] 环境变量配置

---

**PostHog分析系统完成！数据驱动增长！** 📊
