# 🎯 从这里开始

欢迎使用 **HotScan｜热点雷达**！

## ⚡ 30秒快速启动

```bash
# 1. 安装依赖
pnpm i

# 2. 配置环境变量（编辑 .env 文件）
cp env.example .env

# 3. 设置数据库
pnpm db:push

# 4. 启动！
pnpm dev
```

访问 http://localhost:3000 🚀

---

## 📚 重要文档

按阅读顺序：

1. **[QUICKSTART.md](QUICKSTART.md)** ⭐ **首先阅读**
   - 详细的设置步骤
   - 常见问题解决
   
2. **[README.md](README.md)** 📖 完整文档
   - 项目介绍
   - 功能特性
   - API 文档
   
3. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** 📊 项目总览
   - 已完成功能
   - 技术架构
   - 交付清单

4. **[ARCHITECTURE.md](ARCHITECTURE.md)** 🏗 架构设计
   - 系统架构
   - 模块设计
   - 技术决策

5. **[DEPLOYMENT.md](DEPLOYMENT.md)** 🚀 部署指南
   - Vercel 部署
   - 数据库设置
   - 环境配置

---

## ⚙️ 核心配置

### 最少需要配置 3 项

```env
# .env 文件
DATABASE_URL="postgresql://..."      # 数据库连接
NEXTAUTH_SECRET="生成的密钥"          # 认证密钥
NEXTAUTH_URL="http://localhost:3000" # 应用地址
```

### 生成 NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 🗄️ 数据库选择

### 方案 A: Neon（推荐，免费）
1. 访问 https://neon.tech
2. 创建项目
3. 运行 `CREATE EXTENSION vector;`
4. 复制连接字符串

### 方案 B: Supabase（免费）
1. 访问 https://supabase.com
2. 创建项目
3. 在 SQL Editor 运行 `CREATE EXTENSION vector;`
4. 获取连接字符串

### 方案 C: 本地 PostgreSQL
```bash
createdb hotscan
# 安装 pgvector
# macOS: brew install pgvector
```

---

## 🔑 可选功能

### OAuth 登录（可选）
- Google OAuth: [配置指南](QUICKSTART.md#google-oauth)
- GitHub OAuth: [配置指南](QUICKSTART.md#github-oauth)

### AI 分析（推荐）
- OpenAI API: https://platform.openai.com/api-keys

---

## 🛠 常用命令

```bash
# 开发
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器

# 数据库
pnpm db:push      # 推送 schema
pnpm db:studio    # 数据库管理界面
pnpm db:seed      # 填充示例数据

# 质量
pnpm lint         # 代码检查
pnpm type-check   # 类型检查
pnpm test         # 运行测试
```

---

## 🚨 常见问题

### ❌ 数据库连接失败
**解决**: 检查 `DATABASE_URL` 是否正确配置

### ❌ Prisma 未初始化
**解决**: 运行 `pnpm db:generate`

### ❌ 端口被占用
**解决**: `PORT=3001 pnpm dev`

---

## 📁 项目结构速览

```
src/
├── app/              # 页面和 API
│   ├── page.tsx      # 首页
│   ├── api/          # API 端点
│   ├── topics/       # 话题页面
│   └── ...
├── components/       # React 组件
├── lib/             # 工具和服务
│   ├── prisma.ts    # 数据库
│   ├── auth.ts      # 认证
│   ├── openai.ts    # AI 服务
│   └── utils.ts     # 工具函数
└── __tests__/       # 测试文件
```

---

## 🎯 接下来做什么？

1. ✅ 完成环境配置
2. ✅ 启动开发服务器
3. ✅ 浏览应用功能
4. 📖 阅读 [ARCHITECTURE.md](ARCHITECTURE.md) 了解设计
5. 🚀 参考 [DEPLOYMENT.md](DEPLOYMENT.md) 部署到生产环境
6. 🤝 查看 [CONTRIBUTING.md](CONTRIBUTING.md) 参与开发

---

## 💡 提示

- 💾 定期备份 `.env` 文件（不要提交到 Git）
- 🔒 保护好 API 密钥
- 📝 遇到问题查看各文档的"故障排查"部分
- 🆘 需要帮助？创建 GitHub Issue

---

## 🎉 准备好了吗？

运行 `pnpm dev` 开始你的热点雷达之旅！

有问题随时查看文档或联系支持团队。

**祝使用愉快！** ✨
