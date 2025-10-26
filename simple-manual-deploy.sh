#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HotScan 简化手动部署脚本
# 适用于通过服务器面板 Web 终端执行
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 HotScan 服务器部署指令
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请在服务器终端中逐条执行以下命令：

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 1: 安装 Docker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker
docker --version

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 2: 安装 Docker Compose
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 3: 安装 Nginx 和 Certbot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

apt-get update
apt-get install -y nginx certbot python3-certbot-nginx git
nginx -v

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 4: 克隆代码（或手动上传）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 方法 A: 通过 Git（如果仓库是公开的或已配置 SSH）
cd /opt
git clone <your-repo-url> hotscan
cd hotscan

# 方法 B: 手动解压上传的文件
mkdir -p /opt/hotscan
cd /opt/hotscan
tar xzf /tmp/hotscan-*.tar.gz

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 5: 创建环境变量文件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd /opt/hotscan

cat > .env.production <<'ENVEOF'
DATABASE_URL=postgresql://neondb_owner:npg_F7iA5rNzByYP@ep-frosty-frog-a1cazil9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
OPENAI_API_KEY=sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU
OPENAI_API_BASE=https://aium.cc/v1/
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://hexedge.site
NEXTAUTH_URL=https://hexedge.site
NEXTAUTH_SECRET=your-secret-change-this-$(date +%s)
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
ENABLE_AI_SUMMARY=false
MOCK_AI=true
ENVEOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 6: 配置 Nginx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cp /opt/hotscan/nginx.conf /etc/nginx/sites-available/hotscan
ln -sf /etc/nginx/sites-available/hotscan /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 7: 申请 SSL 证书
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

certbot --nginx -d hexedge.site -d www.hexedge.site --non-interactive --agree-tos -m fangp458@gmail.com

# 验证证书
certbot certificates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 8: 启动 Docker 应用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd /opt/hotscan

# 构建镜像
docker-compose build --no-cache

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs --tail=50

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 9: 验证部署
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 等待应用启动（20 秒）
sleep 20

# 本地健康检查
curl http://localhost:3000/api/health

# 外部 HTTPS 检查
curl https://hexedge.site/api/health

# 测试 API
curl https://hexedge.site/api/signals?limit=2&lang=zh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 10: 触发首次信号生成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 手动触发一次
docker-compose exec hotscan-web pnpm tsx /app/jobs/make-signals.ts

# 或等待 cron 自动执行（30 分钟）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 部署完成！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

访问地址:
  https://hexedge.site?lang=zh (中文)
  https://hexedge.site?lang=en (英文)

健康检查:
  https://hexedge.site/api/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

