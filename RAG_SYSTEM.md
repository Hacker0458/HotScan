# 🔍 RAG 术语问答系统文档

HotScan - 智能术语检索与新手友好解释

---

## 🎯 系统概述

基于pgvector的RAG（Retrieval Augmented Generation）系统，为新手提供友好的DeFi/加密货币术语解释。

### 核心功能

1. **术语向量化** - 50条专业术语批量嵌入
2. **语义检索** - pgvector余弦相似度搜索
3. **智能问答** - GPT-4生成新手友好解释
4. **合规保障** - 禁止投资建议和收益承诺

---

## 📊 术语库

### 50条专业术语分类

#### 1. DeFi 基础 (5个)
```
- DeFi (去中心化金融)
- AMM (自动做市商)
- 流动性池
- 流动性锁仓
- 滑点
```

#### 2. 持仓与地址 (4个)
```
- 持币集中度
- 鲸鱼地址
- Dev地址
- 新钱包
```

#### 3. 风险与欺诈 (5个)
```
- 拉高出货
- Rug Pull
- 蜜罐合约
- 女巫攻击
- 闪电贷攻击
```

#### 4. 交易与策略 (5个)
```
- 做市
- 套利
- 无常损失
- Gas费
- 抢跑交易
```

#### 5. 代币经济 (5个)
```
- 代币经济学
- 通缩代币
- 增发
- 空投
- 质押
```

#### 6. 技术指标 (5个)
```
- TVL (总锁定价值)
- 市值
- 成交量
- FDV (完全稀释估值)
- 深度
```

#### 7. 智能合约 (5个)
```
- 智能合约
- 合约审计
- 可升级合约
- 多签钱包
- 时间锁
```

#### 8. 链与网络 (4个)
```
- 跨链桥
- Layer 2
- 侧链
- EVM兼容
```

#### 9. 治理与社区 (4个)
```
- DAO
- 治理代币
- 提案
- 快照投票
```

#### 10. 安全与隐私 (5个)
```
- 私钥
- 助记词
- 冷钱包
- 白名单
- 授权
```

#### 11. 市场与交易 (4个)
```
- CEX (中心化交易所)
- DEX (去中心化交易所)
- 挂单
- 止损
```

**总计: 50个术语**

---

## 🔧 技术架构

### 1. 向量化流程

```
术语定义 → OpenAI Embedding (ada-002)
         ↓
    1536维向量
         ↓
    pgvector存储
```

#### 向量模型
- **模型**: `text-embedding-ada-002`
- **维度**: 1536
- **成本**: ~$0.0001 / 1K tokens
- **性能**: 毫秒级响应

### 2. 检索流程

```
用户查询 → 生成查询向量
        ↓
   余弦相似度搜索 (pgvector)
        ↓
   Top-K 相关术语
        ↓
   返回匹配结果
```

#### 相似度计算
```sql
SELECT 
  term,
  definition,
  1 - (embedding <=> query_vector) as similarity
FROM "Term"
ORDER BY embedding <=> query_vector
LIMIT k
```

### 3. 生成流程

```
检索到的术语 → 构建上下文
            ↓
        GPT-4 生成
            ↓
    新手友好解释 (60-80字)
            ↓
    生活化例子 (1个)
```

---

## 📝 问答格式

### 标准输出格式

```
解释：[60-80字的清晰解释，使用新手能理解的语言]

例子：[1个生活化的类比，帮助理解抽象概念]
```

### 示例1: DeFi

**用户问题**: "什么是DeFi？"

**AI回答**:
```
解释：DeFi是去中心化金融的缩写，指建立在区块链上的金融服务，无需银行等中介。用户通过智能合约直接进行借贷、交易和投资，资产由自己控制。

例子：就像传统银行存款需要银行作为中间人，而DeFi就像你和朋友之间直接借钱，用一份不可篡改的合同保证，不需要银行介入。
```

### 示例2: 流动性锁仓

**用户问题**: "流动性锁仓是什么意思？"

**AI回答**:
```
解释：项目方将流动性池的代币锁定在智能合约中，在指定时间内无法撤出。这防止项目方突然撤走流动性导致投资者无法交易，是项目可信度的重要指标。

例子：就像你把钱存入银行定期，锁定一段时间不能取出，但会获得利息。流动性锁仓也是这个道理，只不过是项目方锁定，保护投资者权益。
```

### 示例3: Rug Pull

**用户问题**: "Rug Pull是什么？"

**AI回答**:
```
解释：Rug Pull（地毯式拉走）是指项目方突然撤出流动性或卷款跑路，导致代币价值归零。常见于未锁仓流动性或开发者保留后门权限的项目，是严重的欺诈行为。

例子：就像你在商场买东西，付完钱后商家突然关门跑路，你的钱拿不回来了。Rug Pull就是这样，项目方拿走所有资金消失，留下投资者损失惨重。
```

---

## 🛡️ 合规保障

### 禁止内容

#### ❌ 投资建议
```
- "建议买入"
- "推荐购买"
- "现在是抄底好时机"
- "这个项目值得投资"
```

#### ❌ 收益承诺
```
- "稳赚不赔"
- "保证收益XX%"
- "必涨"
- "翻倍"
- "暴富"
```

#### ❌ 劝诱性语言
```
- "赶紧买"
- "立即冲"
- "梭哈"
- "财富密码"
- "错过后悔"
```

### 自动检测

```typescript
const inappropriateWords = [
  '建议买', '建议购买', '推荐买', '推荐购买',
  '稳赚', '必涨', '暴富', '财富密码',
  '抄底', '梭哈', '冲', '起飞',
  '保证收益', '承诺收益', '固定收益',
]

// 检测并拒绝不当内容
if (containsInappropriateContent(answer)) {
  return '抱歉，无法提供该问题的解释。请换个方式提问。'
}
```

---

## 🚀 API 使用

### 1. RAG 问答

**Endpoint**: `GET /api/learn?q={query}&k={topK}`

**示例**:
```bash
curl "https://hotscan.app/api/learn?q=什么是DeFi&k=3"
```

**响应**:
```json
{
  "success": true,
  "data": {
    "query": "什么是DeFi",
    "answer": "解释：DeFi是去中心化金融...\n例子：就像...",
    "sources": [
      {
        "term": "DeFi",
        "definition": "去中心化金融...",
        "similarity": 0.95
      },
      {
        "term": "智能合约",
        "definition": "...",
        "similarity": 0.87
      },
      {
        "term": "流动性池",
        "definition": "...",
        "similarity": 0.82
      }
    ]
  }
}
```

### 2. 术语搜索

**Endpoint**: `GET /api/learn/search?q={prefix}&limit={number}`

**示例**:
```bash
curl "https://hotscan.app/api/learn/search?q=流动&limit=10"
```

**响应**:
```json
{
  "success": true,
  "data": {
    "query": "流动",
    "results": [
      {
        "term": "流动性池",
        "definition": "..."
      },
      {
        "term": "流动性锁仓",
        "definition": "..."
      }
    ],
    "count": 2
  }
}
```

### 3. 获取所有术语

**Endpoint**: `GET /api/learn/terms`

**响应**:
```json
{
  "success": true,
  "data": {
    "terms": [
      {
        "term": "AMM",
        "definition": "...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      ...
    ],
    "count": 50
  }
}
```

### 4. 随机术语（每日一词）

**Endpoint**: `GET /api/learn/random?count={number}`

**响应**:
```json
{
  "success": true,
  "data": {
    "terms": [
      {
        "term": "质押",
        "definition": "..."
      }
    ],
    "count": 1
  }
}
```

---

## 📊 作业运行

### embed-terms.ts

批量向量化50条术语

```bash
# 运行作业
pnpm jobs:embed

# 或直接运行
npx tsx src/jobs/embed-terms.ts
```

**流程**:
```
1. 连接数据库
   ↓
2. 启用pgvector扩展
   ↓
3. 批量处理术语（每批5个）
   ├─ 生成嵌入向量 (OpenAI)
   ├─ 存储到Term表 (pgvector)
   └─ 延迟1秒（避免限流）
   ↓
4. 记录JobRun
```

**输出示例**:
```
🚀 Starting term embedding job...
📊 Total terms to process: 50
✓ pgvector extension enabled

📦 Processing batch 1/10
  Processing: DeFi
  ✓ DeFi embedded successfully
  Processing: AMM
  ✓ AMM embedded successfully
  ...

✨ Term embedding completed!
  Total: 50
  Success: 50
  Failed: 0
  Duration: 45231ms
```

---

## 🧪 测试覆盖

### 合规性测试
```typescript
✓ 应该拒绝包含投资建议的内容
✓ 应该允许客观描述性内容
```

### 问答格式测试
```typescript
✓ 应该包含解释和例子
✓ 解释部分应该在60-80字之间
```

### 术语覆盖测试
```typescript
✓ 应该涵盖DeFi基础术语
✓ 应该涵盖风险相关术语
✓ 应该涵盖技术指标术语
✓ 应该涵盖安全相关术语
```

### 向量搜索测试
```typescript
✓ 应该返回相似度最高的术语
✓ 相似度应该在0-1之间
```

### API响应测试
```typescript
✓ 应该返回标准的JSON格式
✓ sources应该包含term、definition和similarity
```

### 错误处理测试
```typescript
✓ 空查询应该返回错误
✓ 过长查询应该返回错误
✓ 没有找到术语应该返回友好提示
```

### 生活化例子测试
```typescript
✓ 应该使用日常生活中的类比
✓ 例子应该简单易懂
```

---

## 🎯 性能优化

### 1. 批量处理
```typescript
// 每批5个术语，避免API限流
const batchSize = 5
for (let i = 0; i < TERMS.length; i += batchSize) {
  await Promise.all(batch.map(embedTerm))
  await sleep(1000) // 延迟1秒
}
```

### 2. 向量索引
```sql
-- pgvector自动创建IVFFlat索引
CREATE INDEX term_embedding_idx 
ON "Term" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 3. 查询缓存
```typescript
// 前端缓存常见问题的回答
const cachedAnswers = new Map()

if (cachedAnswers.has(query)) {
  return cachedAnswers.get(query)
}
```

### 4. 连接池
```typescript
// Prisma自动管理连接池
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})
```

---

## 📈 成本估算

### OpenAI API 成本

#### 嵌入（Embedding）
- **模型**: `text-embedding-ada-002`
- **价格**: $0.0001 / 1K tokens
- **50条术语**: ~5K tokens
- **一次性成本**: ~$0.0005

#### 生成（Completion）
- **模型**: `gpt-4`
- **价格**: $0.03 / 1K tokens (input), $0.06 / 1K tokens (output)
- **单次问答**: ~300 tokens input, ~150 tokens output
- **单次成本**: ~$0.018
- **1000次问答**: ~$18

### 数据库成本

#### Neon (推荐)
- **Free Tier**: 0.5GB 存储, 1亿行查询/月
- **向量存储**: 50个术语 × 1536维 × 4字节 ≈ 0.3MB
- **成本**: **免费**

#### Supabase
- **Free Tier**: 500MB 存储, 2GB传输/月
- **pgvector**: 原生支持
- **成本**: **免费**

---

## 🔄 更新术语

### 添加新术语

1. **编辑 `embed-terms.ts`**
```typescript
const TERMS = [
  ...
  {
    term: '新术语',
    definition: '详细定义...',
  },
]
```

2. **运行向量化**
```bash
pnpm jobs:embed
```

3. **验证**
```bash
curl "https://hotscan.app/api/learn?q=新术语"
```

### 更新现有术语

向量化作业使用 `ON CONFLICT` 自动更新：
```sql
ON CONFLICT (term) 
DO UPDATE SET
  definition = EXCLUDED.definition,
  embedding = EXCLUDED.embedding,
  updatedAt = NOW()
```

---

## ✅ 验证清单

- [x] 50条专业术语完整
- [x] 术语定义准确清晰
- [x] pgvector向量存储
- [x] OpenAI嵌入集成
- [x] 语义检索功能
- [x] GPT-4生成解释
- [x] 新手友好语言
- [x] 生活化例子
- [x] 合规性检查
- [x] API端点完整
- [x] 错误处理
- [x] 测试覆盖

---

**RAG术语问答系统完成！教育友好，合规安全！** 🚀
