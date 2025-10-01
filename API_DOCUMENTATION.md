# 📡 HotScan API 文档

完整的 REST API 参考文档

---

## 📚 目录

- [快速开始](#快速开始)
- [认证](#认证)
- [端点列表](#端点列表)
- [错误处理](#错误处理)
- [频率限制](#频率限制)
- [示例代码](#示例代码)

---

## 🚀 快速开始

### Base URL

```
Production:  https://hotscan.vercel.app
Development: http://localhost:3000
```

### 查看 OpenAPI 规范

```bash
# 在线查看（推荐）
https://editor.swagger.io/?url=https://hotscan.vercel.app/openapi.yaml

# 本地查看
npx @redocly/cli preview-docs openapi.yaml
```

### 第一个请求

```bash
# 获取最新交易信号
curl https://hotscan.vercel.app/api/signals?window=1h&limit=10
```

---

## 🔐 认证

### 公开端点

以下端点**无需认证**：
- `GET /api/signals`
- `GET /api/assets/{id}`
- `GET /api/learn`
- `POST /api/share`

### 受保护端点

以下端点需要 `X-Cron-Secret` 头：
- `POST /api/jobs/fetch-tickers`
- `POST /api/jobs/make-signals`

**示例**：
```bash
curl -X POST \
  https://hotscan.vercel.app/api/jobs/make-signals \
  -H "X-Cron-Secret: your_secret_here"
```

**配置**：
```bash
# .env
CRON_SECRET="your_random_secret_key"
```

---

## 📋 端点列表

### 1. 获取交易信号

**端点**: `GET /api/signals`

**描述**: 查询交易信号，按 `createdAt DESC, riskScore DESC` 排序

**参数**:
| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `window` | string | ❌ | 时间窗口 | `5m`, `1h`, `4h` |
| `limit` | integer | ❌ | 返回数量（1-100） | `20` |
| `minRiskScore` | number | ❌ | 最低风险分数 | `60` |
| `assetSymbol` | string | ❌ | 资产符号 | `BTC` |
| `sentiment` | string | ❌ | 情绪过滤 | `bullish` |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123abc",
      "assetId": "clx456def",
      "window": "1h",
      "priceChangePct": 3.45,
      "currentPrice": 67234.50,
      "volZScore": 2.8,
      "riskScore": 35.5,
      "sentiment": "bullish",
      "aiSummary": "BTC稳健上涨，机构资金持续流入",
      "createdAt": "2024-10-01T12:00:00Z",
      "asset": {
        "id": "clx456def",
        "symbol": "BTC",
        "name": "Bitcoin",
        "chain": "bitcoin"
      }
    }
  ],
  "meta": {
    "total": 125,
    "limit": 20,
    "window": "1h"
  }
}
```

**cURL 示例**:
```bash
curl "https://hotscan.vercel.app/api/signals?window=1h&limit=20&minRiskScore=60"
```

---

### 2. 获取资产详情

**端点**: `GET /api/assets/{id}`

**描述**: 获取资产完整信息，包括交易对和最新信号

**参数**:
| 参数 | 类型 | 必需 | 说明 | 默认值 |
|------|------|------|------|--------|
| `id` | string | ✅ | 资产 ID（路径参数） | - |
| `includeSignals` | boolean | ❌ | 包含信号 | `true` |
| `includePairs` | boolean | ❌ | 包含交易对 | `true` |
| `signalLimit` | integer | ❌ | 信号数量 | `5` |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "symbol": "BTC",
    "name": "Bitcoin",
    "chain": "bitcoin",
    "logo": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    "pairs": [
      {
        "id": "clxpair001",
        "dex": "uniswap-v3",
        "liquidityUSD": 125000000,
        "baseToken": "USDC"
      }
    ],
    "signals": [
      {
        "id": "clx123abc",
        "window": "1h",
        "priceChangePct": 3.45,
        "riskScore": 35.5,
        "sentiment": "bullish"
      }
    ],
    "stats": {
      "totalSignals": 1248,
      "avgRiskScore": 32.5,
      "last24hChange": 2.34
    }
  }
}
```

**cURL 示例**:
```bash
curl "https://hotscan.vercel.app/api/assets/clx456def?includeSignals=true"
```

---

### 3. RAG 术语问答

**端点**: `GET /api/learn`

**描述**: 基于 RAG 的金融术语智能问答

**参数**:
| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `q` | string | ✅ | 问题 | `什么是流动性池？` |
| `language` | string | ❌ | 语言 | `zh`, `en` |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "answer": "流动性池是 DeFi 中的智能合约，包含锁定的代币对...",
    "sources": [
      {
        "term": "Liquidity Pool",
        "definition": "流动性池是 DeFi 中的智能合约...",
        "category": "defi",
        "similarity": 0.95
      }
    ],
    "relatedTerms": [
      "Impermanent Loss",
      "AMM",
      "Slippage"
    ],
    "confidence": 0.92
  }
}
```

**cURL 示例**:
```bash
curl -G "https://hotscan.vercel.app/api/learn" \
  --data-urlencode "q=什么是流动性池？"
```

---

### 4. 生成分享海报

**端点**: `POST /api/share`

**描述**: 生成 9:16 分享海报图片

**请求体**:
```json
{
  "assetId": "clx456def",
  "title": "BTC 突破 $67K 关键阻力",
  "description": "机构资金持续流入，风险评分低",
  "metrics": {
    "price": 67234.50,
    "change24h": 3.45,
    "riskScore": 35.5,
    "sentiment": "bullish"
  },
  "template": "signal"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "shareId": "clxshare001",
    "imageUrl": "https://cdn.hotscan.io/shares/clxshare001.png",
    "shareUrl": "https://hotscan.vercel.app/share/clxshare001",
    "expiresAt": "2024-10-08T12:00:00Z"
  }
}
```

**cURL 示例**:
```bash
curl -X POST https://hotscan.vercel.app/api/share \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "clx456def",
    "title": "BTC 突破 $67K",
    "metrics": {"price": 67234.50, "change24h": 3.45}
  }'
```

---

### 5. 触发数据抓取任务 🔒

**端点**: `POST /api/jobs/fetch-tickers`

**描述**: 触发后台数据抓取任务（需要认证）

**请求头**:
```
X-Cron-Secret: your_secret_here
```

**请求体**（可选）:
```json
{
  "force": false,
  "limit": 50
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "jobId": "clxjob001",
    "jobName": "fetch-tickers",
    "status": "running",
    "startedAt": "2024-10-01T12:00:00Z",
    "message": "数据抓取任务已启动"
  }
}
```

**cURL 示例**:
```bash
curl -X POST https://hotscan.vercel.app/api/jobs/fetch-tickers \
  -H "X-Cron-Secret: $CRON_SECRET"
```

---

### 6. 触发信号生成任务 🔒

**端点**: `POST /api/jobs/make-signals`

**描述**: 触发后台信号生成任务（需要认证）

**请求头**:
```
X-Cron-Secret: your_secret_here
```

**请求体**（可选）:
```json
{
  "windows": ["5m", "1h", "4h"],
  "minVolume": 100000
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "jobId": "clxjob002",
    "jobName": "make-signals",
    "status": "running",
    "startedAt": "2024-10-01T12:00:00Z",
    "message": "信号生成任务已启动",
    "metadata": {
      "windows": ["5m", "1h", "4h"],
      "estimatedDuration": 60
    }
  }
}
```

**cURL 示例**:
```bash
curl -X POST https://hotscan.vercel.app/api/jobs/make-signals \
  -H "X-Cron-Secret: $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"windows": ["5m", "1h"]}'
```

---

## ❌ 错误处理

### 错误响应格式

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误消息",
    "details": {
      "field": "field_name",
      "constraint": "具体约束"
    },
    "timestamp": "2024-10-01T12:00:00Z"
  }
}
```

### 常见错误码

| HTTP 状态 | 错误码 | 说明 | 解决方案 |
|-----------|--------|------|----------|
| 400 | `VALIDATION_ERROR` | 参数验证失败 | 检查请求参数 |
| 400 | `MISSING_PARAMETER` | 缺少必需参数 | 补充缺失参数 |
| 401 | `UNAUTHORIZED` | 缺少认证信息 | 提供 X-Cron-Secret |
| 401 | `INVALID_CREDENTIALS` | 认证凭证无效 | 检查密钥是否正确 |
| 404 | `NOT_FOUND` | 资源不存在 | 检查资源 ID |
| 429 | `RATE_LIMIT_EXCEEDED` | 超过频率限制 | 稍后重试 |
| 500 | `INTERNAL_SERVER_ERROR` | 服务器错误 | 联系支持 |
| 500 | `DATABASE_ERROR` | 数据库错误 | 联系支持 |

### 错误示例

#### 400 - 参数验证失败
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": {
      "field": "window",
      "constraint": "必须是 5m, 15m, 1h, 4h, 1d 之一"
    },
    "timestamp": "2024-10-01T12:00:00Z"
  }
}
```

#### 401 - 未授权
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "缺少或无效的认证凭证",
    "details": {
      "required": "X-Cron-Secret header"
    },
    "timestamp": "2024-10-01T12:00:00Z"
  }
}
```

#### 429 - 频率超限
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求频率超过限制",
    "details": {
      "limit": 100,
      "window": 60,
      "retryAfter": 30
    },
    "timestamp": "2024-10-01T12:00:00Z"
  }
}
```

---

## 🚦 频率限制

### 限制策略

| 端点类型 | 限制 | 窗口 |
|----------|------|------|
| 公开查询 | 100 次/分钟 | 每 IP |
| RAG 问答 | 20 次/分钟 | 每 IP |
| 海报生成 | 10 次/分钟 | 每 IP |
| 后台任务 | 5 次/分钟 | 全局 |

### 响应头

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696161600
```

### 超限处理

当超过频率限制时：
1. 返回 429 状态码
2. 响应包含 `retryAfter` 字段（秒）
3. 等待指定时间后重试

---

## 💻 示例代码

### JavaScript / TypeScript

```typescript
// 获取交易信号
async function getSignals() {
  const response = await fetch(
    'https://hotscan.vercel.app/api/signals?window=1h&limit=20'
  )
  const data = await response.json()
  
  if (data.success) {
    console.log('Signals:', data.data)
  } else {
    console.error('Error:', data.error)
  }
}

// RAG 问答
async function askQuestion(question: string) {
  const response = await fetch(
    `https://hotscan.vercel.app/api/learn?q=${encodeURIComponent(question)}`
  )
  const data = await response.json()
  
  return data.data.answer
}

// 生成海报
async function generatePoster(assetId: string, title: string) {
  const response = await fetch(
    'https://hotscan.vercel.app/api/share',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId, title }),
    }
  )
  
  const data = await response.json()
  return data.data.imageUrl
}

// 触发任务（需要认证）
async function triggerJob() {
  const response = await fetch(
    'https://hotscan.vercel.app/api/jobs/make-signals',
    {
      method: 'POST',
      headers: {
        'X-Cron-Secret': process.env.CRON_SECRET!,
      },
    }
  )
  
  return await response.json()
}
```

### Python

```python
import requests

# 获取交易信号
def get_signals(window='1h', limit=20):
    url = 'https://hotscan.vercel.app/api/signals'
    params = {'window': window, 'limit': limit}
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['success']:
        return data['data']
    else:
        raise Exception(data['error']['message'])

# RAG 问答
def ask_question(question):
    url = 'https://hotscan.vercel.app/api/learn'
    params = {'q': question}
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return data['data']['answer']

# 触发任务
def trigger_signals_job(cron_secret):
    url = 'https://hotscan.vercel.app/api/jobs/make-signals'
    headers = {'X-Cron-Secret': cron_secret}
    
    response = requests.post(url, headers=headers)
    return response.json()
```

### cURL

```bash
# 获取信号
curl "https://hotscan.vercel.app/api/signals?window=1h&limit=20"

# 获取资产详情
curl "https://hotscan.vercel.app/api/assets/clx456def"

# RAG 问答
curl -G "https://hotscan.vercel.app/api/learn" \
  --data-urlencode "q=什么是 AMM？"

# 生成海报
curl -X POST https://hotscan.vercel.app/api/share \
  -H "Content-Type: application/json" \
  -d '{"assetId":"clx456def","title":"BTC 突破"}'

# 触发任务
curl -X POST https://hotscan.vercel.app/api/jobs/make-signals \
  -H "X-Cron-Secret: $CRON_SECRET"
```

---

## 🔗 相关资源

### 文档
- [OpenAPI 规范](./openapi.yaml)
- [数据库设计](./DATABASE.md)
- [项目 README](./README-V2.md)

### 工具
- [Swagger Editor](https://editor.swagger.io/) - 在线查看 OpenAPI
- [Postman](https://www.postman.com/) - API 测试
- [HTTPie](https://httpie.io/) - 命令行 HTTP 客户端

### 在线预览

```bash
# 使用 Redocly
npx @redocly/cli preview-docs openapi.yaml

# 使用 Swagger UI
npx swagger-ui-watcher openapi.yaml
```

---

**API 文档完成！开始构建你的应用吧！** 🚀
