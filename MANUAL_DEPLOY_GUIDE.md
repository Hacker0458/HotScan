# 🚀 HotScan 手动部署指南

## 📦 部署包已准备好

**文件位置**: `hotscan-deploy.tar.gz` (127MB)  
**服务器**: 154.201.78.29  
**用户**: root  
**密码**: JFroson 081130  
**部署目录**: /www/wwwroot/hotscan.jfroson.com

---

## 📋 快速部署步骤

### 步骤1: 上传部署包到服务器

在**本地终端**执行：

```bash
cd "/Users/fang/Desktop/💻 开发项目/HotScan｜热点雷达"

# 上传部署包（会提示输入密码）
scp hotscan-deploy.tar.gz root@154.201.78.29:/tmp/
```

输入密码: `JFroson 081130`

---

### 步骤2: SSH连接到服务器

```bash
ssh root@154.201.78.29
```

输入密码: `JFroson 081130`

---

### 步骤3: 在服务器上执行部署

连接到服务器后，复制并执行以下完整脚本：

```bash
#!/bin/bash
set -e

echo "🚀 开始部署HotScan..."

# 1. 解压部署包
cd /tmp
echo "📦 解压部署包..."
tar -xzf hotscan-deploy.tar.gz
DEPLOY_SRC=$(find /tmp -maxdepth 1 -name "hotscan-deploy-*" -type d | head -1)

# 2. 备份现有部署
if [ -d "/www/wwwroot/hotscan.jfroson.com" ]; then
  BACKUP="/www/wwwroot/hotscan.jfroson.com.backup-$(date +%Y%m%d-%H%M%S)"
  echo "💾 备份现有部署到: $BACKUP"
  mv /www/wwwroot/hotscan.jfroson.com "$BACKUP"
fi

# 3. 创建部署目录
mkdir -p /www/wwwroot/hotscan.jfroson.com
cd /www/wwwroot/hotscan.jfroson.com

# 4. 移动文件
echo "📂 移动文件..."
mv "$DEPLOY_SRC"/* ./

# 5. 安装pnpm（如果没有）
if ! command -v pnpm &> /dev/null; then
  echo "📦 安装pnpm..."
  npm install -g pnpm
fi

# 6. 安装依赖
echo "📦 安装依赖..."
pnpm install --prod

# 7. 创建环境变量文件
if [ ! -f ".env" ]; then
  echo "⚙️  创建环境配置..."
  cat > .env << 'EOF'
# ===========================================
# 生产环境配置
# ===========================================

# Database (⚠️ 请修改密码!)
DATABASE_URL="postgresql://hotscan:CHANGE_THIS_PASSWORD@localhost:5432/hotscan?schema=public"

# AI API Keys
PROBEX_API_KEY="sk-JaLWJy75i0t0gzrY41V7uMAjI2TcEga4Ojg6mF96nhFzQLyo"
AIUM_API_KEY="sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU"
CHATAIAPI_KEY="sk-dXYiVkp3MihKRdWcQoBOsA5ZP3GYZPEoVjUJG0hAzPaSXK06"

# NextAuth
NEXTAUTH_URL="https://hotscan.jfroson.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Job Security
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
  
  echo "⚠️  重要: 请编辑 .env 文件，修改数据库密码！"
  echo "   执行: nano .env"
fi

# 8. 设置PostgreSQL数据库
echo "🗄️  配置数据库..."

# 检查PostgreSQL是否已安装
if ! command -v psql &> /dev/null; then
  echo "❌ PostgreSQL未安装，请先安装PostgreSQL"
  echo "   Ubuntu/Debian: apt install postgresql postgresql-contrib"
  echo "   CentOS: yum install postgresql-server postgresql-contrib"
  exit 1
fi

# 创建数据库和用户（如果不存在）
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'hotscan'" | grep -q 1 || \
sudo -u postgres psql << 'SQLEOF'
CREATE DATABASE hotscan;
CREATE USER hotscan WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE hotscan TO hotscan;
\c hotscan
CREATE EXTENSION IF NOT EXISTS vector;
SQLEOF

echo "✅ 数据库配置完成"

# 9. 运行数据库迁移
echo "🔄 运行数据库迁移..."
pnpm prisma db push

# 10. 安装PM2（如果没有）
if ! command -v pm2 &> /dev/null; then
  echo "📦 安装PM2..."
  npm install -g pm2
fi

# 11. 停止旧进程并启动新应用
echo "🚀 启动应用..."
pm2 delete hotscan 2>/dev/null || true
pm2 start npm --name "hotscan" -- start -- -p 3000

# 12. 保存PM2配置
pm2 save
pm2 startup

echo ""
echo "======================================"
echo "🎉 部署完成！"
echo "======================================"
echo ""
echo "📊 应用状态:"
echo "  pm2 status"
echo ""
echo "📝 查看日志:"
echo "  pm2 logs hotscan"
echo ""
echo "🌐 本地访问:"
echo "  http://localhost:3000"
echo ""
echo "⚠️  下一步:"
echo "  1. 编辑 .env 修改数据库密码"
echo "  2. 配置Nginx反向代理"
echo "  3. 安装SSL证书"
echo "  4. 设置定时任务"
echo ""
```

---

### 步骤4: 配置Nginx反向代理

如果服务器上已有Nginx，执行：

```bash
# 创建Nginx配置
cat > /etc/nginx/sites-available/hotscan << 'EOF'
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE支持
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/hotscan /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载Nginx
systemctl reload nginx
```

---

### 步骤5: 安装SSL证书（推荐）

```bash
# 安装Certbot（如果没有）
apt install certbot python3-certbot-nginx

# 获取SSL证书
certbot --nginx -d hotscan.jfroson.com

# 自动续期
certbot renew --dry-run
```

---

### 步骤6: 设置定时任务

```bash
# 编辑crontab
crontab -e

# 添加以下内容
*/5 * * * * cd /www/wwwroot/hotscan.jfroson.com && NODE_ENV=production pnpm tsx jobs/make-signals.ts >> /var/log/hotscan-signals.log 2>&1
* * * * * curl -X POST -H "Authorization: Bearer $(grep JOB_TOKEN /www/wwwroot/hotscan.jfroson.com/.env | cut -d= -f2)" http://localhost:3000/api/alerts/check >> /var/log/hotscan-alerts.log 2>&1
```

---

## ✅ 验证部署

### 1. 检查应用状态
```bash
pm2 status
pm2 logs hotscan
```

### 2. 测试本地访问
```bash
curl http://localhost:3000/api/health
```

### 3. 测试外部访问
在浏览器中访问: `http://hotscan.jfroson.com`

---

## 🔧 常用命令

```bash
# 重启应用
pm2 restart hotscan

# 停止应用
pm2 stop hotscan

# 查看日志
pm2 logs hotscan

# 查看详细信息
pm2 info hotscan

# 监控资源
pm2 monit
```

---

## 🐛 故障排查

### 应用无法启动

```bash
# 查看PM2日志
pm2 logs hotscan --lines 50

# 检查端口
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

# 查看PostgreSQL日志
tail -f /var/log/postgresql/postgresql-*.log
```

### Nginx错误

```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 重启Nginx
systemctl restart nginx
```

---

## 📊 性能优化建议

### 1. PostgreSQL优化

编辑 `/etc/postgresql/*/main/postgresql.conf`:

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
max_connections = 100
```

重启: `systemctl restart postgresql`

### 2. Node.js内存优化

```bash
pm2 delete hotscan
pm2 start npm --name "hotscan" --node-args="--max-old-space-size=2048" -- start
pm2 save
```

### 3. 开启Gzip压缩

在Nginx配置中添加：

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_min_length 1000;
```

---

## 🎉 部署完成检查清单

- [ ] 部署包已上传
- [ ] 应用已启动（pm2 status显示online）
- [ ] 数据库已配置
- [ ] .env文件已修改（数据库密码）
- [ ] Nginx已配置
- [ ] SSL证书已安装
- [ ] 定时任务已设置
- [ ] 应用可外部访问

---

## 📞 需要帮助？

- 查看日志: `pm2 logs hotscan`
- 项目文档: `README.md`
- GitHub仓库: https://github.com/Hacker0458/HotScan

---

**祝部署顺利！🚀**

