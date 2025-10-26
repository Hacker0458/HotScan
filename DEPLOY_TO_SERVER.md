# 🚀 HotScan 生产服务器部署指南

## 服务器信息
- **IP**: 154.201.78.29
- **用户**: root
- **部署目录**: /www/wwwroot/hotscan.jfroson.com
- **域名**: hotscan.jfroson.com

---

## 方案一：自动部署脚本（推荐）

### 步骤1: 构建并打包项目

在本地执行：

```bash
cd "/Users/fang/Desktop/💻 开发项目/HotScan｜热点雷达"

# 安装依赖并构建
pnpm install
pnpm build

# 创建部署包
tar -czf hotscan-deploy.tar.gz \
  .next \
  public \
  prisma \
  package.json \
  pnpm-lock.yaml \
  next.config.mjs \
  .env.example \
  --exclude=node_modules
```

### 步骤2: 上传到服务器

```bash
# 上传部署包
scp hotscan-deploy.tar.gz root@154.201.78.29:/tmp/
```

### 步骤3: 在服务器上部署

SSH连接到服务器：
```bash
ssh root@154.201.78.29
```

在服务器上执行：

```bash
#!/bin/bash

# 解压部署包
cd /tmp
tar -xzf hotscan-deploy.tar.gz

# 备份现有部署
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
if [ -d "/www/wwwroot/hotscan.jfroson.com" ]; then
  echo "📦 备份现有部署..."
  mv /www/wwwroot/hotscan.jfroson.com "/www/wwwroot/hotscan.jfroson.com.backup-$TIMESTAMP"
fi

# 创建部署目录
mkdir -p /www/wwwroot/hotscan.jfroson.com
cd /www/wwwroot/hotscan.jfroson.com

# 移动文件
mv /tmp/.next .
mv /tmp/public . 2>/dev/null || true
mv /tmp/prisma .
mv /tmp/package.json .
mv /tmp/pnpm-lock.yaml .
mv /tmp/next.config.mjs .

# 安装Node.js依赖（如果还没有pnpm）
npm install -g pnpm

# 安装项目依赖
pnpm install --prod

# 配置环境变量
cat > .env << 'EOF'
# ===========================================
# 生产环境配置
# ===========================================

# Database (请修改为实际的数据库连接信息)
DATABASE_URL="postgresql://hotscan:YOUR_STRONG_PASSWORD@localhost:5432/hotscan?schema=public"

# AI API Keys
PROBEX_API_KEY="sk-JaLWJy75i0t0gzrY41V7uMAjI2TcEga4Ojg6mF96nhFzQLyo"
AIUM_API_KEY="sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU"
CHATAIAPI_KEY="sk-dXYiVkp3MihKRdWcQoBOsA5ZP3GYZPEoVjUJG0hAzPaSXK06"

# NextAuth
NEXTAUTH_URL="https://hotscan.jfroson.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Job Security Token
JOB_TOKEN="$(openssl rand -base64 32)"

# Data Source
DATASOURCE="dexscreener"
DEXSCREENER_BASE="https://api.dexscreener.com/latest"
HOTSCAN_QUERIES="DOGE,PEPE,SHIB,BONK,WIF,POPCAT,MEW,BRETT,TURBO,ANDY,BTC,ETH,SOL"

# Application Settings
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
NEXT_PUBLIC_SIGNAL_WINDOW_DEFAULT=1h
MIN_LIQ_FILTER_USD=100000
MOCK_AI=false
NEXT_PUBLIC_SEO_ENABLED=true

# Node Environment
NODE_ENV=production
EOF

echo "✅ 环境变量配置完成"

# 配置PostgreSQL数据库（如果还没有）
echo "📊 配置数据库..."

# 创建数据库和用户（请修改密码）
sudo -u postgres psql << 'SQLEOF'
CREATE DATABASE hotscan;
CREATE USER hotscan WITH ENCRYPTED PASSWORD 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE hotscan TO hotscan;
\c hotscan
CREATE EXTENSION IF NOT EXISTS vector;
SQLEOF

# 运行数据库迁移
pnpm prisma db push

# 安装PM2（如果还没有）
npm install -g pm2

# 停止旧进程
pm2 delete hotscan 2>/dev/null || true

# 启动应用
pm2 start npm --name "hotscan" -- start -- -p 3000

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup

echo "✅ 应用启动完成"

# 配置Nginx反向代理
echo "🌐 配置Nginx..."

cat > /etc/nginx/sites-available/hotscan << 'NGINXEOF'
server {
    listen 80;
    server_name hotscan.jfroson.com;

    # 重定向到HTTPS（安装SSL后启用）
    # return 301 https://$server_name$request_uri;

    # 临时HTTP配置（测试用）
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE支持
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINXEOF

# 启用站点
ln -sf /etc/nginx/sites-available/hotscan /etc/nginx/sites-enabled/

# 测试Nginx配置
nginx -t

# 重载Nginx
systemctl reload nginx

echo "✅ Nginx配置完成"

# 安装SSL证书（推荐）
echo "🔒 安装SSL证书..."
echo "执行: certbot --nginx -d hotscan.jfroson.com"
echo "或手动配置SSL"

echo ""
echo "======================================"
echo "🎉 部署完成！"
echo "======================================"
echo ""
echo "📊 应用状态:"
echo "  - PM2状态: pm2 status"
echo "  - 查看日志: pm2 logs hotscan"
echo "  - 重启应用: pm2 restart hotscan"
echo ""
echo "🌐 访问地址:"
echo "  - HTTP: http://hotscan.jfroson.com"
echo "  - 本地: http://localhost:3000"
echo ""
echo "📝 下一步:"
echo "  1. 修改 .env 中的数据库密码"
echo "  2. 配置SSL证书"
echo "  3. 设置定时任务（Cron Jobs）"
echo "  4. 配置防火墙规则"
echo ""
```

---

## 方案二：Docker部署（推荐）

### 1. 使用已提供的Docker配置

项目中已包含：
- `Dockerfile`
- `docker-compose.yml`

### 2. 在服务器上执行

```bash
# 克隆代码（或上传）
cd /www/wwwroot/hotscan.jfroson.com
git clone https://github.com/Hacker0458/HotScan.git .

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 使用Docker Compose启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 步骤4: 配置定时任务

添加Cron Jobs用于定期更新数据：

```bash
crontab -e
```

添加以下内容：

```cron
# 每5分钟运行一次信号生成
*/5 * * * * cd /www/wwwroot/hotscan.jfroson.com && NODE_ENV=production pnpm tsx jobs/make-signals.ts >> /var/log/hotscan-signals.log 2>&1

# 每分钟检查价格提醒
* * * * * curl -X POST -H "Authorization: Bearer YOUR_JOB_TOKEN" http://localhost:3000/api/alerts/check >> /var/log/hotscan-alerts.log 2>&1

# 每小时清理缓存
0 * * * * curl -X POST -H "Authorization: Bearer YOUR_JOB_TOKEN" http://localhost:3000/api/cache/clear >> /var/log/hotscan-cache.log 2>&1
```

---

## 步骤5: 配置防火墙

```bash
# 允许HTTP和HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 允许SSH（如果还没有）
ufw allow 22/tcp

# 启用防火墙
ufw enable
ufw status
```

---

## 步骤6: 性能优化

### 1. 配置PostgreSQL优化

编辑 `/etc/postgresql/*/main/postgresql.conf`:

```conf
# 内存配置（根据服务器内存调整）
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB

# 连接配置
max_connections = 100

# WAL配置
wal_buffers = 8MB
checkpoint_completion_target = 0.9
```

重启PostgreSQL:
```bash
systemctl restart postgresql
```

### 2. 配置Node.js内存限制

编辑PM2配置：
```bash
pm2 delete hotscan
pm2 start npm --name "hotscan" --node-args="--max-old-space-size=2048" -- start
pm2 save
```

---

## 监控和维护

### 1. 查看应用状态
```bash
pm2 status
pm2 logs hotscan
pm2 monit
```

### 2. 查看资源使用
```bash
htop
df -h
free -m
```

### 3. 数据库备份
```bash
# 每日备份
pg_dump hotscan > /backup/hotscan-$(date +%Y%m%d).sql

# 添加到cron
0 2 * * * pg_dump hotscan > /backup/hotscan-$(date +\%Y\%m\%d).sql
```

---

## 故障排查

### 应用无法启动
```bash
# 查看详细日志
pm2 logs hotscan --lines 100

# 检查端口占用
netstat -tulpn | grep 3000

# 检查环境变量
cat .env
```

### 数据库连接失败
```bash
# 测试数据库连接
psql -U hotscan -d hotscan -h localhost

# 检查PostgreSQL状态
systemctl status postgresql
```

### Nginx配置错误
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

---

## 🎉 完成！

部署完成后访问：
- **HTTP**: http://hotscan.jfroson.com
- **HTTPS**: https://hotscan.jfroson.com（配置SSL后）

---

## 📞 技术支持

如遇到问题，请检查：
1. PM2日志: `pm2 logs hotscan`
2. Nginx日志: `/var/log/nginx/error.log`
3. 数据库日志: `/var/log/postgresql/postgresql-*.log`

**项目仓库**: https://github.com/Hacker0458/HotScan

