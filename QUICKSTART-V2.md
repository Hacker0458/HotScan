# 🚀 HotScan v2.0 - 快速开始指南

5 分钟启动完整的 AI 资产分析平台！

---

## ⚡ 一键启动

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp env.example .env
# 编辑 .env 文件（见下方）

# 3. 设置数据库
npx prisma db push
npx prisma generate

# 4. 嵌入术语向量（首次运行）
pnpm jobs:embed

# 5. 启动！
pnpm dev
```

访问 http://localhost:3000 🎉

---

## 🔧 环境变量配置

### 最少需要 3 项配置

```env
# 1. 数据库（必需）
DATABASE_URL="postgresql://..."

# 2. 认证密钥（必需）
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# 3. OpenAI API（必需）
OPENAI_API_KEY="sk-..."
```

### Email 登录配置（推荐）

使用 **Resend**（最简单）：

1. 注册 https://resend.com
2. 获取 API Key
3. 添加到 `.env`：

```env
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="re_your_api_key"
EMAIL_FROM="HotScan <noreply@yourdomain.com>"
NEXTAUTH_URL="http://localhost:3000"
```

### 完整配置（可选）

```env
# 金融数据 API
ALPHA_VANTAGE_API_KEY=""      # 股票数据
COINGECKO_API_KEY=""           # 加密货币

# 监控
NEXT_PUBLIC_POSTHOG_KEY=""     # 产品分析
NEXT_PUBLIC_SENTRY_DSN=""      # 错误追踪

# 定时任务密钥
CRON_SECRET="random-secret"
```

---

## 🗄️ 数据库设置

### 选项 A: Neon（推荐）

1. 访问 https://neon.tech 并注册
2. 创建新项目
3. 在 SQL Editor 运行：
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. 复制连接字符串到 `.env`

### 选项 B: Supabase

1. 访问 https://supabase.com 并创建项目
2. 在 SQL Editor 运行：
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. 获取 Database URL（Direct connection）

### 选项 C: 本地 PostgreSQL

```bash
# 安装 PostgreSQL
brew install postgresql  # macOS
# 或按照官网指南安装

# 创建数据库
createdb hotscan

# 安装 pgvector
brew install pgvector  # macOS
# 或按照 https://github.com/pgvector/pgvector 安装

# 在数据库中启用扩展
psql hotscan -c "CREATE EXTENSION vector;"

# 设置连接字符串
DATABASE_URL="postgresql://localhost:5432/hotscan"
```

---

## 📊 数据填充

### 1. 嵌入术语向量（必需）

```bash
pnpm jobs:embed
```

这会：
- 创建 8+ 个初始金融术语
- 生成向量嵌入
- 为 RAG 问答做准备

### 2. 获取行情数据（可选）

```bash
pnpm jobs:fetch
```

需要配置：
- `ALPHA_VANTAGE_API_KEY`（股票）
- `COINGECKO_API_KEY`（加密货币，可选）

### 3. 生成 AI 信号（可选）

```bash
pnpm jobs:signals
```

需要：
- 数据库中已有资产数据
- 配置 `OPENAI_API_KEY`

---

## 🎯 功能测试

### 测试 RAG 问答

```bash
curl -X POST http://localhost:3000/api/learn \
  -H "Content-Type: application/json" \
  -d '{"question": "什么是市盈率？"}'
```

### 测试资产列表

```bash
curl http://localhost:3000/api/assets?limit=10
```

### 测试信号列表

```bash
curl http://localhost:3000/api/signals?limit=10
```

---

## 🔑 获取 API 密钥

### OpenAI API Key（必需）

1. 访问 https://platform.openai.com/api-keys
2. 创建新密钥
3. 复制到 `.env`

**费用估算**：
- 嵌入：每 1000 个术语 ~$0.02
- 问答：每次 ~$0.001-0.005
- 信号生成：每个 ~$0.01-0.05

### Alpha Vantage（股票数据）

1. 访问 https://www.alphavantage.co/support/#api-key
2. 免费注册获取 API Key
3. 免费层：500 requests/day

### Resend（Email）

1. 访问 https://resend.com
2. 免费层：3,000 emails/month
3. 添加域名验证（可选）

---

## 🎨 项目结构速览

```
├── src/
│   ├── app/
│   │   ├── page.tsx                # ✅ 首页
│   │   ├── asset/[id]/page.tsx     # 资产详情
│   │   ├── learn/page.tsx          # ✅ RAG 问答
│   │   └── api/
│   │       ├── learn/route.ts      # ✅ 问答 API
│   │       ├── signals/route.ts    # ✅ 信号 API
│   │       └── assets/route.ts     # ✅ 资产 API
│   ├── lib/
│   │   ├── rag.ts                  # ✅ RAG 实现
│   │   ├── prisma.ts               # ✅ 数据库
│   │   └── auth.ts                 # 认证配置
│   └── jobs/
│       ├── fetch-tickers.ts        # ✅ 获取行情
│       ├── make-signals.ts         # ✅ 生成信号
│       └── embed-terms.ts          # ✅ 嵌入向量
```

---

## 🐛 常见问题

### ❌ 数据库连接失败

```
Error: Can't reach database server
```

**解决**：
1. 检查 `DATABASE_URL` 是否正确
2. 确认数据库服务正在运行
3. 测试连接：`pnpm db:studio`

### ❌ pgvector 扩展未安装

```
Error: extension "vector" does not exist
```

**解决**：
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### ❌ Email 发送失败

```
Error: Invalid login
```

**解决**：
1. 检查 Email 配置是否正确
2. Resend：确认 API Key 有效
3. 测试 SMTP 连接

### ❌ OpenAI API 错误

```
Error: Incorrect API key
```

**解决**：
1. 检查 `OPENAI_API_KEY` 格式
2. 确认账户有余额
3. 检查 API Key 权限

---

## 📈 性能优化

### 开发环境

```bash
# 使用 Turbopack（更快的构建）
pnpm dev --turbo
```

### 生产构建

```bash
# 构建优化
pnpm build

# 启动生产服务器
pnpm start
```

---

## 🚀 部署到 Vercel

### 1. 准备仓库

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. 连接 Vercel

1. 访问 https://vercel.com
2. Import Project
3. 选择你的仓库

### 3. 配置环境变量

在 Vercel 项目设置中添加所有环境变量。

### 4. 部署

点击 Deploy！

### 5. 配置 Cron（定时任务）

Vercel 会自动识别 `vercel.json` 中的 cron 配置。

---

## 🎓 下一步

### 学习资源

- [README-V2.md](README-V2.md) - 完整文档
- [PROJECT_V2_STRUCTURE.md](PROJECT_V2_STRUCTURE.md) - 项目结构
- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)

### 功能扩展

- [ ] 添加更多资产类型（商品、外汇）
- [ ] 实现价格图表
- [ ] 添加实时推送
- [ ] 社区评论功能
- [ ] 移动端 App

---

## 💡 提示

✅ 首次运行必须执行 `pnpm jobs:embed` 来初始化术语数据
✅ 开发环境可以跳过 Email 配置，直接使用数据库
✅ 定时任务可以手动运行，不需要等待 Cron
✅ 查看 `prisma/schema-v2.prisma` 了解数据模型

---

## 🆘 需要帮助？

- **文档**：查看 [README-V2.md](README-V2.md)
- **Issues**：https://github.com/yourusername/hotscan/issues
- **Email**：support@hotscan.example.com

---

**准备好了吗？运行 `pnpm dev` 开始你的热点雷达之旅！** 🎉
