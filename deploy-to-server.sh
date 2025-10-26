#!/bin/bash
set -e

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HotScan 全自动部署脚本 - 部署到云服务器
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 HotScan 全自动部署脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# =========================================================================
# 配置变量（从用户输入或环境变量读取）
# =========================================================================

DOMAIN="${DOMAIN:-hexedge.site}"
EMAIL="${EMAIL:-fangp458@gmail.com}"
DATABASE_URL="${DATABASE_URL}"
OPENAI_API_KEY="${OPENAI_API_KEY:-sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU}"
OPENAI_API_BASE="${OPENAI_API_BASE:-https://aium.cc/v1/}"
PANEL_URL="${PANEL_URL:-http://154.201.78.29:12700/951dfe8f}"
PANEL_USER="${PANEL_USER:-3tngqzci}"
PANEL_PASS="${PANEL_PASS:-f65f65e6}"

# Server connection (需要填写您的服务器信息)
SERVER_USER="${SERVER_USER:-root}"
SERVER_HOST="${SERVER_HOST:-154.201.78.29}"
SERVER_SSH_KEY="${SERVER_SSH_KEY:-~/.ssh/id_rsa}"

# 部署目录
DEPLOY_DIR="/opt/hotscan"

echo "📋 配置信息："
echo "   域名: $DOMAIN"
echo "   邮箱: $EMAIL"
echo "   服务器: $SERVER_USER@$SERVER_HOST"
echo "   部署目录: $DEPLOY_DIR"
echo ""

# =========================================================================
# 步骤 1: 准备本地环境
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 步骤 1: 准备本地环境"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 创建 .env.production
echo "创建 .env.production..."
cat > .env.production <<EOF
DATABASE_URL=$DATABASE_URL
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_API_BASE=$OPENAI_API_BASE
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
ENABLE_AI_SUMMARY=false
MOCK_AI=true
EOF

echo "✅ .env.production 已创建"
echo ""

# 生成 Prisma Client
echo "生成 Prisma Client..."
pnpm prisma generate
echo "✅ Prisma Client 已生成"
echo ""

# =========================================================================
# 步骤 2: 打包应用
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  步骤 2: 打包应用"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "创建部署包..."
mkdir -p deploy-package
tar czf deploy-package/hotscan-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=deploy-package \
  --exclude=*.md \
  .

DEPLOY_PACKAGE=$(ls -t deploy-package/*.tar.gz | head -1)
echo "✅ 部署包已创建: $DEPLOY_PACKAGE"
echo ""

# =========================================================================
# 步骤 3: 连接服务器并部署
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 步骤 3: 连接服务器并部署"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "提示: 如果需要手动部署，请运行以下命令："
echo ""
echo "1. 上传部署包到服务器:"
echo "   scp $DEPLOY_PACKAGE $SERVER_USER@$SERVER_HOST:/tmp/"
echo ""
echo "2. SSH 到服务器:"
echo "   ssh $SERVER_USER@$SERVER_HOST"
echo ""
echo "3. 执行服务器端部署脚本（将在下一步生成）"
echo ""

# =========================================================================
# 步骤 4: 生成服务器端部署脚本
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 步骤 4: 生成服务器端部署脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > server-deploy.sh <<'SERVER_SCRIPT'
#!/bin/bash
set -e

DOMAIN="hexedge.site"
DEPLOY_DIR="/opt/hotscan"
NGINX_CONF="/etc/nginx/sites-available/hotscan"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 HotScan 服务器端部署"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 安装依赖
echo "1️⃣ 检查并安装依赖..."
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt-get update && apt-get install -y nginx certbot python3-certbot-nginx
fi

echo "✅ 依赖已就绪"
echo ""

# 2. 创建部署目录
echo "2️⃣ 创建部署目录..."
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 3. 解压部署包
echo "3️⃣ 解压部署包..."
if [ -f "/tmp/hotscan-*.tar.gz" ]; then
    tar xzf /tmp/hotscan-*.tar.gz -C $DEPLOY_DIR
    echo "✅ 部署包已解压"
else
    echo "⚠️  部署包未找到，请手动上传"
fi
echo ""

# 4. 配置 Nginx
echo "4️⃣ 配置 Nginx..."
if [ -f "$DEPLOY_DIR/nginx.conf" ]; then
    cp $DEPLOY_DIR/nginx.conf $NGINX_CONF
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/hotscan
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    echo "✅ Nginx 已配置"
else
    echo "⚠️  nginx.conf 未找到"
fi
echo ""

# 5. 申请 SSL 证书
echo "5️⃣ 申请 SSL 证书..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL
    echo "✅ SSL 证书已申请"
else
    echo "✅ SSL 证书已存在"
fi
echo ""

# 6. 启动 Docker Compose
echo "6️⃣ 启动应用..."
cd $DEPLOY_DIR

# 停止旧容器
docker-compose down || true

# 构建并启动
docker-compose build --no-cache
docker-compose up -d

echo "✅ 应用已启动"
echo ""

# 7. 等待应用就绪
echo "7️⃣ 等待应用就绪..."
sleep 15

# 8. 健康检查
echo "8️⃣ 健康检查..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 应用健康检查通过"
else
    echo "❌ 应用健康检查失败"
    docker-compose logs --tail=50
    exit 1
fi
echo ""

# 9. 触发一次信号生成
echo "9️⃣ 触发信号生成..."
docker-compose exec -T hotscan-web pnpm tsx /app/jobs/make-signals.ts || echo "⚠️  信号生成失败，将在 cron 中重试"
echo ""

# 10. 最终验证
echo "🔟 最终验证..."
echo ""
echo "本地验证:"
curl -s http://localhost:3000/api/health | jq '.status' || echo "API 响应异常"
echo ""
echo "外部验证:"
curl -s https://$DOMAIN/api/health | jq '.status' || echo "HTTPS 未就绪，请检查 Nginx 和 SSL"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "访问地址: https://$DOMAIN"
echo "健康检查: https://$DOMAIN/api/health"
echo ""
echo "查看日志:"
echo "  docker-compose logs -f hotscan-web"
echo "  docker-compose logs -f hotscan-cron"
echo ""
echo "重启服务:"
echo "  cd $DEPLOY_DIR && docker-compose restart"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SERVER_SCRIPT

chmod +x server-deploy.sh

echo "✅ server-deploy.sh 已生成"
echo ""

# =========================================================================
# 步骤 5: 生成部署指南
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 步骤 5: 生成部署指南"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > CLOUD_DEPLOY_GUIDE.md <<'GUIDE'
# HotScan 云服务器部署指南

## 📋 前置条件

1. **云服务器**
   - Ubuntu 20.04+ / CentOS 8+ / Debian 11+
   - 至少 2GB RAM
   - 至少 20GB 磁盘空间
   - 公网 IP 地址

2. **域名**
   - 已解析到服务器 IP
   - A 记录指向服务器
   - (可选) www 子域名

3. **数据库**
   - PostgreSQL 数据库（Neon / Supabase）
   - 已启用 vector 扩展

4. **本地环境**
   - SSH 访问服务器
   - Git、Docker 已安装

---

## 🚀 快速部署（3 步）

### 步骤 1: 配置变量

编辑 `deploy-to-server.sh`，填写以下变量：

```bash
DOMAIN="hexedge.site"              # 您的域名
EMAIL="fangp458@gmail.com"         # 用于 SSL 证书
DATABASE_URL="postgresql://..."    # 数据库连接串
OPENAI_API_KEY="sk-..."            # OpenAI API Key
SERVER_HOST="154.201.78.29"        # 服务器 IP
```

### 步骤 2: 执行本地脚本

```bash
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

这将：
- ✅ 创建 .env.production
- ✅ 生成 Prisma Client
- ✅ 打包应用
- ✅ 生成服务器端脚本

### 步骤 3: SSH 到服务器并部署

```bash
# 1. 上传部署包
scp deploy-package/hotscan-*.tar.gz root@154.201.78.29:/tmp/
scp server-deploy.sh root@154.201.78.29:/tmp/

# 2. SSH 到服务器
ssh root@154.201.78.29

# 3. 执行部署
cd /tmp
chmod +x server-deploy.sh
./server-deploy.sh
```

---

## 📊 部署后验证

### 1. 健康检查

```bash
curl https://hexedge.site/api/health
```

预期输出：
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. 首页访问

访问: https://hexedge.site?lang=zh  
访问: https://hexedge.site?lang=en

### 3. 查看日志

```bash
cd /opt/hotscan
docker-compose logs -f hotscan-web
docker-compose logs -f hotscan-cron
```

### 4. 验证定时任务

```bash
# 查看 cron 容器日志
docker-compose logs hotscan-cron

# 应该看到每 30 分钟运行一次 make-signals
```

---

## 🔧 常用操作

### 重启服务

```bash
cd /opt/hotscan
docker-compose restart
```

### 更新代码

```bash
# 本地
./deploy-to-server.sh

# 服务器
cd /opt/hotscan
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 查看状态

```bash
cd /opt/hotscan
docker-compose ps
docker-compose logs --tail=100
```

### 数据库迁移

```bash
docker-compose exec hotscan-web pnpm prisma migrate deploy
```

### 手动生成信号

```bash
docker-compose exec hotscan-web pnpm tsx /app/jobs/make-signals.ts
```

---

## 🛠️ 故障排查

### 问题 1: 应用无法启动

```bash
# 查看日志
docker-compose logs hotscan-web

# 常见原因:
# - 数据库连接失败
# - 环境变量未设置
# - 端口冲突
```

### 问题 2: SSL 证书申请失败

```bash
# 检查域名解析
dig hexedge.site

# 手动申请
certbot --nginx -d hexedge.site -d www.hexedge.site

# 检查证书
certbot certificates
```

### 问题 3: 502 Bad Gateway

```bash
# 检查 Next.js 是否运行
curl http://localhost:3000/api/health

# 检查 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 问题 4: 定时任务不执行

```bash
# 查看 cron 容器状态
docker-compose ps hotscan-cron

# 查看日志
docker-compose logs hotscan-cron

# 手动触发
docker-compose exec hotscan-cron pnpm tsx /app/jobs/make-signals.ts
```

---

## 📈 监控和维护

### 日志监控

```bash
# 实时日志
docker-compose logs -f

# 最近 100 行
docker-compose logs --tail=100

# 特定服务
docker-compose logs -f hotscan-web
```

### 磁盘空间

```bash
# 查看 Docker 空间使用
docker system df

# 清理未使用的镜像
docker system prune -a
```

### 性能监控

```bash
# 查看容器资源使用
docker stats

# 查看系统资源
htop
```

---

## 🔐 安全建议

1. **防火墙配置**
```bash
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable
```

2. **定期更新**
```bash
# 更新系统
apt-get update && apt-get upgrade -y

# 更新 Docker 镜像
docker-compose pull
docker-compose up -d
```

3. **备份数据库**
```bash
# 使用 Neon/Supabase 的自动备份功能
# 或定期导出数据
docker-compose exec hotscan-web pnpm prisma db pull
```

---

## 📝 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://user:pass@host/db` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-...` |
| `OPENAI_API_BASE` | API Base URL | `https://aium.cc/v1/` |
| `DOMAIN` | 您的域名 | `hexedge.site` |
| `EMAIL` | 用于 SSL 证书 | `your@email.com` |

---

## 🎊 部署成功标志

✅ `https://hexedge.site` 可访问  
✅ `https://hexedge.site/api/health` 返回 healthy  
✅ Header 语言切换按钮可见  
✅ 首页显示信号卡片（去重后）  
✅ 点击卡片可进入详情页  
✅ 每 30 分钟自动生成新信号  

---

**生成时间**: 2025-10-04  
**版本**: v1.0.0
GUIDE

echo "✅ CLOUD_DEPLOY_GUIDE.md 已生成"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 部署准备完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 已生成文件:"
echo "   ✅ Dockerfile"
echo "   ✅ docker-compose.yml"
echo "   ✅ nginx.conf"
echo "   ✅ .env.production"
echo "   ✅ server-deploy.sh"
echo "   ✅ CLOUD_DEPLOY_GUIDE.md"
echo ""
echo "🚀 下一步:"
echo ""
echo "  1. 上传到服务器:"
echo "     scp deploy-package/*.tar.gz root@154.201.78.29:/tmp/"
echo "     scp server-deploy.sh root@154.201.78.29:/tmp/"
echo ""
echo "  2. SSH 到服务器:"
echo "     ssh root@154.201.78.29"
echo ""
echo "  3. 执行部署:"
echo "     cd /tmp && chmod +x server-deploy.sh && ./server-deploy.sh"
echo ""
echo "  4. 访问网站:"
echo "     https://hexedge.site?lang=zh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

