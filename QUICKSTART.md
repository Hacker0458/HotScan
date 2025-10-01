# 🚀 快速启动指南

5分钟内让 HotScan 运行起来！

## 第一步：安装依赖

```bash
pnpm install
```

如果没有 pnpm，先安装：
```bash
npm install -g pnpm
```

## 第二步：配置环境变量

```bash
cp env.example .env
```

编辑 `.env` 文件，**最少需要配置**：

```env
# 数据库（必需）- 使用 Neon 免费层
DATABASE_URL="postgresql://user:pass@host.neon.tech/neondb?sslmode=require"

# NextAuth（必需）
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="运行命令生成: openssl rand -base64 32"

# OpenAI（可选，但推荐）
OPENAI_API_KEY="sk-..."
```

## 第三步：设置数据库

### 选项 A: 使用 Neon（推荐，免费）

1. 访问 https://neon.tech
2. 创建免费账户
3. 创建新项目
4. 在 SQL Editor 运行：
   ```sql
   CREATE EXTENSION vector;
   ```
5. 复制连接字符串到 `.env` 的 `DATABASE_URL`

### 选项 B: 本地 PostgreSQL

```bash
# 安装 PostgreSQL 并创建数据库
createdb hotscan

# 在 .env 设置
DATABASE_URL="postgresql://localhost:5432/hotscan"

# 安装 pgvector 扩展
# macOS: brew install pgvector
# Linux: 参考 https://github.com/pgvector/pgvector
```

### 推送数据库 Schema

```bash
pnpm db:push
```

### 填充示例数据（可选）

```bash
pnpm db:seed
```

## 第四步：启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 🎉

## 可选配置

### 启用 OAuth 登录

#### Google OAuth

1. 访问 https://console.cloud.google.com
2. 创建项目 → APIs & Services → Credentials
3. 创建 OAuth 2.0 客户端 ID
4. 授权重定向 URI: `http://localhost:3000/api/auth/callback/google`
5. 添加到 `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

#### GitHub OAuth

1. 访问 https://github.com/settings/developers
2. New OAuth App
3. 回调 URL: `http://localhost:3000/api/auth/callback/github`
4. 添加到 `.env`:
   ```env
   GITHUB_ID="your-client-id"
   GITHUB_SECRET="your-client-secret"
   ```

### 启用 AI 分析

获取 OpenAI API Key：
1. 访问 https://platform.openai.com/api-keys
2. 创建新的 API Key
3. 添加到 `.env`:
   ```env
   OPENAI_API_KEY="sk-..."
   ```

## 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器

# 数据库
pnpm db:push          # 推送 schema 到数据库
pnpm db:studio        # 打开 Prisma Studio
pnpm db:seed          # 填充示例数据

# 质量检查
pnpm lint             # 代码检查
pnpm type-check       # 类型检查
pnpm test             # 运行测试
pnpm test:coverage    # 测试覆盖率
```

## 故障排查

### 数据库连接失败

❌ 错误: `Can't reach database server`

✅ 解决:
1. 检查 `DATABASE_URL` 是否正确
2. 确认数据库服务正在运行
3. 验证网络连接

### Prisma 生成失败

❌ 错误: `Prisma Client did not initialize yet`

✅ 解决:
```bash
pnpm db:generate
```

### 端口被占用

❌ 错误: `Port 3000 is already in use`

✅ 解决:
```bash
# 使用其他端口
PORT=3001 pnpm dev
```

### OpenAI API 错误

如果没有配置 `OPENAI_API_KEY`，AI 功能会被跳过，应用仍可正常运行。

## 下一步

- 📖 阅读完整 [README](README.md)
- 🏗 了解[架构设计](ARCHITECTURE.md)
- 🚀 查看[部署指南](DEPLOYMENT.md)
- 🤝 参与[贡献](CONTRIBUTING.md)

## 需要帮助？

- 查看 [常见问题](https://github.com/yourusername/hotscan/issues)
- 创建新 [Issue](https://github.com/yourusername/hotscan/issues/new)
- 发送邮件: support@hotscan.example.com

祝你使用愉快！ 🎉
