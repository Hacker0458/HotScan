# HotScan 快速测试指南

## 🧪 本地测试流程

### 1. 环境准备

```bash
# 确保 .env 包含必需变量
DATABASE_URL="postgresql://fang@localhost:5432/hotscan"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="dev-secret-please-change"
OPENAI_API_BASE="https://aium.cc/v1/"
OPENAI_API_KEY="sk-..."
DATASOURCE="dexscreener"
```

### 2. 测试数据拉取

```bash
# 拉取真实数据（约 30-60 秒）
pnpm jobs:fetch

# 预期输出：
# 🔄 Fetch Tickers Job Started
# 📊 Tracking 10 symbols: BTC, ETH, SOL, BNB, DOGE, PEPE, SHIB, MATIC, AVAX, LINK
# 📡 Fetching data from DexScreener...
# [DexScreener] Fetching BTC...
# [DexScreener] ✓ BTC: $67890.12, liquidity: $1,500,000,000
# ...
# ✅ Fetched 10/10 tokens
# 📊 Assets: 10 created, 0 updated
# 💱 Pairs: 10 created/updated
# ⏱️  Duration: 45.23s
```

### 3. 测试信号生成

```bash
# 生成交易信号（约 10-20 秒）
pnpm jobs:signals

# 预期输出：
# 📡 Make Signals Job Started
# 📊 Fetching latest data for 10 tokens...
# ✅ Fetched 10 tokens
# ✓ BTC: +1.56%, Risk: 15/100, Signals: 3
# ✓ ETH: +2.34%, Risk: 25/100, Signals: 3
# ✓ PEPE: +8.95%, Risk: 68/100, Signals: 3
# ...
# 📡 Signals created: 30
# ⏱️  Duration: 15.45s
```

### 4. 测试 API

```bash
# 测试信号 API
curl -s "http://localhost:3001/api/signals?limit=3" | jq '.data[0]'

# 预期输出（JSON）：
{
  "id": "cm...",
  "window": "1h",
  "priceChangePct": 2.34,
  "currentPrice": 3890.21,
  "volumeUSD": 250000000,
  "totalLiquidityUSD": 1200000000,
  "riskScore": 25.0,
  "sentiment": "bullish",
  "aiSummary": "ETH 1小时上涨2.3%，流动性$1200.0M...",
  "alertLevel": "low",
  "asset": {
    "symbol": "ETH",
    "name": "Ethereum",
    "chain": "ethereum"
  }
}
```

### 5. 测试前端

```bash
# 启动开发服务器
pnpm dev -p 3001

# 访问页面：
# http://localhost:3001/          - 首页（信号列表）
# http://localhost:3001/learn     - 术语百科
# http://localhost:3001/analytics - 分析面板
```

## ✅ 验证清单

### 数据层

- [ ] `pnpm jobs:fetch` 成功拉取 10 个代币数据
- [ ] `Asset` 表包含 10 条记录
- [ ] `Pair` 表包含 10 条记录
- [ ] `pnpm jobs:signals` 成功生成 30 个信号
- [ ] `Signal` 表包含 30 条记录（每个代币 3 个时间窗口）

### API 层

- [ ] `/api/signals?limit=5` 返回 JSON 数组
- [ ] 每个信号包含 `asset`, `priceChangePct`, `riskScore`
- [ ] 风险评分在 0-100 之间
- [ ] AI 摘要包含中文描述

### 前端

- [ ] 首页显示真实信号卡片
- [ ] 信号卡片包含代币名称、价格变化、风险评分
- [ ] 点击"查看详情"可跳转到详情页
- [ ] `/learn` 页面可以查询术语
- [ ] `/analytics` 页面显示统计数据

## 🔍 常见问题

### DexScreener API 返回空数组

**可能原因**: 
- 网络问题
- API 限流
- 代币符号不正确

**解决方案**:
```bash
# 切换到 Mock 数据源测试
DATASOURCE=mock pnpm jobs:fetch
DATASOURCE=mock pnpm jobs:signals
```

### 信号生成失败

**可能原因**:
- Asset 不存在
- OpenAI API 密钥无效

**解决方案**:
```bash
# 检查 Asset 表
psql postgresql://fang@localhost:5432/hotscan -c "SELECT symbol FROM \"Asset\";"

# 检查 OpenAI API
curl https://aium.cc/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"
```

### 首页显示旧数据

**解决方案**:
```bash
# 清空旧信号
psql postgresql://fang@localhost:5432/hotscan -c "DELETE FROM \"Signal\";"

# 重新生成
pnpm jobs:fetch && pnpm jobs:signals

# 刷新浏览器
```

## 📊 示例输出

### Signal 表查询

```sql
SELECT 
  a.symbol,
  s.window,
  s."priceChangePct",
  s."riskScore",
  s."alertLevel"
FROM "Signal" s
JOIN "Asset" a ON s."assetId" = a.id
ORDER BY s."createdAt" DESC
LIMIT 5;
```

**预期结果**:
```
 symbol | window | priceChangePct | riskScore | alertLevel 
--------+--------+----------------+-----------+------------
 PEPE   | 1d     |           8.95 |      68.5 | high
 PEPE   | 1h     |           8.95 |      68.5 | high
 PEPE   | 5m     |           8.95 |      68.5 | high
 ETH    | 1d     |           2.34 |      25.0 | low
 ETH    | 1h     |           2.34 |      25.0 | low
```

## 🚀 准备部署

所有测试通过后：

```bash
# 1. 提交代码
git add .
git commit -m "Ready for production deployment"
git push origin main

# 2. 部署到 Vercel
# 在 Vercel 控制台导入仓库并配置环境变量

# 3. 配置 GitHub Secrets
# 在仓库设置中添加定时任务所需的 Secrets

# 4. 验证生产环境
curl https://your-domain.vercel.app/api/signals?limit=3
```

