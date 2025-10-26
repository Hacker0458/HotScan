#!/bin/bash
# HotScan 服务器端自动部署脚本
# 在服务器上直接执行此脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 部署配置
DEPLOY_PATH="/www/wwwroot/hotscan.jfroson.com"
GITHUB_REPO="https://github.com/Hacker0458/HotScan.git"
APP_NAME="hotscan"
APP_PORT="3000"
DB_NAME="hotscan"
DB_USER="hotscan"
DB_PASSWORD="HotScan@2025!Secure"  # 强密码

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         HotScan 自动部署脚本 v2.0                    ║
║         服务器端一键部署                              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}📋 部署信息:${NC}"
echo "  ├─ 部署路径: $DEPLOY_PATH"
echo "  ├─ 应用端口: $APP_PORT"
echo "  ├─ 数据库: $DB_NAME"
echo "  └─ GitHub: $GITHUB_REPO"
echo ""

# 函数：检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 函数：安装Node.js和pnpm
install_nodejs() {
    if ! command_exists node; then
        echo -e "${YELLOW}📦 安装Node.js 18...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        echo -e "${GREEN}✓ Node.js 已安装 ($(node -v))${NC}"
    fi
    
    if ! command_exists pnpm; then
        echo -e "${YELLOW}📦 安装pnpm...${NC}"
        npm install -g pnpm
    else
        echo -e "${GREEN}✓ pnpm 已安装 ($(pnpm -v))${NC}"
    fi
}

# 函数：安装PostgreSQL
install_postgresql() {
    if ! command_exists psql; then
        echo -e "${YELLOW}📦 安装PostgreSQL 14...${NC}"
        apt-get install -y postgresql-14 postgresql-contrib-14
        systemctl enable postgresql
        systemctl start postgresql
    else
        echo -e "${GREEN}✓ PostgreSQL 已安装${NC}"
    fi
}

# 函数：安装PM2
install_pm2() {
    if ! command_exists pm2; then
        echo -e "${YELLOW}📦 安装PM2...${NC}"
        npm install -g pm2
        pm2 startup
    else
        echo -e "${GREEN}✓ PM2 已安装${NC}"
    fi
}

# 函数：安装Nginx
install_nginx() {
    if ! command_exists nginx; then
        echo -e "${YELLOW}📦 安装Nginx...${NC}"
        apt-get install -y nginx
        systemctl enable nginx
        systemctl start nginx
    else
        echo -e "${GREEN}✓ Nginx 已安装${NC}"
    fi
}

# 步骤1: 更新系统
echo -e "${YELLOW}🔄 步骤1/9: 更新系统包...${NC}"
apt-get update -qq
echo -e "${GREEN}✓ 系统包已更新${NC}"
echo ""

# 步骤2: 安装依赖
echo -e "${YELLOW}📦 步骤2/9: 安装必要依赖...${NC}"
apt-get install -y git curl build-essential openssl
install_nodejs
install_postgresql
install_pm2
install_nginx
echo -e "${GREEN}✓ 所有依赖已安装${NC}"
echo ""

# 步骤3: 配置PostgreSQL数据库
echo -e "${YELLOW}🗄️  步骤3/9: 配置数据库...${NC}"

# 检查数据库是否已存在
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" != "1" ]; then
    echo "  ├─ 创建数据库和用户..."
    sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
CREATE EXTENSION IF NOT EXISTS vector;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF
    echo -e "${GREEN}  ✓ 数据库创建成功${NC}"
else
    echo -e "${GREEN}  ✓ 数据库已存在${NC}"
fi
echo ""

# 步骤4: 克隆代码
echo -e "${YELLOW}📥 步骤4/9: 部署代码...${NC}"

# 备份现有部署
if [ -d "$DEPLOY_PATH" ]; then
    BACKUP_PATH="${DEPLOY_PATH}.backup-$(date +%Y%m%d-%H%M%S)"
    echo "  ├─ 备份现有部署到: $BACKUP_PATH"
    mv "$DEPLOY_PATH" "$BACKUP_PATH"
fi

# 克隆代码
echo "  ├─ 从GitHub克隆代码..."
git clone "$GITHUB_REPO" "$DEPLOY_PATH"
cd "$DEPLOY_PATH"

echo -e "${GREEN}  ✓ 代码部署完成${NC}"
echo ""

# 步骤5: 安装项目依赖
echo -e "${YELLOW}📦 步骤5/9: 安装项目依赖...${NC}"
pnpm install
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

# 步骤6: 配置环境变量
echo -e "${YELLOW}⚙️  步骤6/9: 配置环境变量...${NC}"

# 生成随机密钥
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JOB_TOKEN=$(openssl rand -base64 32)

cat > .env << EOF
# ===========================================
# HotScan 生产环境配置
# 自动生成于 $(date)
# ===========================================

# Database
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

# AI API Keys (已配置)
PROBEX_API_KEY="sk-JaLWJy75i0t0gzrY41V7uMAjI2TcEga4Ojg6mF96nhFzQLyo"
AIUM_API_KEY="sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU"
CHATAIAPI_KEY="sk-dXYiVkp3MihKRdWcQoBOsA5ZP3GYZPEoVjUJG0hAzPaSXK06"

# NextAuth
NEXTAUTH_URL="https://hotscan.jfroson.com"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# Job Security
JOB_TOKEN="${JOB_TOKEN}"

# Data Source
DATASOURCE="dexscreener"
DEXSCREENER_BASE="https://api.dexscreener.com/latest"
HOTSCAN_QUERIES="BTC,ETH,SOL,DOGE,PEPE,SHIB,BONK,WIF,POPCAT,MEW,BRETT,TURBO,ANDY"

# Application Settings
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
NEXT_PUBLIC_SIGNAL_WINDOW_DEFAULT=1h
MIN_LIQ_FILTER_USD=100000
MOCK_AI=false
NEXT_PUBLIC_SEO_ENABLED=true

# Node Environment
NODE_ENV=production
PORT=${APP_PORT}
EOF

echo -e "${GREEN}✓ 环境配置完成${NC}"
echo "  ├─ 数据库: $DB_NAME"
echo "  ├─ NextAuth密钥: [已生成]"
echo "  └─ Job令牌: [已生成]"
echo ""

# 步骤7: 构建项目
echo -e "${YELLOW}🔨 步骤7/9: 构建生产版本...${NC}"
pnpm build
echo -e "${GREEN}✓ 构建完成${NC}"
echo ""

# 步骤8: 运行数据库迁移
echo -e "${YELLOW}🗄️  步骤8/9: 运行数据库迁移...${NC}"
pnpm prisma db push
echo -e "${GREEN}✓ 数据库迁移完成${NC}"
echo ""

# 步骤9: 启动应用
echo -e "${YELLOW}🚀 步骤9/9: 启动应用...${NC}"

# 停止旧进程
pm2 delete $APP_NAME 2>/dev/null || true

# 启动新应用
pm2 start npm --name "$APP_NAME" -- start -- -p $APP_PORT

# 保存PM2配置
pm2 save

echo -e "${GREEN}✓ 应用启动成功${NC}"
echo ""

# 配置Nginx（如果需要）
echo -e "${YELLOW}🌐 配置Nginx反向代理...${NC}"

NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"

# 检查是否已有配置
if [ ! -f "$NGINX_CONF" ]; then
    cat > "$NGINX_CONF" << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name hotscan.jfroson.com;

    # SSL配置（如果已有证书，会自动被Certbot管理）
    # listen 443 ssl http2;
    # listen [::]:443 ssl http2;
    # ssl_certificate /path/to/cert;
    # ssl_certificate_key /path/to/key;

    # 根路径
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
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
NGINXEOF

    # 创建软链接
    ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
    
    # 测试Nginx配置
    nginx -t
    
    # 重载Nginx
    systemctl reload nginx
    
    echo -e "${GREEN}✓ Nginx配置完成${NC}"
else
    echo -e "${GREEN}✓ Nginx配置已存在${NC}"
fi
echo ""

# 配置定时任务
echo -e "${YELLOW}⏰ 配置定时任务...${NC}"

# 检查是否已有cron任务
CRON_EXISTS=$(crontab -l 2>/dev/null | grep -c "make-signals.ts" || true)

if [ "$CRON_EXISTS" -eq 0 ]; then
    # 添加cron任务
    (crontab -l 2>/dev/null; echo "*/5 * * * * cd $DEPLOY_PATH && NODE_ENV=production pnpm tsx jobs/make-signals.ts >> /var/log/hotscan-signals.log 2>&1") | crontab -
    (crontab -l 2>/dev/null; echo "* * * * * curl -X POST -H \"Authorization: Bearer $JOB_TOKEN\" http://localhost:3000/api/alerts/check >> /var/log/hotscan-alerts.log 2>&1") | crontab -
    
    echo -e "${GREEN}✓ 定时任务已配置${NC}"
    echo "  ├─ 信号生成: 每5分钟"
    echo "  └─ 提醒检查: 每1分钟"
else
    echo -e "${GREEN}✓ 定时任务已存在${NC}"
fi
echo ""

# 配置防火墙
echo -e "${YELLOW}🔒 配置防火墙...${NC}"
if command_exists ufw; then
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
    ufw allow 22/tcp 2>/dev/null || true
    echo -e "${GREEN}✓ 防火墙规则已添加${NC}"
else
    echo -e "${YELLOW}⚠️  UFW未安装，跳过防火墙配置${NC}"
fi
echo ""

# 显示部署信息
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║              🎉 部署成功完成！                       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}📊 部署摘要:${NC}"
echo "  ├─ 应用名称: $APP_NAME"
echo "  ├─ 部署路径: $DEPLOY_PATH"
echo "  ├─ 运行端口: $APP_PORT"
echo "  ├─ 数据库: $DB_NAME"
echo "  └─ 进程管理: PM2"
echo ""

echo -e "${CYAN}🌐 访问地址:${NC}"
echo "  ├─ HTTPS: https://hotscan.jfroson.com"
echo "  ├─ HTTP: http://hotscan.jfroson.com"
echo "  └─ 本地: http://localhost:$APP_PORT"
echo ""

echo -e "${CYAN}🔧 常用命令:${NC}"
echo "  ├─ 查看状态: pm2 status"
echo "  ├─ 查看日志: pm2 logs $APP_NAME"
echo "  ├─ 重启应用: pm2 restart $APP_NAME"
echo "  ├─ 停止应用: pm2 stop $APP_NAME"
echo "  └─ 查看监控: pm2 monit"
echo ""

echo -e "${CYAN}📝 数据库信息:${NC}"
echo "  ├─ 主机: localhost"
echo "  ├─ 端口: 5432"
echo "  ├─ 数据库: $DB_NAME"
echo "  ├─ 用户: $DB_USER"
echo "  └─ 密码: $DB_PASSWORD"
echo ""

echo -e "${YELLOW}⚠️  安全提示:${NC}"
echo "  1. 请妥善保管数据库密码"
echo "  2. 定期备份数据库"
echo "  3. 监控应用日志"
echo "  4. 定期更新依赖"
echo ""

echo -e "${PURPLE}📚 更多信息:${NC}"
echo "  ├─ 项目文档: $DEPLOY_PATH/README.md"
echo "  ├─ API文档: $DEPLOY_PATH/API_DOCUMENTATION.md"
echo "  └─ GitHub: $GITHUB_REPO"
echo ""

# 运行健康检查
echo -e "${YELLOW}🏥 运行健康检查...${NC}"
sleep 3

if curl -s http://localhost:$APP_PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 应用健康检查通过${NC}"
else
    echo -e "${RED}⚠️  应用健康检查失败，请检查日志${NC}"
    echo "  运行: pm2 logs $APP_NAME"
fi
echo ""

echo -e "${GREEN}✨ 部署完成！祝您使用愉快！${NC}"
echo ""

