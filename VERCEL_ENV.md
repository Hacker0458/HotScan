# Vercel 环境变量配置清单

## 🔐 必需环境变量

在 Vercel 项目 Settings > Environment Variables 中配置以下变量：

### 数据库
- `DATABASE_URL` - PostgreSQL 数据库连接字符串
  ```
  示例: postgresql://user:password@host:5432/database
  ```

### 认证
- `NEXTAUTH_URL` - NextAuth 认证 URL（生产环境）
  ```
  示例: https://hotscan-xxx.vercel.app
  注意: 部署后才能知道确切域名
  ```

- `NEXTAUTH_SECRET` - NextAuth 密钥（至少 32 字符）
  ```
  生成命令: openssl rand -base64 32
  ```

### OpenAI
- `OPENAI_API_KEY` - OpenAI API 密钥
  ```
  示例: sk-...
  ```

- `OPENAI_API_BASE` - OpenAI API 基础 URL
  ```
  示例: https://api.openai.com/v1
  或代理: https://aium.cc/v1/
  ```

### 数据源
- `DATASOURCE` - 数据源类型
  ```
  值: dexscreener
  ```

### 其他配置
- `MOCK_AI` - 是否使用 Mock AI（生产环境设为 0）
  ```
  值: 0
  ```

## 📊 可选环境变量

### 分析工具
- `POSTHOG_KEY` - PostHog 分析密钥
  ```
  示例: phc_...
  ```

- `SENTRY_DSN` - Sentry 错误追踪 DSN
  ```
  示例: https://...@sentry.io/...
  ```

### 定时任务（如使用 Vercel Cron）
- `JOB_TOKEN` - 定时任务保护令牌
  ```
  生成命令: openssl rand -hex 32
  ```

## 📝 配置步骤

1. 登录 Vercel
2. 选择项目 > Settings > Environment Variables
3. 逐一添加上述变量
4. 选择环境：Production, Preview, Development
5. 保存并重新部署

## ⚠️ 注意事项

1. **NEXTAUTH_URL**: 首次部署后需要更新为实际的 Vercel 域名
2. **DATABASE_URL**: 确保数据库允许 Vercel 的出站 IP 连接
3. **OPENAI_API_BASE**: 必须包含 `/v1` 后缀
4. **敏感信息**: 永远不要将真实的 API 密钥提交到代码仓库

## 🔄 更新环境变量后

在 Vercel 控制台执行 "Redeploy" 以应用新的环境变量。

