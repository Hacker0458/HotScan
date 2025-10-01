# Vercel 部署检查清单

## ✅ 部署前检查

- [ ] Git 仓库已初始化并提交所有代码
- [ ] 已创建 GitHub 仓库（公开或私有）
- [ ] 已准备好生产数据库（PostgreSQL with pgvector）
- [ ] 已获取 OpenAI API 密钥
- [ ] 已阅读 README.md 中的部署指南

## 📝 环境变量准备

### 必需（7个）

- [ ] `DATABASE_URL` - 生产数据库连接字符串
- [ ] `NEXTAUTH_URL` - 设为 `https://placeholder.com`（部署后更新）
- [ ] `NEXTAUTH_SECRET` - 使用 `openssl rand -base64 32` 生成
- [ ] `OPENAI_API_KEY` - OpenAI API 密钥
- [ ] `OPENAI_API_BASE` - OpenAI API 基础 URL（如 `https://api.openai.com/v1`）
- [ ] `DATASOURCE` - 设为 `dexscreener`
- [ ] `MOCK_AI` - 设为 `0`

### 可选（3个）

- [ ] `POSTHOG_KEY` - PostHog 分析密钥（可选）
- [ ] `SENTRY_DSN` - Sentry 错误追踪（可选）
- [ ] `JOB_TOKEN` - Vercel Cron 令牌（如使用 Vercel Cron）

## 🚀 Vercel 部署步骤

1. **导入项目**
   - [ ] 访问 https://vercel.com/new
   - [ ] 选择 "Import Git Repository"
   - [ ] 连接 GitHub 并选择 HotScan 仓库

2. **配置环境变量**
   - [ ] 在 Environment Variables 中添加所有必需变量
   - [ ] 选择 Production, Preview, Development 环境
   - [ ] 保存配置

3. **部署**
   - [ ] 点击 "Deploy" 按钮
   - [ ] 等待构建完成（2-5 分钟）
   - [ ] 记录生产域名：`https://hotscan-xxx.vercel.app`

4. **更新 NEXTAUTH_URL**
   - [ ] 在 Settings > Environment Variables 中更新 `NEXTAUTH_URL`
   - [ ] 设为实际的 Vercel 域名
   - [ ] 点击 "Redeploy"

## 💾 数据库配置

- [ ] 运行数据库迁移
  ```bash
  DATABASE_URL=<prod-url> npx prisma migrate deploy
  ```

- [ ] 导入种子数据（可选）
  ```bash
  DATABASE_URL=<prod-url> npx prisma db seed
  ```

## ⏰ 定时任务配置

选择一种方案：

### 方案 A: GitHub Actions（推荐）

- [ ] 在 GitHub 仓库配置 Secrets:
  - `DATABASE_URL`
  - `OPENAI_API_KEY`
  - `OPENAI_API_BASE`
  - `DATASOURCE`
- [ ] 确认 `.github/workflows/cron.yml` 存在
- [ ] 在 Actions 页面手动触发一次测试

### 方案 B: Vercel Cron Jobs

- [ ] 生成 `JOB_TOKEN`: `openssl rand -hex 32`
- [ ] 添加到 Vercel 环境变量
- [ ] 在 Settings > Cron Jobs 添加任务:
  - Schedule: `*/30 * * * *`
  - Path: `/api/jobs/run`
  - Method: `POST`
  - Header: `Authorization: Bearer <JOB_TOKEN>`

## 🧪 部署验证

- [ ] 运行健康检查脚本
  ```bash
  PROD_URL=https://hotscan-xxx.vercel.app pnpm tsx scripts/post-deploy-check.ts
  ```

- [ ] 验证关键页面：
  - [ ] 首页：`https://your-domain.vercel.app/`
  - [ ] Signals API：`https://your-domain.vercel.app/api/signals?limit=3`
  - [ ] Learn API：`https://your-domain.vercel.app/api/learn?q=滑点`
  - [ ] Analytics：`https://your-domain.vercel.app/analytics`

- [ ] 检查定时任务：
  - [ ] GitHub Actions 运行成功（如使用）
  - [ ] Vercel Cron 调用成功（如使用）
  - [ ] Vercel Functions 日志无错误

## 📊 上线后监控

- [ ] 访问 Analytics 面板查看数据统计
- [ ] 检查 Vercel Functions 日志
- [ ] 检查 Sentry 错误追踪（如配置）
- [ ] 检查 PostHog 分析（如配置）

## 🎉 完成

- [ ] 部署成功，所有检查通过
- [ ] 定时任务正常运行
- [ ] 数据正常更新
- [ ] 用户可以正常访问

---

**需要帮助？**

- 📖 查看 [README.md](./README.md) 获取详细部署指南
- 🔐 查看 [VERCEL_ENV.md](./VERCEL_ENV.md) 获取环境变量说明
- 🚀 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取完整部署文档
- 🐛 查看 Vercel 部署日志排查问题

