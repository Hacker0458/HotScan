#!/bin/bash
set -e

# 部署配置
SERVER_IP="154.201.78.29"
SERVER_USER="root"
SERVER_PASSWORD="JFroson 081130"
DEPLOY_PATH="/www/wwwroot/hotscan.jfroson.com"
PROJECT_NAME="HotScan"

echo "🚀 开始部署 $PROJECT_NAME 到生产服务器..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤1: 构建本地项目
echo -e "${YELLOW}📦 步骤1: 构建项目...${NC}"
pnpm install
pnpm build

# 步骤2: 打包项目文件
echo -e "${YELLOW}📦 步骤2: 打包项目文件...${NC}"
TEMP_DEPLOY="/tmp/hotscan-deploy-$(date +%s)"
mkdir -p "$TEMP_DEPLOY"

# 复制必要文件
cp -r .next "$TEMP_DEPLOY/"
cp -r public "$TEMP_DEPLOY/" 2>/dev/null || true
cp -r prisma "$TEMP_DEPLOY/"
cp package.json "$TEMP_DEPLOY/"
cp pnpm-lock.yaml "$TEMP_DEPLOY/"
cp next.config.mjs "$TEMP_DEPLOY/"
cp .env.example "$TEMP_DEPLOY/"

# 创建压缩包
cd "$TEMP_DEPLOY/.."
tar -czf hotscan-deploy.tar.gz "$(basename $TEMP_DEPLOY)"

echo -e "${GREEN}✅ 项目打包完成${NC}"

# 步骤3: 上传到服务器
echo -e "${YELLOW}📤 步骤3: 上传到服务器...${NC}"
echo "请在新终端手动执行以下命令："
echo ""
echo -e "${GREEN}scp /tmp/hotscan-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/${NC}"
echo ""
echo "然后在服务器上执行："
echo ""
cat << 'SERVEREOF'
# 1. SSH连接到服务器
ssh root@154.201.78.29

# 2. 在服务器上执行
cd /tmp
tar -xzf hotscan-deploy.tar.gz
cd hotscan-deploy-*

# 3. 备份现有部署（如果存在）
if [ -d "/www/wwwroot/hotscan.jfroson.com" ]; then
  mv /www/wwwroot/hotscan.jfroson.com /www/wwwroot/hotscan.jfroson.com.backup-$(date +%Y%m%d-%H%M%S)
fi

# 4. 移动新文件
mkdir -p /www/wwwroot/hotscan.jfroson.com
mv * /www/wwwroot/hotscan.jfroson.com/

# 5. 进入部署目录
cd /www/wwwroot/hotscan.jfroson.com

# 6. 安装依赖（生产环境）
pnpm install --prod

# 7. 配置环境变量
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://hotscan:YOUR_DB_PASSWORD@localhost:5432/hotscan?schema=public"

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
HOTSCAN_QUERIES="DOGE,PEPE,SHIB,BONK,WIF,POPCAT,MEW,BRETT,TURBO,ANDY"

# Settings
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
NEXT_PUBLIC_SIGNAL_WINDOW_DEFAULT=1h
MIN_LIQ_FILTER_USD=100000
MOCK_AI=false
NEXT_PUBLIC_SEO_ENABLED=true
EOF

# 8. 运行数据库迁移
pnpm prisma db push

# 9. 使用PM2启动应用
pm2 delete hotscan 2>/dev/null || true
pm2 start npm --name "hotscan" -- start
pm2 save
pm2 startup

# 10. 配置Nginx（如果需要）
cat > /etc/nginx/sites-available/hotscan.conf << 'NGINXEOF'
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
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/hotscan.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 11. 配置SSL（Let's Encrypt）
# certbot --nginx -d hotscan.jfroson.com

echo "✅ 部署完成！"
echo "🌐 访问: https://hotscan.jfroson.com"
echo "📊 PM2状态: pm2 status"
echo "📝 查看日志: pm2 logs hotscan"
SERVEREOF

echo ""
echo -e "${GREEN}✅ 部署脚本准备完成！${NC}"
echo -e "${YELLOW}请按照上面的说明手动完成部署${NC}"

