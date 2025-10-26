# 🚀 HotScan 部署状态总结

## 📊 当前状态

### ✅ 已完成
1. ✅ 所有代码已推送到GitHub
2. ✅ 生产环境已构建
3. ✅ 部署脚本已就绪
4. ✅ 服务器环境已检测
   - OS: CentOS 7
   - Node.js: v16.20.2 ✅
   - PostgreSQL: 14.x ✅
   - PM2: 已安装 ✅
5. ✅ 代码已克隆到服务器：`/www/wwwroot/hotscan.jfroson.com`
6. ✅ 数据库已创建：`hotscan`

### ⏳ 待完成（只需1分钟）
- ⏳ 安装项目依赖
- ⏳ 构建生产版本
- ⏳ 运行数据库迁移
- ⏳ 启动应用

---

## 🎯 现在只需执行以下操作即可完成部署！

###  方法一：一键命令（推荐）⭐

**步骤1**: 在您的电脑终端执行：
```bash
ssh root@154.201.78.29
```
密码: `JFroson 081130`

**步骤2**: 连接成功后，**复制粘贴**以下完整命令：

```bash
cat > /tmp/hotscan-deploy-final.sh << 'DEPLOYEOF'
#!/bin/bash
set -e

echo "🚀 开始部署HotScan..."

# 安装兼容的pnpm
npm install -g pnpm@8 2>/dev/null || true

# 进入项目目录
cd /www/wwwroot/hotscan.jfroson.com

# 拉取最新代码
git pull || true

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 创建环境配置
if [ ! -f ".env" ]; then
    echo "⚙️  创建环境配置..."
    cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://hotscan:HotScan2025@localhost:5432/hotscan?schema=public"
PROBEX_API_KEY="sk-JaLWJy75i0t0gzrY41V7uMAjI2TcEga4Ojg6mF96nhFzQLyo"
AIUM_API_KEY="sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU"
CHATAIAPI_KEY="sk-dXYiVkp3MihKRdWcQoBOsA5ZP3GYZPEoVjUJG0hAzPaSXK06"
NEXTAUTH_URL="https://hotscan.jfroson.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
JOB_TOKEN="$(openssl rand -base64 32)"
DATASOURCE="dexscreener"
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
NODE_ENV=production
PORT=3000
ENVEOF
fi

# 构建
echo "🔨 构建项目..."
pnpm build

# 数据库迁移
echo "🗄️  数据库迁移..."
pnpm prisma db push 2>/dev/null || echo "⚠️  数据库迁移可能需要手动配置"

# 启动应用
echo "🚀 启动应用..."
pm2 delete hotscan 2>/dev/null || true
pm2 start npm --name "hotscan" -- start
pm2 save

echo ""
echo "✅ 部署完成！"
echo "🌐 访问: https://hotscan.jfroson.com"
echo "📊 状态: pm2 status"
echo "📝 日志: pm2 logs hotscan"
DEPLOYEOF

chmod +x /tmp/hotscan-deploy-final.sh && /tmp/hotscan-deploy-final.sh
```

**完成！** 访问 https://hotscan.jfroson.com

---

### 方法二：手动步骤

如果上面的命令有问题，可以手动执行：

```bash
# 1. SSH连接
ssh root@154.201.78.29

# 2. 安装pnpm 8
npm install -g pnpm@8

# 3. 进入目录
cd /www/wwwroot/hotscan.jfroson.com

# 4. 安装依赖
pnpm install

# 5. 构建
pnpm build

# 6. 运行迁移
pnpm prisma db push

# 7. 启动
pm2 delete hotscan || true
pm2 start npm --name "hotscan" -- start
pm2 save

# 8. 查看状态
pm2 status
pm2 logs hotscan
```

---

## 📝 部署问题解决

### 如果数据库连接失败

```bash
# 在服务器上执行
sudo -u postgres psql << 'SQL'
\c hotscan
CREATE EXTENSION IF NOT EXISTS vector;
ALTER DATABASE hotscan OWNER TO hotscan;
SQL

# 然后重试
cd /www/wwwroot/hotscan.jfroson.com
pnpm prisma db push
pm2 restart hotscan
```

### 如果pnpm安装失败

```bash
# 卸载并重装
npm uninstall -g pnpm
npm install -g pnpm@8.15.0
```

### 查看详细错误

```bash
pm2 logs hotscan --lines 50
```

---

## 🎉 部署后验证

```bash
# 检查应用状态
pm2 status

# 测试本地访问
curl http://localhost:3000/api/health

# 查看日志
pm2 logs hotscan
```

然后在浏览器访问：**https://hotscan.jfroson.com**

---

## 📚 相关文档

- **ONE_COMMAND_DEPLOY.md** - 一键部署详细说明
- **MANUAL_DEPLOY_GUIDE.md** - 完整手动部署指南
- **START_DEPLOYMENT.md** - 快速开始指南

---

## 💡 为什么使用Node.js 16？

您的服务器是CentOS 7，glibc版本是2.17。Node.js 18需要glibc 2.28+，所以我们使用Node.js 16 + pnpm 8的组合，完全兼容！

---

## ✨ 总结

您现在只需要：
1. SSH到服务器（1个命令）
2. 复制粘贴部署脚本（1个命令块）
3. 等待1-2分钟
4. 访问网站 ✅

**预计总时间：2-3分钟**

---

**立即开始部署吧！** 🚀

