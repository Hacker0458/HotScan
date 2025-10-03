#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【HotScan 快速部署脚本】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查是否需要创建 GitHub Token
if ! gh auth status &> /dev/null; then
    echo "需要 GitHub Token 来完成自动化配置"
    echo ""
    echo "请访问以下网址创建 Personal Access Token:"
    echo "https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hook"
    echo ""
    echo "需要的权限:"
    echo "  ✓ repo (完整仓库访问)"
    echo "  ✓ workflow (GitHub Actions)"
    echo "  ✓ admin:repo_hook (Webhooks)"
    echo ""
    read -p "请粘贴您的 GitHub Token: " GITHUB_TOKEN
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "❌ Token 不能为空"
        exit 1
    fi
    
    echo "$GITHUB_TOKEN" | gh auth login --with-token
    
    if [ $? -eq 0 ]; then
        echo "✅ GitHub 认证成功"
    else
        echo "❌ 认证失败"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 1】创建 GitHub 仓库并推送代码"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 创建仓库
gh repo create HotScan --public \
  --description "HotScan｜热点雷达 - 实时加密货币市场信号监测系统，基于 DexScreener 数据和 AI 分析" \
  --source=. --remote=origin --push

if [ $? -eq 0 ]; then
    echo "✅ 仓库创建并推送成功"
else
    echo "⚠️  仓库可能已存在，尝试推送..."
    git push -u origin main 2>&1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 2】配置 GitHub Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 从 .env 读取值
OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
OPENAI_API_BASE=$(grep '^OPENAI_API_BASE=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

echo "需要配置以下 GitHub Secrets:"
echo ""
echo "1. DATABASE_URL - 从 Vercel 获取"
echo "   请访问: https://vercel.com/fangp458-2547s-projects/hotscan/settings/environment-variables"
echo "   点击 DATABASE_URL 的 'Click to reveal' 并复制"
echo ""
read -p "请粘贴 DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 不能为空"
    exit 1
fi

# 设置 Secrets
echo ""
echo "正在设置 GitHub Secrets..."

echo "$DATABASE_URL" | gh secret set DATABASE_URL
echo "$OPENAI_API_KEY" | gh secret set OPENAI_API_KEY
echo "$OPENAI_API_BASE" | gh secret set OPENAI_API_BASE
echo "dexscreener" | gh secret set DATASOURCE
echo "0" | gh secret set MOCK_AI

echo ""
echo "✅ GitHub Secrets 配置完成"
echo ""
echo "验证:"
gh secret list

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【步骤 3】触发 GitHub Actions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 等待 GitHub Actions 文件同步
sleep 5

# 手动触发 workflow
gh workflow run cron.yml

echo ""
echo "✅ GitHub Actions 已触发"
echo ""
echo "查看执行状态:"
echo "  gh run list --workflow=cron.yml --limit=1"
echo ""
echo "或访问:"
echo "  https://github.com/Hacker0458/HotScan/actions"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 配置完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

