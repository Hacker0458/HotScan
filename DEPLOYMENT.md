# HotScan 部署指南

## 📋 环境变量清单

### Vercel 环境变量

在 Vercel 项目设置 > Environment Variables 中配置：

```env
# 数据库（必需）
DATABASE_URL=postgresql://user:password@host:5432/database

# 认证（必需）
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# OpenAI（必需）
OPENAI_API_KEY=sk-...
OPENAI_API_BASE=https://api.openai.com/v1

# 数据源（可选，默认 dexscreener）
DATASOURCE=dexscreener

# 分析工具（可选）
POSTHOG_KEY=phc_...
SENTRY_DSN=https://...@sentry.io/...
MOCK_AI=0
```

### GitHub Secrets

在仓库 Settings > Secrets and variables > Actions 中配置：

```
DATABASE_URL
OPENAI_API_KEY
OPENAI_API_BASE
DATASOURCE
```

## 🚀 部署步骤

### 1. Vercel 部署

```bash
# 1. 推送代码到 GitHub
git add .
git commit -m "Upgrade to production with DexScreener"
git push origin main

# 2. 在 Vercel 导入仓库
# https://vercel.com/new

# 3. 配置环境变量（参考上方清单）

# 4. 部署会自动触发
```

### 2. 数据库迁移（首次部署）

```bash
# 在 Vercel 项目设置中运行
npx prisma migrate deploy
npx prisma db seed
```

### 3. 验证部署

```bash
# 检查 API
curl https://your-domain.vercel.app/api/signals?limit=5

# 检查首页
open https://your-domain.vercel.app
```

## ⏰ 定时任务

### GitHub Actions Cron

- **频率**: 每 30 分钟
- **任务**:
  1. `fetch-tickers`: 从 DexScreener 拉取数据
  2. `make-signals`: 生成交易信号

### 手动触发

在 GitHub Actions 页面:
1. 选择 "Scheduled Data Fetch"
2. 点击 "Run workflow"

## 📊 API 示例

### GET /api/signals

**请求:**
```bash
curl https://your-domain.vercel.app/api/signals?limit=5&window=1h
```

**响应（示例）:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "window": "1h",
      "priceChangePct": 12.5,
      "currentPrice": 0.00000789,
      "volumeUSD": 120000000,
      "totalLiquidityUSD": 52000000,
      "riskScore": 68.5,
      "sentiment": "bullish",
      "aiSummary": "PEPE 1小时上涨12.5%，流动性$52.0M...",
      "alertLevel": "medium",
      "asset": {
        "id": "clx...",
        "symbol": "PEPE",
        "name": "Pepe",
        "chain": "ethereum"
      },
      "createdAt": "2025-10-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 5,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /api/learn

**请求:**
```bash
curl "https://your-domain.vercel.app/api/learn?q=流动性锁仓"
```

**响应（示例）:**
```json
{
  "success": true,
  "data": {
    "query": "流动性锁仓",
    "answer": "流动性锁仓是指将 DEX 的流动性池代币锁定...",
    "sources": [
      {
        "term": "流动性锁仓",
        "definition": "将流动性池代币锁定在智能合约中...",
        "similarity": 0.95
      }
    ]
  }
}
```

## 🔍 监控

### 日志查看

- **Vercel**: 在项目 > Deployments > 选择部署 > Functions 查看日志
- **GitHub Actions**: 在 Actions 页面查看工作流运行日志

### 性能指标

- **PostHog**: 用户行为分析
- **Sentry**: 错误追踪和监控

## 🐛 故障排查

### 数据库连接失败

```bash
# 检查 DATABASE_URL 是否正确
# 确保数据库允许外部连接
# 检查 Vercel 函数区域与数据库区域延迟
```

### DexScreener API 超时

```bash
# 增加 fetch 超时时间
# 检查网络连接
# 使用 DATASOURCE=mock 进行测试
```

### 定时任务失败

```bash
# 检查 GitHub Secrets 是否配置正确
# 查看 Actions 运行日志
# 手动触发测试
```

## 📚 相关资源

- [DexScreener API 文档](https://docs.dexscreener.com/)
- [Vercel 部署文档](https://vercel.com/docs)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [Prisma 文档](https://www.prisma.io/docs)
