# 🚀 一键部署命令（服务器上执行）

## 步骤1: SSH连接到服务器

```bash
ssh root@154.201.78.29
```

密码: `JFroson 081130`

---

## 步骤2: 复制粘贴以下完整命令

连接成功后，**复制下面整个代码块**，粘贴到终端并执行：

```bash
cat > /tmp/hotscan-deploy-final.sh << 'DEPLOYEOF'
#!/bin/bash
set -e

echo "🚀 开始部署HotScan..."

# 安装兼容的pnpm
npm install -g pnpm@8 2>/dev/null || true

# 进入项目目录
cd /www/wwwroot/hotscan.jfroson.com || { echo "目录不存在，克隆代码..."; git clone https://github.com/Hacker0458/HotScan.git /www/wwwroot/hotscan.jfroson.com && cd /www/wwwroot/hotscan.jfroson.com; }

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

---

## 🎉 完成！

部署成功后，在浏览器访问：**https://hotscan.jfroson.com**

---

## 📊 常用命令

```bash
# 查看应用状态
pm2 status

# 查看实时日志
pm2 logs hotscan

# 重启应用
pm2 restart hotscan

# 停止应用
pm2 stop hotscan
```

---

## 🔧 如果遇到数据库问题

如果数据库连接失败，执行：

```bash
# 创建数据库
sudo -u postgres psql << 'SQL'
CREATE DATABASE hotscan;
CREATE USER hotscan WITH PASSWORD 'HotScan2025';
GRANT ALL PRIVILEGES ON DATABASE hotscan TO hotscan;
\c hotscan
CREATE EXTENSION IF NOT EXISTS vector;
SQL

# 然后重新运行迁移
cd /www/wwwroot/hotscan.jfroson.com
pnpm prisma db push
pm2 restart hotscan
```

---

## 🌐 配置Nginx（如果还没有）

```bash
cat > /etc/nginx/conf.d/hotscan.conf << 'NGINXEOF'
server {
    listen 80;
    server_name hotscan.jfroson.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

nginx -t && systemctl reload nginx
```

---

就这么简单！复制粘贴上面的命令即可完成部署！🚀

