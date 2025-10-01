# 🛠️ HotScan v2.0 - 安装与运行命令

一站式安装和运行指南

---

## ⚡ 快速安装（复制粘贴）

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp env.example .env
# 编辑 .env 文件，至少配置：
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - OPENAI_API_KEY

# 3. 设置数据库
cp prisma/schema-v2.prisma prisma/schema.prisma
pnpm db:push
pnpm db:generate

# 4. 初始化术语数据（必需）
pnpm jobs:embed

# 5. 启动开发服务器
pnpm dev
```

---

## 📋 所有可用命令

### 开发命令

```bash
# 启动开发服务器
pnpm dev

# 启动开发服务器（Turbopack，更快）
pnpm dev --turbo

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 数据库命令

```bash
# 推送 schema 到数据库
pnpm db:push

# 生成 Prisma 客户端
pnpm db:generate

# 打开 Prisma Studio（数据库管理界面）
pnpm db:studio

# 运行数据库迁移
pnpm db:migrate

# 填充示例数据
pnpm db:seed
```

### 定时任务命令

```bash
# 获取行情数据（股票 + 加密货币）
pnpm jobs:fetch

# 生成 AI 信号和洞察
pnpm jobs:signals

# 嵌入术语向量（RAG）
pnpm jobs:embed
```

### 代码质量命令

```bash
# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix

# TypeScript 类型检查
pnpm type-check

# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 测试 UI 界面
pnpm test:ui
```

---

## 🔐 生成密钥

```bash
# 生成 NEXTAUTH_SECRET
openssl rand -base64 32

# 生成 CRON_SECRET
openssl rand -base64 32

# 或者使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🗄️ 数据库设置

### Neon（推荐）

```bash
# 1. 访问 https://neon.tech
# 2. 创建项目
# 3. 在 SQL Editor 运行：

CREATE EXTENSION IF NOT EXISTS vector;

# 4. 复制连接字符串到 .env
DATABASE_URL="postgresql://user:pass@host.neon.tech/neondb?sslmode=require"
```

### 本地 PostgreSQL

```bash
# macOS
brew install postgresql
brew install pgvector

# 启动服务
brew services start postgresql

# 创建数据库
createdb hotscan

# 连接并启用扩展
psql hotscan -c "CREATE EXTENSION vector;"

# 设置连接字符串
DATABASE_URL="postgresql://localhost:5432/hotscan"
```

---

## 📊 初始化数据

### 方法 1：自动（推荐）

```bash
# 一键初始化
pnpm jobs:embed
```

这会：
- 创建 8+ 个金融术语
- 生成向量嵌入
- 为 RAG 问答做准备

### 方法 2：完整数据

```bash
# 1. 嵌入术语
pnpm jobs:embed

# 2. 获取行情数据（需要 API Keys）
pnpm jobs:fetch

# 3. 生成 AI 信号（需要行情数据）
pnpm jobs:signals
```

---

## 🔑 获取 API 密钥

### OpenAI（必需）

```bash
# 1. 访问
https://platform.openai.com/api-keys

# 2. 创建新密钥
# 3. 复制到 .env
OPENAI_API_KEY="sk-..."
```

### Resend（Email，推荐）

```bash
# 1. 访问
https://resend.com

# 2. 创建 API Key
# 3. 配置 .env
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="re_..."
EMAIL_FROM="HotScan <noreply@yourdomain.com>"
```

### Alpha Vantage（股票，可选）

```bash
# 1. 访问
https://www.alphavantage.co/support/#api-key

# 2. 免费注册
# 3. 获取 API Key
ALPHA_VANTAGE_API_KEY="your-key"
```

---

## 🐛 故障排查

### 数据库连接失败

```bash
# 测试连接
pnpm db:studio

# 如果失败，检查：
# 1. DATABASE_URL 格式是否正确
# 2. 数据库服务是否运行
# 3. 网络连接是否正常
```

### pgvector 扩展未安装

```bash
# 连接到数据库并运行
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Prisma 客户端未生成

```bash
# 重新生成
pnpm db:generate
```

### 端口被占用

```bash
# 使用其他端口
PORT=3001 pnpm dev
```

---

## 🚀 部署到 Vercel

### 准备

```bash
# 1. 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 2. 推送到 GitHub
git remote add origin <your-repo-url>
git push -u origin main
```

### 部署

```bash
# 方法 1：使用 Vercel CLI
npm i -g vercel
vercel --prod

# 方法 2：使用 Web 界面
# 访问 https://vercel.com
# Import Project
# 选择仓库
# 配置环境变量
# Deploy
```

### 必需的环境变量

在 Vercel 项目设置中添加：

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL (https://your-domain.vercel.app)
OPENAI_API_KEY
EMAIL_SERVER_HOST
EMAIL_SERVER_PASSWORD
EMAIL_FROM
CRON_SECRET
```

---

## 📈 开发工作流

### 典型开发流程

```bash
# 1. 拉取最新代码
git pull

# 2. 安装依赖
pnpm install

# 3. 更新数据库
pnpm db:push

# 4. 启动开发服务器
pnpm dev

# 5. 开发...

# 6. 提交前检查
pnpm lint
pnpm type-check
pnpm test
pnpm build

# 7. 提交代码
git add .
git commit -m "feat: add new feature"
git push
```

---

## 🧪 测试

### API 测试

```bash
# RAG 问答
curl -X POST http://localhost:3000/api/learn \
  -H "Content-Type: application/json" \
  -d '{"question": "什么是市盈率？"}'

# 资产列表
curl http://localhost:3000/api/assets

# 信号列表
curl http://localhost:3000/api/signals

# 术语搜索
curl http://localhost:3000/api/learn/search?q=市值
```

### 定时任务测试

```bash
# 本地触发
pnpm jobs:embed
pnpm jobs:fetch
pnpm jobs:signals

# API 触发（需要 CRON_SECRET）
curl -X POST http://localhost:3000/api/jobs/make-signals \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

## 📊 监控

### 本地监控

```bash
# 查看日志
pnpm dev  # 开发日志

# 数据库管理
pnpm db:studio  # Prisma Studio
```

### 生产监控

- **Vercel Dashboard**：部署和性能
- **PostHog**：用户行为分析
- **Sentry**：错误追踪

---

## 🎓 学习资源

### 项目文档

```bash
# 完整文档
cat README-V2.md

# 快速开始
cat QUICKSTART-V2.md

# 项目结构
cat PROJECT_V2_STRUCTURE.md

# 交付文档
cat DELIVERY_V2.md
```

### 外部资源

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- pgvector: https://github.com/pgvector/pgvector
- OpenAI: https://platform.openai.com/docs

---

## 💡 提示

### 首次运行必做

✅ `pnpm jobs:embed` - 初始化术语数据

### 开发技巧

✅ 使用 `pnpm db:studio` 查看数据库
✅ 检查 `prisma/schema-v2.prisma` 了解数据模型
✅ 查看 `src/lib/rag.ts` 了解 RAG 实现
✅ 使用 `--turbo` 加快开发构建

### 生产注意

✅ 设置 `NEXTAUTH_URL` 为生产域名
✅ 配置 `CRON_SECRET` 保护定时任务
✅ 启用 PostHog 和 Sentry 监控
✅ 定期备份数据库

---

## 🆘 需要帮助？

### 文档

- [README-V2.md](README-V2.md) - 完整文档
- [QUICKSTART-V2.md](QUICKSTART-V2.md) - 快速开始
- [PROJECT_V2_STRUCTURE.md](PROJECT_V2_STRUCTURE.md) - 项目结构

### 支持

- GitHub Issues
- Email: support@hotscan.example.com
- 文档: https://docs.hotscan.example.com

---

**准备好了吗？运行 `pnpm dev` 开始开发！** 🚀
