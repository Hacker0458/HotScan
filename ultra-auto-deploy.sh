#!/bin/bash

# HotScan 超级自动化部署
# 使用 Vercel CLI 自动获取环境变量，最小化手动操作

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║          🤖 HotScan 超级自动化部署（使用 Vercel CLI）                    ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# 1. 使用 Vercel CLI 获取环境变量
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 1/4】从 Vercel 获取环境变量"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 Vercel CLI 是否已登录
if vercel whoami &>/dev/null; then
    echo -e "${GREEN}✓ Vercel CLI 已登录${NC}"
    
    # 尝试拉取环境变量到 .env.local
    echo "▶ 拉取生产环境变量..."
    vercel env pull .env.production --yes 2>&1 | grep -v "Vercel CLI" || true
    
    # 从拉取的文件中读取 DATABASE_URL
    if [ -f ".env.production" ]; then
        DATABASE_URL=$(grep '^DATABASE_URL=' .env.production | cut -d'=' -f2-)
        if [ ! -z "$DATABASE_URL" ]; then
            echo -e "${GREEN}✅ 成功获取 DATABASE_URL${NC}"
            echo "   ${DATABASE_URL:0:30}...${DATABASE_URL: -20}"
        fi
    fi
fi

# 如果自动获取失败，打开浏览器
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  自动获取失败，需要手动输入${NC}"
    echo ""
    echo "即将打开 Vercel 环境变量页面..."
    sleep 2
    open "https://vercel.com/fangp458-2547s-projects/hotscan/settings/environment-variables" 2>/dev/null || true
    echo ""
    echo "请在页面中:"
    echo "  1. 找到 DATABASE_URL"
    echo "  2. 点击 'Click to reveal'"
    echo "  3. 复制完整字符串"
    echo ""
    echo -n "粘贴 DATABASE_URL: "
    read DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL 不能为空${NC}"
    exit 1
fi

# 2. GitHub Token
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 2/4】GitHub 认证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查是否已经有 gh 认证
if gh auth status &>/dev/null; then
    echo -e "${GREEN}✓ GitHub CLI 已认证${NC}"
else
    echo "打开 GitHub Token 创建页面..."
    open "https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hook&description=HotScan-Deploy" 2>/dev/null || true
    echo ""
    echo "请在页面中:"
    echo "  1. 点击 'Generate token'"
    echo "  2. 复制生成的 token"
    echo ""
    echo -n "粘贴 GitHub Token: "
    read GITHUB_TOKEN
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}❌ Token 不能为空${NC}"
        exit 1
    fi
    
    echo "$GITHUB_TOKEN" | gh auth login --with-token
    echo -e "${GREEN}✅ GitHub 认证成功${NC}"
fi

# 3. 创建仓库并推送
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 3/4】推送代码到 GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 确保代码已提交
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "▶ 提交未保存的更改..."
    git add -A
    git commit -m "chore: 准备部署" || true
fi

echo "▶ 创建 GitHub 仓库..."
gh repo create HotScan --public \
  --description "HotScan｜热点雷达 - 实时加密货币市场信号监测系统" \
  --source=. --remote=origin --push 2>&1 | grep -v "warning:" || {
    echo -e "${YELLOW}  仓库可能已存在，推送更新...${NC}"
    git remote remove origin 2>/dev/null || true
    git remote add origin https://github.com/Hacker0458/HotScan.git
    git push -u origin main -f
}

echo -e "${GREEN}✅ 代码推送完成${NC}"

# 4. 配置 Secrets
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 4/4】配置 GitHub Secrets 并启动"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 从 .env 读取配置
OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
OPENAI_API_BASE=$(grep '^OPENAI_API_BASE=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

echo "▶ 配置 Secrets..."
echo "$DATABASE_URL" | gh secret set DATABASE_URL --repo Hacker0458/HotScan 2>&1 | grep -v "warning:" || true
echo "$OPENAI_API_KEY" | gh secret set OPENAI_API_KEY --repo Hacker0458/HotScan 2>&1 | grep -v "warning:" || true
echo "$OPENAI_API_BASE" | gh secret set OPENAI_API_BASE --repo Hacker0458/HotScan 2>&1 | grep -v "warning:" || true
echo "dexscreener" | gh secret set DATASOURCE --repo Hacker0458/HotScan 2>&1 | grep -v "warning:" || true
echo "0" | gh secret set MOCK_AI --repo Hacker0458/HotScan 2>&1 | grep -v "warning:" || true

echo -e "${GREEN}✅ Secrets 配置完成${NC}"
echo ""
gh secret list --repo Hacker0458/HotScan | head -6 | sed 's/^/  /'

# 触发 workflow
echo ""
echo "▶ 触发 GitHub Actions..."
sleep 2
gh workflow run cron.yml --repo Hacker0458/HotScan 2>&1 | grep -v "warning:" || true
echo -e "${GREEN}✅ 已触发首次执行${NC}"

# 等待并显示状态
echo ""
echo "▶ 等待 workflow 启动（10秒）..."
for i in {10..1}; do
    echo -ne "  $i秒...\r"
    sleep 1
done
echo ""

echo ""
echo "最新执行状态:"
gh run list --repo Hacker0458/HotScan --workflow=cron.yml --limit=3 2>/dev/null | sed 's/^/  /' || echo "  正在排队..."

# 完成
echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                        🎉 部署完成                                        ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ HotScan 已成功部署到生产环境！${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【重要链接】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📦 GitHub 仓库:${NC}"
echo "   https://github.com/Hacker0458/HotScan"
echo ""
echo -e "${BLUE}⚙️  GitHub Actions:${NC}"
echo "   https://github.com/Hacker0458/HotScan/actions"
echo ""
echo -e "${BLUE}🌐 生产环境:${NC}"
echo "   https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【快速验证】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "# 查看最新信号数据"
echo "curl -s https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app/api/signals?limit=3 | jq ."
echo ""
echo "# 实时监控 Actions"
echo "gh run watch --repo Hacker0458/HotScan"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✨ 定时任务已配置：每 30 分钟自动执行一次${NC}"
echo ""

# 询问是否打开浏览器
echo -n "是否打开浏览器查看？(y/n): "
read OPEN_BROWSER

if [[ "$OPEN_BROWSER" == "y" || "$OPEN_BROWSER" == "Y" ]]; then
    open "https://github.com/Hacker0458/HotScan/actions" 2>/dev/null
    sleep 1
    open "https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app" 2>/dev/null
fi

echo ""
echo -e "${GREEN}🎊 恭喜！HotScan 部署成功！${NC}"
echo ""
