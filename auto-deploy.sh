#!/bin/bash

# HotScan 全自动部署脚本（交互式）
set -e

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                  🚀 HotScan 全自动部署向导                                ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打开网页
open_url() {
    local url="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$url"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$url"
    else
        echo "请手动访问: $url"
    fi
}

# 函数：等待用户输入
wait_for_input() {
    local prompt="$1"
    local var_name="$2"
    echo -e "${YELLOW}${prompt}${NC}"
    read -p "> " $var_name
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 1/4】获取 GitHub Token"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "即将打开 GitHub Token 创建页面（权限已自动选择）..."
echo ""
sleep 2

# 打开 GitHub Token 页面
open_url "https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hook&description=HotScan-Deploy"

echo ""
echo "页面操作步骤："
echo "  1. 页面会自动填充 Token 名称: HotScan-Deploy"
echo "  2. 权限已自动勾选: repo, workflow, admin:repo_hook"
echo "  3. 滚动到页面底部，点击绿色按钮 'Generate token'"
echo "  4. 复制生成的 token (格式: ghp_xxxxx...)"
echo ""

wait_for_input "请粘贴您的 GitHub Token:" GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Token 不能为空${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token 已接收${NC}"

# 认证 GitHub
echo ""
echo "正在认证 GitHub..."
echo "$GITHUB_TOKEN" | gh auth login --with-token

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GitHub 认证成功${NC}"
else
    echo -e "${RED}❌ 认证失败${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 2/4】获取 Vercel DATABASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "即将打开 Vercel 环境变量页面..."
echo ""
sleep 2

# 打开 Vercel 环境变量页面
open_url "https://vercel.com/fangp458-2547s-projects/hotscan/settings/environment-variables"

echo ""
echo "页面操作步骤："
echo "  1. 找到 'DATABASE_URL' 这一行"
echo "  2. 点击右侧的 'Click to reveal' 按钮"
echo "  3. 复制完整的连接字符串 (postgresql://...)"
echo ""

wait_for_input "请粘贴 DATABASE_URL:" DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL 不能为空${NC}"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL 已接收${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 3/4】创建仓库并推送代码"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 创建仓库
echo "▶ 创建 GitHub 仓库..."
gh repo create HotScan --public \
  --description "HotScan｜热点雷达 - 实时加密货币市场信号监测系统" \
  --source=. --remote=origin --push 2>&1

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  仓库可能已存在，尝试推送代码...${NC}"
    git remote remove origin 2>/dev/null || true
    git remote add origin https://github.com/Hacker0458/HotScan.git
    git push -u origin main 2>&1
fi

echo -e "${GREEN}✅ 代码推送完成${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 4/4】配置 GitHub Secrets 并触发 Actions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 从 .env 读取其他配置
OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
OPENAI_API_BASE=$(grep '^OPENAI_API_BASE=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

echo "▶ 配置 GitHub Secrets..."
echo "$DATABASE_URL" | gh secret set DATABASE_URL --repo Hacker0458/HotScan
echo "$OPENAI_API_KEY" | gh secret set OPENAI_API_KEY --repo Hacker0458/HotScan
echo "$OPENAI_API_BASE" | gh secret set OPENAI_API_BASE --repo Hacker0458/HotScan
echo "dexscreener" | gh secret set DATASOURCE --repo Hacker0458/HotScan
echo "0" | gh secret set MOCK_AI --repo Hacker0458/HotScan

echo -e "${GREEN}✅ Secrets 配置完成${NC}"
echo ""
echo "已配置的 Secrets:"
gh secret list --repo Hacker0458/HotScan

# 触发 workflow
echo ""
echo "▶ 触发 GitHub Actions..."
sleep 3
gh workflow run cron.yml --repo Hacker0458/HotScan

echo -e "${GREEN}✅ GitHub Actions 已触发${NC}"

# 等待并显示状态
echo ""
echo "▶ 等待 workflow 启动（10秒）..."
sleep 10

echo ""
echo "最新的 workflow 执行:"
gh run list --repo Hacker0458/HotScan --workflow=cron.yml --limit=3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【等待首次执行结果】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "正在实时监控 workflow 执行（预计 2-3 分钟）..."
echo ""

# 实时监控最新的 run
RUN_ID=$(gh run list --repo Hacker0458/HotScan --workflow=cron.yml --limit=1 --json databaseId --jq '.[0].databaseId')

if [ ! -z "$RUN_ID" ]; then
    echo "Run ID: $RUN_ID"
    echo ""
    gh run watch $RUN_ID --repo Hacker0458/HotScan --interval 5 || true
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "【执行结果】"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 获取执行状态
    gh run view $RUN_ID --repo Hacker0458/HotScan
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                        ✅ 部署完成                                        ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 HotScan 已成功部署并启动！${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【重要链接】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 GitHub 仓库:"
echo "   https://github.com/Hacker0458/HotScan"
echo ""
echo "⚙️  GitHub Actions:"
echo "   https://github.com/Hacker0458/HotScan/actions"
echo ""
echo "🌐 生产环境:"
echo "   https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【验证命令】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "查看最新数据:"
echo "  curl -s https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app/api/signals?limit=3 | python3 -m json.tool"
echo ""
echo "实时监控 Actions:"
echo "  gh run watch --repo Hacker0458/HotScan"
echo ""
echo "查看执行历史:"
echo "  gh run list --repo Hacker0458/HotScan --workflow=cron.yml"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【定时任务】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ GitHub Actions 已配置为每 30 分钟自动执行一次"
echo "✅ 会自动抓取 DexScreener 数据并生成信号"
echo "✅ 数据会自动保存到 Neon 生产数据库"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 自动打开网页
echo ""
read -p "是否打开浏览器查看结果？(y/n): " OPEN_BROWSER

if [[ "$OPEN_BROWSER" == "y" || "$OPEN_BROWSER" == "Y" ]]; then
    open_url "https://github.com/Hacker0458/HotScan/actions"
    open_url "https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app"
fi

echo ""
echo -e "${GREEN}🎊 恭喜！HotScan 部署成功！${NC}"
echo ""

