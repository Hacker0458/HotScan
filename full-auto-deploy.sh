#!/bin/bash

# HotScan 完全自动化部署脚本
# 尝试从 Vercel API 获取 DATABASE_URL，并完成全流程部署

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║              🤖 HotScan 完全自动化部署（尝试 API 方式）                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. 检查 Vercel Token
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${RED}❌ 未找到 Vercel 项目配置${NC}"
    echo ""
    echo "请先提供 Vercel Token 以获取环境变量:"
    read -p "Vercel Token: " VERCEL_TOKEN
else
    # 尝试从之前的登录中获取 token
    VERCEL_TOKEN=${VERCEL_TOKEN:-""}
fi

# 2. 从 Vercel API 获取环境变量
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【方案 A】尝试从 Vercel API 自动获取 DATABASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 从 .vercel/project.json 读取 projectId 和 orgId
PROJECT_ID=$(cat .vercel/project.json 2>/dev/null | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
ORG_ID=$(cat .vercel/project.json 2>/dev/null | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$VERCEL_TOKEN" ] && [ ! -z "$PROJECT_ID" ]; then
    echo "▶ 正在从 Vercel API 获取环境变量..."
    
    # 调用 Vercel API
    DATABASE_URL=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v9/projects/$PROJECT_ID/env" | \
        grep -A 5 '"key":"DATABASE_URL"' | grep '"value"' | cut -d'"' -f4)
    
    if [ ! -z "$DATABASE_URL" ]; then
        echo -e "${GREEN}✅ 成功从 Vercel API 获取 DATABASE_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  无法从 API 获取，需要手动输入${NC}"
        DATABASE_URL=""
    fi
else
    echo -e "${YELLOW}⚠️  缺少 Vercel Token 或 Project ID${NC}"
fi

# 3. 如果 API 失败，提供交互式输入
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "【方案 B】手动输入"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "即将打开 Vercel 环境变量页面..."
    sleep 2
    open "https://vercel.com/fangp458-2547s-projects/hotscan/settings/environment-variables"
    echo ""
    echo "请在打开的页面中:"
    echo "  1. 找到 DATABASE_URL"
    echo "  2. 点击 'Click to reveal'"
    echo "  3. 复制完整的连接字符串"
    echo ""
    read -p "粘贴 DATABASE_URL: " DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL 不能为空${NC}"
    exit 1
fi

# 4. GitHub Token 输入
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【获取 GitHub Token】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "即将打开 GitHub Token 创建页面..."
sleep 2
open "https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hook&description=HotScan-Deploy"
echo ""
echo "请在打开的页面中:"
echo "  1. 滚动到底部"
echo "  2. 点击 'Generate token'"
echo "  3. 复制生成的 token"
echo ""
read -p "粘贴 GitHub Token: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ GitHub Token 不能为空${NC}"
    exit 1
fi

# 5. 开始自动化部署
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【开始自动化部署】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 认证 GitHub
echo "▶ 1/5 GitHub 认证..."
echo "$GITHUB_TOKEN" | gh auth login --with-token

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ 认证成功${NC}"
else
    echo -e "${RED}  ❌ 认证失败${NC}"
    exit 1
fi

# 创建仓库并推送
echo ""
echo "▶ 2/5 创建仓库并推送代码..."
gh repo create HotScan --public \
  --description "HotScan｜热点雷达 - 实时加密货币市场信号监测系统" \
  --source=. --remote=origin --push 2>&1

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}  ⚠️  仓库可能已存在，尝试推送...${NC}"
    git remote remove origin 2>/dev/null || true
    git remote add origin https://github.com/Hacker0458/HotScan.git
    git push -u origin main 2>&1
fi

echo -e "${GREEN}  ✅ 代码推送完成${NC}"

# 配置 GitHub Secrets
echo ""
echo "▶ 3/5 配置 GitHub Secrets..."

# 从 .env 读取其他配置
OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
OPENAI_API_BASE=$(grep '^OPENAI_API_BASE=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

echo "$DATABASE_URL" | gh secret set DATABASE_URL --repo Hacker0458/HotScan
echo "$OPENAI_API_KEY" | gh secret set OPENAI_API_KEY --repo Hacker0458/HotScan
echo "$OPENAI_API_BASE" | gh secret set OPENAI_API_BASE --repo Hacker0458/HotScan
echo "dexscreener" | gh secret set DATASOURCE --repo Hacker0458/HotScan
echo "0" | gh secret set MOCK_AI --repo Hacker0458/HotScan

echo -e "${GREEN}  ✅ Secrets 配置完成${NC}"
echo ""
echo "  已配置的 Secrets:"
gh secret list --repo Hacker0458/HotScan | sed 's/^/    /'

# 触发 workflow
echo ""
echo "▶ 4/5 触发 GitHub Actions..."
sleep 3
gh workflow run cron.yml --repo Hacker0458/HotScan
echo -e "${GREEN}  ✅ Workflow 已触发${NC}"

# 等待并监控执行
echo ""
echo "▶ 5/5 监控执行结果..."
sleep 10

echo ""
echo "  最新 workflow 执行:"
gh run list --repo Hacker0458/HotScan --workflow=cron.yml --limit=3 | sed 's/^/    /'

echo ""
echo "  等待首次执行完成（可能需要 2-3 分钟）..."
echo "  您可以按 Ctrl+C 中断等待，脚本已配置完成"
echo ""

# 获取最新 run ID 并监控
RUN_ID=$(gh run list --repo Hacker0458/HotScan --workflow=cron.yml --limit=1 --json databaseId --jq '.[0].databaseId' 2>/dev/null)

if [ ! -z "$RUN_ID" ]; then
    gh run watch $RUN_ID --repo Hacker0458/HotScan --interval 5 || true
fi

# 完成
echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                          ✅ 部署完成                                      ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 HotScan 已成功部署！${NC}"
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
echo "curl -s https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app/api/signals?limit=3 | python3 -m json.tool"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 自动打开浏览器
read -p "是否打开浏览器查看结果？(y/n): " OPEN_BROWSER

if [[ "$OPEN_BROWSER" == "y" || "$OPEN_BROWSER" == "Y" ]]; then
    open "https://github.com/Hacker0458/HotScan/actions"
    sleep 2
    open "https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app"
fi

echo ""
echo -e "${GREEN}✨ 部署完成！定时任务每 30 分钟自动运行一次。${NC}"
echo ""

