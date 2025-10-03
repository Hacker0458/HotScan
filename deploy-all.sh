#!/bin/bash

# HotScan 一键部署脚本
# 使用方法: bash deploy-all.sh <GITHUB_TOKEN> <DATABASE_URL>

set -e

GITHUB_TOKEN="$1"
DATABASE_URL="$2"

if [ -z "$GITHUB_TOKEN" ] || [ -z "$DATABASE_URL" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "【HotScan 一键部署】"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "使用方法:"
    echo "  bash deploy-all.sh <GITHUB_TOKEN> <DATABASE_URL>"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "【步骤 1】获取 GitHub Token"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "访问（会自动选择权限）:"
    echo "👉 https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hook&description=HotScan-Deploy"
    echo ""
    echo "点击 'Generate token' 并复制"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "【步骤 2】获取 DATABASE_URL"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "访问 Vercel:"
    echo "👉 https://vercel.com/fangp458-2547s-projects/hotscan/settings/environment-variables"
    echo ""
    echo "点击 DATABASE_URL 的 'Click to reveal' 并复制"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "【示例】"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "bash deploy-all.sh \\"
    echo "  ghp_xxxxxxxxxxxxxxxxxxxx \\"
    echo "  'postgresql://user:pass@host/db'"
    echo ""
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【HotScan 自动部署开始】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. GitHub 认证
echo "▶ 1/5 GitHub 认证..."
echo "$GITHUB_TOKEN" | gh auth login --with-token
if [ $? -eq 0 ]; then
    echo "  ✅ 认证成功"
else
    echo "  ❌ 认证失败"
    exit 1
fi

# 2. 创建仓库并推送
echo ""
echo "▶ 2/5 创建仓库并推送代码..."
gh repo create HotScan --public \
  --description "HotScan｜热点雷达 - 实时加密货币市场信号监测系统" \
  --source=. --remote=origin --push 2>&1

if [ $? -ne 0 ]; then
    echo "  ⚠️  仓库可能已存在，尝试推送..."
    git push -u origin main 2>&1 || true
fi
echo "  ✅ 代码推送完成"

# 3. 配置 GitHub Secrets
echo ""
echo "▶ 3/5 配置 GitHub Secrets..."

# 从 .env 读取
OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
OPENAI_API_BASE=$(grep '^OPENAI_API_BASE=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

echo "$DATABASE_URL" | gh secret set DATABASE_URL --repo Hacker0458/HotScan
echo "$OPENAI_API_KEY" | gh secret set OPENAI_API_KEY --repo Hacker0458/HotScan
echo "$OPENAI_API_BASE" | gh secret set OPENAI_API_BASE --repo Hacker0458/HotScan
echo "dexscreener" | gh secret set DATASOURCE --repo Hacker0458/HotScan
echo "0" | gh secret set MOCK_AI --repo Hacker0458/HotScan

echo "  ✅ Secrets 配置完成"
echo ""
echo "  验证:"
gh secret list --repo Hacker0458/HotScan | head -10

# 4. 等待并触发 workflow
echo ""
echo "▶ 4/5 触发 GitHub Actions..."
sleep 5
gh workflow run cron.yml --repo Hacker0458/HotScan

echo "  ✅ Workflow 已触发"

# 5. 等待并显示状态
echo ""
echo "▶ 5/5 等待执行结果（30秒）..."
sleep 30

echo ""
echo "  最新执行:"
gh run list --repo Hacker0458/HotScan --workflow=cron.yml --limit=1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【部署完成】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ GitHub 仓库: https://github.com/Hacker0458/HotScan"
echo "✅ GitHub Actions: https://github.com/Hacker0458/HotScan/actions"
echo "✅ 生产环境: https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app"
echo ""
echo "查看实时日志:"
echo "  gh run watch --repo Hacker0458/HotScan"
echo ""
echo "验证数据更新:"
echo "  curl -s https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app/api/signals?limit=3 | python3 -m json.tool"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

