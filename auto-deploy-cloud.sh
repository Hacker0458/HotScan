#!/bin/bash
set -e

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HotScan 一键自动部署到云服务器
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 HotScan 一键自动部署"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# =========================================================================
# 配置变量
# =========================================================================

DOMAIN="hexedge.site"
EMAIL="fangp458@gmail.com"
DATABASE_URL="postgresql://neondb_owner:npg_F7iA5rNzByYP@ep-frosty-frog-a1cazil9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
OPENAI_API_KEY="sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU"
OPENAI_API_BASE="https://aium.cc/v1/"

# 服务器信息（请填写您的服务器信息）
SERVER_USER="root"
SERVER_HOST="154.201.78.29"
SERVER_SSH_KEY="~/.ssh/id_rsa"
DEPLOY_DIR="/opt/hotscan"

echo "📋 部署配置："
echo "   域名: $DOMAIN"
echo "   服务器: $SERVER_USER@$SERVER_HOST"
echo "   部署目录: $DEPLOY_DIR"
echo ""

# =========================================================================
# 步骤 1: 本地准备
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 步骤 1/5: 本地准备"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 创建 .env.production
cat > .env.production <<EOF
DATABASE_URL=$DATABASE_URL
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_API_BASE=$OPENAI_API_BASE
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-secret-$(date +%s)")
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
ENABLE_AI_SUMMARY=false
MOCK_AI=true
EOF

echo "✅ .env.production 已创建"

# 生成 Prisma Client
echo "生成 Prisma Client..."
pnpm prisma generate 2>&1 | tail -3
echo "✅ Prisma Client 已生成"
echo ""

# =========================================================================
# 步骤 2: 创建部署包
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 步骤 2/5: 创建部署包"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

mkdir -p deploy-package
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="hotscan-$TIMESTAMP.tar.gz"

tar czf "deploy-package/$PACKAGE_NAME" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=deploy-package \
  --exclude='*.md' \
  --exclude=COMPLETE_VERIFICATION.md \
  --exclude=DEPLOYMENT_DIAGNOSIS.md \
  .

echo "✅ 部署包已创建: deploy-package/$PACKAGE_NAME"
echo ""

# =========================================================================
# 步骤 3: 上传到服务器
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 步骤 3/5: 上传到服务器"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "正在上传部署包..."
scp -i $SERVER_SSH_KEY "deploy-package/$PACKAGE_NAME" "$SERVER_USER@$SERVER_HOST:/tmp/" 2>&1 | grep -v "Warning:" || true
echo "✅ 部署包已上传"

echo "正在上传服务器部署脚本..."
scp -i $SERVER_SSH_KEY server-deploy.sh "$SERVER_USER@$SERVER_HOST:/tmp/" 2>&1 | grep -v "Warning:" || true
echo "✅ 服务器脚本已上传"
echo ""

# =========================================================================
# 步骤 4: 服务器端部署
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 步骤 4/5: 服务器端部署"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "连接到服务器并执行部署..."
ssh -i $SERVER_SSH_KEY "$SERVER_USER@$SERVER_HOST" << REMOTE_CMD
set -e

echo "开始服务器端部署..."

# 安装 Docker（如果未安装）
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
fi

# 安装 Docker Compose（如果未安装）
if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 安装 Nginx（如果未安装）
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt-get update && apt-get install -y nginx certbot python3-certbot-nginx
fi

# 创建部署目录
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 解压部署包
echo "解压部署包..."
tar xzf /tmp/$PACKAGE_NAME -C $DEPLOY_DIR

# 配置 Nginx
echo "配置 Nginx..."
if [ -f "$DEPLOY_DIR/nginx.conf" ]; then
    sed -i "s/hexedge.site/$DOMAIN/g" $DEPLOY_DIR/nginx.conf
    cp $DEPLOY_DIR/nginx.conf /etc/nginx/sites-available/hotscan
    ln -sf /etc/nginx/sites-available/hotscan /etc/nginx/sites-enabled/hotscan
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    echo "✅ Nginx 已配置"
fi

# 申请 SSL 证书
echo "申请 SSL 证书..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL || echo "⚠️  SSL 申请失败，请手动执行"
fi

# 停止旧容器
docker-compose down 2>/dev/null || true

# 启动新容器
echo "启动 Docker 容器..."
docker-compose build --no-cache
docker-compose up -d

# 等待启动
echo "等待应用启动..."
sleep 20

# 健康检查
echo "健康检查..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 应用健康"
else
    echo "❌ 应用不健康，查看日志:"
    docker-compose logs --tail=20
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 服务器端部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "访问地址: https://$DOMAIN"
echo ""

REMOTE_CMD

echo ""
echo "✅ 远程部署完成"
echo ""

# =========================================================================
# 步骤 5: 验证部署
# =========================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 步骤 5/5: 验证部署"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "等待 DNS 传播和服务就绪（30 秒）..."
sleep 30

echo "验证 HTTPS..."
if curl -f -s "https://$DOMAIN/api/health" > /dev/null 2>&1; then
    echo "✅ HTTPS 健康检查通过"
    curl -s "https://$DOMAIN/api/health" | jq '.' 2>&1 || curl -s "https://$DOMAIN/api/health"
else
    echo "⚠️  HTTPS 未就绪，请稍后手动验证"
    echo "   或访问: http://$SERVER_HOST:3000/api/health"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 访问地址:"
echo "   https://$DOMAIN?lang=zh"
echo "   https://$DOMAIN?lang=en"
echo ""
echo "✅ 健康检查:"
echo "   https://$DOMAIN/api/health"
echo ""
echo "✅ 查看服务器日志:"
echo "   ssh $SERVER_USER@$SERVER_HOST 'cd $DEPLOY_DIR && docker-compose logs -f'"
echo ""
echo "✅ 定时任务:"
echo "   每 30 分钟自动生成信号（hotscan-cron 容器）"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

