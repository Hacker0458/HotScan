# 🚀 HotScan 快速部署指南

## ⚡ 最快方式（2分钟完成）

### 步骤 1: 打开两个网页，复制信息

**A. GitHub Token**
```
打开: https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hook&description=HotScan-Deploy
点击: Generate token
复制: ghp_xxxxx...
```

**B. DATABASE_URL**
```
打开: https://vercel.com/fangp458-2547s-projects/hotscan/settings/environment-variables
点击: DATABASE_URL 旁的 "Click to reveal"
复制: postgresql://...
```

### 步骤 2: 运行部署命令

```bash
bash deploy-all.sh \
  "你的_GitHub_Token" \
  "你的_DATABASE_URL"
```

### 示例
```bash
bash deploy-all.sh \
  "ghp_1A2b3C4d5E6f7G8h9I0j" \
  "postgresql://user:pass@ep-host.aws.neon.tech/neondb?sslmode=require"
```

---

## 📋 完整流程（如果想了解细节）

脚本会自动：
1. ✅ GitHub 认证
2. ✅ 创建 HotScan 仓库
3. ✅ 推送代码（33个文件）
4. ✅ 配置 5 个 GitHub Secrets
5. ✅ 触发 GitHub Actions
6. ✅ 实时监控执行状态
7. ✅ 显示验证命令

完成后访问：
- 仓库: https://github.com/Hacker0458/HotScan
- Actions: https://github.com/Hacker0458/HotScan/actions
- 生产环境: https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app

---

## 🆘 如果遇到问题

### 问题：Token 权限不足
解决：确保 Token 有以下权限：
- ✅ repo
- ✅ workflow
- ✅ admin:repo_hook

### 问题：DATABASE_URL 连接失败
解决：确保复制完整的连接字符串，包括 `?sslmode=require`

### 问题：仓库已存在
解决：脚本会自动处理，继续推送代码

---

## 💡 提示

- Token 只需要创建一次，可以重复使用
- DATABASE_URL 来自 Vercel，连接到 Neon 数据库
- GitHub Actions 会每 30 分钟自动运行一次
- 所有配置都会自动完成，无需手动操作

---

**准备好了？复制两个值后运行 deploy-all.sh 即可！**
