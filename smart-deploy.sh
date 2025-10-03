#!/bin/bash
# 智能部署 - 使用 API 获取配置

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║              🤖 智能自动部署（使用 Vercel Token）                        ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# 使用之前提供的 Vercel Token
VERCEL_TOKEN="DVgcH5HMWBPILpZK8DB8KhVN"

# 从 .vercel/project.json 获取项目信息
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    echo "✓ Project ID: $PROJECT_ID"
    
    # 调用 Vercel API 获取环境变量
    echo "▶ 从 Vercel API 获取 DATABASE_URL..."
    
    RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v9/projects/$PROJECT_ID/env")
    
    # 提取 DATABASE_URL
    DATABASE_URL=$(echo "$RESPONSE" | grep -A 10 '"key":"DATABASE_URL"' | grep '"value"' | head -1 | sed 's/.*"value":"\([^"]*\)".*/\1/')
    
    if [ ! -z "$DATABASE_URL" ]; then
        echo "✅ 成功获取 DATABASE_URL!"
        echo "   ${DATABASE_URL:0:30}...${DATABASE_URL: -20}"
    else
        echo "⚠️  API 返回:"
        echo "$RESPONSE" | head -5
    fi
fi

# 如果还是没有，打开浏览器
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "⚠️  API 自动获取失败"
    echo "即将打开 Vercel 页面..."
    sleep 2
    open "https://vercel.com/fangp458-2547s-projects/hotscan/settings/environment-variables"
    echo ""
    read -p "请粘贴 DATABASE_URL: " DATABASE_URL
fi

# GitHub Token
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "即将打开 GitHub Token 创建页面..."
sleep 2
open "https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hook&description=HotScan-Deploy"
echo ""
read -p "请粘贴 GitHub Token: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ] || [ -z "$DATABASE_URL" ]; then
    echo "❌ 缺少必要参数"
    exit 1
fi

# 执行部署
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 开始自动部署..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

bash deploy-all.sh "$GITHUB_TOKEN" "$DATABASE_URL"

