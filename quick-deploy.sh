#!/bin/bash
# HotScan 一键部署脚本
# 服务器: 154.201.78.29
# 部署路径: /www/wwwroot/hotscan.jfroson.com

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务器配置
SERVER="154.201.78.29"
USER="root"
DEPLOY_PATH="/www/wwwroot/hotscan.jfroson.com"

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   HotScan 生产服务器一键部署工具    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# 步骤1: 创建部署包
echo -e "${YELLOW}📦 步骤1/4: 创建部署包...${NC}"

TEMP_DIR="/tmp/hotscan-deploy-$(date +%s)"
mkdir -p "$TEMP_DIR"

# 复制必要文件
echo "  ├─ 复制构建文件..."
cp -r .next "$TEMP_DIR/"
[ -d "public" ] && cp -r public "$TEMP_DIR/"
cp -r prisma "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp pnpm-lock.yaml "$TEMP_DIR/"
cp next.config.mjs "$TEMP_DIR/"

# 创建服务器部署脚本
cat > "$TEMP_DIR/server-deploy.sh" << 'SERVERSCRIPT'
#!/bin/bash
set -e

echo "🚀 开始在服务器上部署..."

# 进入部署目录
cd /www/wwwroot/hotscan.jfroson.com

# 停止现有服务
echo "⏸️  停止现有服务..."
pm2 stop hotscan 2>/dev/null || true

# 安装依赖
echo "📦 安装依赖..."
pnpm install --prod

# 配置环境变量（如果不存在）
if [ ! -f ".env" ]; then
  echo "⚙️  创建环境变量文件..."
  cat > .env << 'EOF'
DATABASE_URL="postgresql://hotscan:YOUR_DB_PASSWORD@localhost:5432/hotscan?schema=public"
PROBEX_API_KEY="sk-JaLWJy75i0t0gzrY41V7uMAjI2TcEga4Ojg6mF96nhFzQLyo"
AIUM_API_KEY="sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU"
CHATAIAPI_KEY="sk-dXYiVkp3MihKRdWcQoBOsA5ZP3GYZPEoVjUJG0hAzPaSXK06"
NEXTAUTH_URL="https://hotscan.jfroson.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
JOB_TOKEN="$(openssl rand -base64 32)"
DATASOURCE="dexscreener"
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
NODE_ENV=production
EOF
  echo "⚠️  请修改 .env 中的数据库密码！"
fi

# 运行数据库迁移
echo "🗄️  运行数据库迁移..."
pnpm prisma db push

# 启动服务
echo "🚀 启动应用..."
pm2 start npm --name "hotscan" -- start
pm2 save

echo "✅ 部署完成！"
echo "🌐 访问: http://hotscan.jfroson.com"
echo "📊 查看状态: pm2 status"
echo "📝 查看日志: pm2 logs hotscan"
SERVERSCRIPT

chmod +x "$TEMP_DIR/server-deploy.sh"

# 打包
echo "  ├─ 压缩打包..."
cd "$(dirname $TEMP_DIR)"
tar -czf hotscan-deploy.tar.gz "$(basename $TEMP_DIR)"

DEPLOY_PACKAGE="$(dirname $TEMP_DIR)/hotscan-deploy.tar.gz"

echo -e "${GREEN}  ✓ 部署包已创建: $DEPLOY_PACKAGE${NC}"
echo ""

# 步骤2: 上传到服务器
echo -e "${YELLOW}📤 步骤2/4: 上传到服务器...${NC}"
echo -e "${BLUE}请在提示时输入密码: JFroson 081130${NC}"

scp "$DEPLOY_PACKAGE" "$USER@$SERVER:/tmp/" || {
  echo -e "${RED}❌ 上传失败！${NC}"
  echo -e "${YELLOW}请手动执行:${NC}"
  echo "  scp $DEPLOY_PACKAGE $USER@$SERVER:/tmp/"
  exit 1
}

echo -e "${GREEN}  ✓ 上传完成${NC}"
echo ""

# 步骤3: 在服务器上解压
echo -e "${YELLOW}📂 步骤3/4: 在服务器上解压...${NC}"

ssh "$USER@$SERVER" << 'SSHEOF'
cd /tmp
echo "解压部署包..."
tar -xzf hotscan-deploy.tar.gz

# 备份现有部署
if [ -d "/www/wwwroot/hotscan.jfroson.com" ]; then
  BACKUP_DIR="/www/wwwroot/hotscan.jfroson.com.backup-$(date +%Y%m%d-%H%M%S)"
  echo "备份现有部署到: $BACKUP_DIR"
  mv /www/wwwroot/hotscan.jfroson.com "$BACKUP_DIR"
fi

# 创建部署目录
mkdir -p /www/wwwroot/hotscan.jfroson.com

# 移动文件
DEPLOY_SRC=$(find /tmp -maxdepth 1 -name "hotscan-deploy-*" -type d | head -1)
echo "移动文件从: $DEPLOY_SRC"
mv "$DEPLOY_SRC"/* /www/wwwroot/hotscan.jfroson.com/

echo "✓ 文件部署完成"
SSHEOF

echo -e "${GREEN}  ✓ 解压完成${NC}"
echo ""

# 步骤4: 执行部署脚本
echo -e "${YELLOW}🚀 步骤4/4: 启动应用...${NC}"

ssh "$USER@$SERVER" << 'SSHEOF'
cd /www/wwwroot/hotscan.jfroson.com
bash server-deploy.sh
SSHEOF

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 部署成功完成！           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 应用信息:${NC}"
echo "  ├─ 访问地址: http://hotscan.jfroson.com"
echo "  ├─ 服务器: $SERVER"
echo "  └─ 部署路径: $DEPLOY_PATH"
echo ""
echo -e "${BLUE}🔧 常用命令:${NC}"
echo "  ├─ 查看状态: ssh $USER@$SERVER 'pm2 status'"
echo "  ├─ 查看日志: ssh $USER@$SERVER 'pm2 logs hotscan'"
echo "  ├─ 重启应用: ssh $USER@$SERVER 'pm2 restart hotscan'"
echo "  └─ 停止应用: ssh $USER@$SERVER 'pm2 stop hotscan'"
echo ""
echo -e "${YELLOW}⚠️  下一步:${NC}"
echo "  1. 修改服务器上的 .env 文件（数据库密码）"
echo "  2. 配置Nginx反向代理"
echo "  3. 安装SSL证书"
echo "  4. 设置定时任务"
echo ""

# 清理
rm -rf "$TEMP_DIR"
rm -f "$DEPLOY_PACKAGE"

echo -e "${GREEN}✨ 完成！${NC}"

